import mongoose from 'mongoose';
import { hash } from 'bcryptjs';
import User from '@/models/User';
import System from '@/models/System';
import ESP from '@/models/ESP';
import Prediction from '@/models/Prediction';
import { connectDB } from '@/lib/db';

export type LineKind = 'plain' | 'info' | 'success' | 'error';
export interface Line {
  text: string;
  kind: LineKind;
}
export interface CommandResult {
  ok: boolean;
  lines: Line[];
}

type FlagMap = Map<string, string[]>;

const VERBS: Record<string, string> = {
  new: 'new',
  get: 'get',
  set: 'set',
  update: 'set',
  remove: 'remove',
  delete: 'remove',
};

const NOUNS: Record<string, string> = {
  user: 'user',
  users: 'user',
  system: 'system',
  systems: 'system',
  esp: 'esp',
  esps: 'esp',
  prediction: 'prediction',
  predictions: 'prediction',
};

const error = (text: string): CommandResult => ({
  ok: false,
  lines: [{ text, kind: 'error' }],
});

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;

  for (const ch of input) {
    if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

function parseFlags(tokens: string[]): FlagMap | string {
  const flags: FlagMap = new Map();
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.length < 2 || !token.startsWith('-')) {
      return `unexpected argument "${token}". Flags must start with "-" (e.g. -Name "value").`;
    }
    const name = token.slice(1).toLowerCase();
    i += 1;
    if (i >= tokens.length) {
      return `missing value for -${name}.`;
    }
    const values = flags.get(name) ?? [];
    values.push(tokens[i]);
    flags.set(name, values);
    i += 1;
  }
  return flags;
}

function first(flags: FlagMap, name: string): string | undefined {
  return (flags.get(name) ?? [])[0];
}

function validId(value: string): mongoose.Types.ObjectId | null {
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
}

type IdListResult =
  | { ok: true; ids: mongoose.Types.ObjectId[] }
  | { ok: false; message: string };

function collectIds(flags: FlagMap, name: string): IdListResult {
  const values = flags.get(name) ?? [];
  const ids: mongoose.Types.ObjectId[] = [];
  for (const value of values) {
    const oid = validId(value);
    if (!oid) {
      return { ok: false, message: `invalid ObjectId for -${name}: "${value}"` };
    }
    ids.push(oid);
  }
  return { ok: true, ids };
}

type IdResult = { ok: true; id: mongoose.Types.ObjectId } | { ok: false; message: string };

function requireId(flags: FlagMap): IdResult {
  const raw = first(flags, 'id');
  if (!raw) {
    return { ok: false, message: 'this command requires -Id <id>.' };
  }
  const oid = validId(raw);
  if (!oid) {
    return { ok: false, message: `invalid ObjectId for -Id: "${raw}"` };
  }
  return { ok: true, id: oid };
}

function pushDocs(lines: Line[], docs: unknown[], noun: string): void {
  if (docs.length === 0) {
    lines.push({ text: `no ${noun} found.`, kind: 'plain' });
    return;
  }
  docs.forEach((doc, i) => {
    const plain =
      typeof (doc as { toObject?: () => unknown }).toObject === 'function'
        ? (doc as { toObject: () => unknown }).toObject()
        : doc;
    for (const line of JSON.stringify(plain, null, 2).split('\n')) {
      lines.push({ text: `  ${line}`, kind: 'plain' });
    }
    if (i < docs.length - 1) lines.push({ text: '', kind: 'plain' });
  });
}

function parseCommandPair(value: string): string | { name: string; value: string } {
  const eq = value.indexOf('=');
  if (eq === -1) {
    return `invalid -Command "${value}", expected "name=value".`;
  }
  return { name: value.slice(0, eq), value: value.slice(eq + 1) };
}

function parseReading(value: string): string | Record<string, unknown> {
  const parts = value.split('|');
  if (parts.length !== 5) {
    return `invalid -Reading "${value}", expected "type|node|value|date|time".`;
  }
  const [type, nodeStr, jsonValue, dateStr, time] = parts;
  const node = Number(nodeStr);
  if (!Number.isInteger(node)) {
    return `invalid node "${nodeStr}" in -Reading, must be an integer.`;
  }
  let parsedValue: unknown;
  try {
    parsedValue = JSON.parse(jsonValue);
  } catch {
    return `invalid value JSON "${jsonValue}" in -Reading.`;
  }
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return `invalid date "${dateStr}" in -Reading.`;
  }
  return { type, node, value: parsedValue, date, time };
}

function parsePrediction(value: string): string | { name: string; values: unknown[] } {
  const match = value.match(/^([^=]+)=\[(.*)\]$/);
  if (!match) {
    return `invalid -Prediction "${value}", expected "name=[v1,v2,...]".`;
  }
  let values: unknown;
  try {
    values = JSON.parse(`[${match[2]}]`);
  } catch {
    return `invalid values in -Prediction "${value}".`;
  }
  if (!Array.isArray(values)) {
    return `-Prediction values must be a JSON array.`;
  }
  return { name: match[1].trim(), values };
}

const collectPairs = (flags: FlagMap, name: string, parse: (v: string) => string | Record<string, unknown>) => {
  const values = flags.get(name) ?? [];
  const pairs: Record<string, unknown>[] = [];
  for (const value of values) {
    const parsed = parse(value);
    if (typeof parsed === 'string') return parsed;
    pairs.push(parsed);
  }
  return pairs;
};

// ---- Users ----------------------------------------------------------------

async function handleUser(verb: string, flags: FlagMap): Promise<CommandResult> {
  const lines: Line[] = [];

  if (verb === 'new') {
    const name = first(flags, 'name');
    const mail = first(flags, 'mail');
    const password = first(flags, 'password');
    if (!name) return error('New-User requires -Name "<name>".');
    if (!mail) return error('New-User requires -Mail "<mail>".');
    if (!password) return error('New-User requires -Password "<password>".');

    const systems = collectIds(flags, 'system');
    if (!systems.ok) return error(systems.message);
    const data = collectIds(flags, 'data');
    if (!data.ok) return error(data.message);

    const doc = await User.create({
      Name: name,
      Mail: mail,
      Password: await hash(password, 10),
      Systems: systems.ids,
      Data: data.ids,
    });
    lines.push({ text: `Created user ${doc._id}`, kind: 'success' });
    pushDocs(lines, [doc], 'user');
    return { ok: true, lines };
  }

  if (verb === 'get') {
    if (flags.has('id')) {
      const raw = first(flags, 'id') as string;
      const oid = validId(raw);
      if (!oid) return error(`invalid ObjectId for -Id: "${raw}"`);
      const doc = await User.findById(oid);
      if (!doc) return error(`user ${oid} not found.`);
      pushDocs(lines, [doc], 'user');
      return { ok: true, lines };
    }
    const mail = first(flags, 'mail');
    if (mail) {
      const doc = await User.findOne({ Mail: mail });
      if (!doc) return error(`user with mail "${mail}" not found.`);
      pushDocs(lines, [doc], 'user');
      return { ok: true, lines };
    }
    const docs = await User.find();
    lines.push({ text: `${docs.length} user${docs.length === 1 ? '' : 's'}`, kind: 'info' });
    pushDocs(lines, docs, 'user');
    return { ok: true, lines };
  }

  if (verb === 'set') {
    const id = requireId(flags);
    if (!id.ok) return error(id.message);

    const update: Record<string, unknown> = {};
    const name = first(flags, 'name');
    if (name !== undefined) update.Name = name;
    const mail = first(flags, 'mail');
    if (mail !== undefined) update.Mail = mail;
    const password = first(flags, 'password');
    if (password !== undefined) update.Password = await hash(password, 10);
    const systems = collectIds(flags, 'system');
    if (!systems.ok) return error(systems.message);
    if (flags.has('system')) update.Systems = systems.ids;
    const data = collectIds(flags, 'data');
    if (!data.ok) return error(data.message);
    if (flags.has('data')) update.Data = data.ids;

    if (Object.keys(update).length === 0) {
      return error('Set-User needs at least one field: -Name, -Mail, -Password, -System or -Data.');
    }

    const doc = await User.findByIdAndUpdate(id.id, update, { new: true, runValidators: true });
    if (!doc) return error(`user ${id.id} not found.`);
    lines.push({ text: `Updated user ${doc._id}`, kind: 'success' });
    pushDocs(lines, [doc], 'user');
    return { ok: true, lines };
  }

  const id = requireId(flags);
  if (!id.ok) return error(id.message);
  const doc = await User.findByIdAndDelete(id.id);
  if (!doc) return error(`user ${id.id} not found.`);
  lines.push({ text: `Removed user ${doc._id}`, kind: 'success' });
  return { ok: true, lines };
}

// ---- Systems ---------------------------------------------------------------

async function handleSystem(verb: string, flags: FlagMap): Promise<CommandResult> {
  const lines: Line[] = [];

  if (verb === 'new') {
    const commands = collectPairs(flags, 'command', (v) => parseCommandPair(v));
    if (typeof commands === 'string') return error(commands);
    const users = collectIds(flags, 'user');
    if (!users.ok) return error(users.message);
    const esps = collectIds(flags, 'esp');
    if (!esps.ok) return error(esps.message);

    const doc = await System.create({
      users: users.ids,
      commands: commands,
      ESPs: esps.ids,
    });
    lines.push({ text: `Created system ${doc._id}`, kind: 'success' });
    pushDocs(lines, [doc], 'system');
    return { ok: true, lines };
  }

  if (verb === 'get') {
    if (flags.has('id')) {
      const raw = first(flags, 'id') as string;
      const oid = validId(raw);
      if (!oid) return error(`invalid ObjectId for -Id: "${raw}"`);
      const doc = await System.findById(oid);
      if (!doc) return error(`system ${oid} not found.`);
      pushDocs(lines, [doc], 'system');
      return { ok: true, lines };
    }
    const docs = await System.find();
    lines.push({ text: `${docs.length} system${docs.length === 1 ? '' : 's'}`, kind: 'info' });
    pushDocs(lines, docs, 'system');
    return { ok: true, lines };
  }

  if (verb === 'set') {
    const id = requireId(flags);
    if (!id.ok) return error(id.message);

    const update: Record<string, unknown> = {};
    const commands = collectPairs(flags, 'command', (v) => parseCommandPair(v));
    if (typeof commands === 'string') return error(commands);
    if (flags.has('command')) update.commands = commands;
    const users = collectIds(flags, 'user');
    if (!users.ok) return error(users.message);
    if (flags.has('user')) update.users = users.ids;
    const esps = collectIds(flags, 'esp');
    if (!esps.ok) return error(esps.message);
    if (flags.has('esp')) update.ESPs = esps.ids;

    if (Object.keys(update).length === 0) {
      return error('Set-System needs at least one field: -Command, -User or -ESP.');
    }

    const doc = await System.findByIdAndUpdate(id.id, update, { new: true, runValidators: true });
    if (!doc) return error(`system ${id.id} not found.`);
    lines.push({ text: `Updated system ${doc._id}`, kind: 'success' });
    pushDocs(lines, [doc], 'system');
    return { ok: true, lines };
  }

  const id = requireId(flags);
  if (!id.ok) return error(id.message);
  const doc = await System.findByIdAndDelete(id.id);
  if (!doc) return error(`system ${id.id} not found.`);
  lines.push({ text: `Removed system ${doc._id}`, kind: 'success' });
  return { ok: true, lines };
}

// ---- ESPs ------------------------------------------------------------------

async function handleESP(verb: string, flags: FlagMap): Promise<CommandResult> {
  const lines: Line[] = [];

  if (verb === 'new') {
    const devices = flags.get('device') ?? [];
    const readings = collectPairs(flags, 'reading', (v) => parseReading(v));
    if (typeof readings === 'string') return error(readings);

    const doc = await ESP.create({
      readings: readings,
      devices: devices,
      health: {
        status: first(flags, 'status') ?? 'unknown',
        desc: first(flags, 'desc') ?? 'No description provided.',
      },
    });
    lines.push({ text: `Created ESP ${doc._id}`, kind: 'success' });
    pushDocs(lines, [doc], 'ESP');
    return { ok: true, lines };
  }

  if (verb === 'get') {
    if (flags.has('id')) {
      const raw = first(flags, 'id') as string;
      const oid = validId(raw);
      if (!oid) return error(`invalid ObjectId for -Id: "${raw}"`);
      const doc = await ESP.findById(oid);
      if (!doc) return error(`ESP ${oid} not found.`);
      pushDocs(lines, [doc], 'ESP');
      return { ok: true, lines };
    }
    const docs = await ESP.find();
    lines.push({ text: `${docs.length} ESP${docs.length === 1 ? '' : 's'}`, kind: 'info' });
    pushDocs(lines, docs, 'ESP');
    return { ok: true, lines };
  }

  if (verb === 'set') {
    const id = requireId(flags);
    if (!id.ok) return error(id.message);

    const update: Record<string, unknown> = {};
    const readings = collectPairs(flags, 'reading', (v) => parseReading(v));
    if (typeof readings === 'string') return error(readings);
    if (flags.has('reading')) update.readings = readings;
    if (flags.has('device')) update.devices = flags.get('device') ?? [];
    if (flags.has('status') || flags.has('desc')) {
      update.health = {
        status: first(flags, 'status'),
        desc: first(flags, 'desc'),
      };
    }

    if (Object.keys(update).length === 0) {
      return error('Set-ESP needs at least one field: -Reading, -Device, -Status or -Desc.');
    }

    const doc = await ESP.findByIdAndUpdate(id.id, update, { new: true, runValidators: true });
    if (!doc) return error(`ESP ${id.id} not found.`);
    lines.push({ text: `Updated ESP ${doc._id}`, kind: 'success' });
    pushDocs(lines, [doc], 'ESP');
    return { ok: true, lines };
  }

  const id = requireId(flags);
  if (!id.ok) return error(id.message);
  const doc = await ESP.findByIdAndDelete(id.id);
  if (!doc) return error(`ESP ${id.id} not found.`);
  lines.push({ text: `Removed ESP ${doc._id}`, kind: 'success' });
  return { ok: true, lines };
}

// ---- Predictions -----------------------------------------------------------

async function handlePrediction(verb: string, flags: FlagMap): Promise<CommandResult> {
  const lines: Line[] = [];

  if (verb === 'new') {
    const systemRaw = first(flags, 'system');
    if (!systemRaw) return error('New-Prediction requires -System <id>.');
    const systemId = validId(systemRaw);
    if (!systemId) return error(`invalid ObjectId for -System: "${systemRaw}"`);

    const predictions = collectPairs(flags, 'prediction', (v) => parsePrediction(v) as string | Record<string, unknown>);
    if (typeof predictions === 'string') return error(predictions);

    const doc = await Prediction.create({
      system: systemId,
      predictions: predictions,
    });
    lines.push({ text: `Created prediction ${doc._id}`, kind: 'success' });
    pushDocs(lines, [doc], 'prediction');
    return { ok: true, lines };
  }

  if (verb === 'get') {
    if (flags.has('id')) {
      const raw = first(flags, 'id') as string;
      const oid = validId(raw);
      if (!oid) return error(`invalid ObjectId for -Id: "${raw}"`);
      const doc = await Prediction.findById(oid);
      if (!doc) return error(`prediction ${oid} not found.`);
      pushDocs(lines, [doc], 'prediction');
      return { ok: true, lines };
    }
    const docs = await Prediction.find();
    lines.push({ text: `${docs.length} prediction${docs.length === 1 ? '' : 's'}`, kind: 'info' });
    pushDocs(lines, docs, 'prediction');
    return { ok: true, lines };
  }

  if (verb === 'set') {
    const id = requireId(flags);
    if (!id.ok) return error(id.message);

    const update: Record<string, unknown> = {};
    const systemRaw = first(flags, 'system');
    if (systemRaw !== undefined) {
      const systemId = validId(systemRaw);
      if (!systemId) return error(`invalid ObjectId for -System: "${systemRaw}"`);
      update.system = systemId;
    }
    const predictions = collectPairs(flags, 'prediction', (v) => parsePrediction(v) as string | Record<string, unknown>);
    if (typeof predictions === 'string') return error(predictions);
    if (flags.has('prediction')) update.predictions = predictions;

    if (Object.keys(update).length === 0) {
      return error('Set-Prediction needs at least one field: -System or -Prediction.');
    }

    const doc = await Prediction.findByIdAndUpdate(id.id, update, { new: true, runValidators: true });
    if (!doc) return error(`prediction ${id.id} not found.`);
    lines.push({ text: `Updated prediction ${doc._id}`, kind: 'success' });
    pushDocs(lines, [doc], 'prediction');
    return { ok: true, lines };
  }

  const id = requireId(flags);
  if (!id.ok) return error(id.message);
  const doc = await Prediction.findByIdAndDelete(id.id);
  if (!doc) return error(`prediction ${id.id} not found.`);
  lines.push({ text: `Removed prediction ${doc._id}`, kind: 'success' });
  return { ok: true, lines };
}

// ---- Help ------------------------------------------------------------------

const HELP_LINES: Line[] = [
  { text: 'MuTau database terminal', kind: 'info' },
  { text: 'PowerShell-style commands to read and modify Users, Systems, ESPs and Predictions.', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: 'General commands', kind: 'info' },
  { text: '  help                          Show this help', kind: 'plain' },
  { text: '  clear | cls                   Clear the terminal screen', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: 'Command verbs', kind: 'info' },
  { text: '  New-<Item>      Create a record', kind: 'plain' },
  { text: '  Get-<Item>      Read records (all, or one with -Id)', kind: 'plain' },
  { text: '  Set-<Item>      Update a record (adds/updates the given fields)', kind: 'plain' },
  { text: '  Remove-<Item>   Delete a record', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: 'Users', kind: 'info' },
  { text: '  New-User -Name "<name>" -Mail "<mail>" -Password "<password>" [-System <id>]* [-Data <id>]*', kind: 'plain' },
  { text: '  Get-Users | Get-User |-Id <id> |-Mail "<mail>"', kind: 'plain' },
  { text: '  Set-User -Id <id> [-Name "<name>"] [-Mail "<mail>"] [-Password "<pass>"] [-System <id>]* [-Data <id>]*', kind: 'plain' },
  { text: '  Remove-User -Id <id>', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: 'Systems', kind: 'info' },
  { text: '  New-System [-Command "<name>=<value>"]* [-User <id>]* [-ESP <id>]*', kind: 'plain' },
  { text: '  Get-Systems | Get-System -Id <id>', kind: 'plain' },
  { text: '  Set-System -Id <id> [-Command "<name>=<value>"]* [-User <id>]* [-ESP <id>]*', kind: 'plain' },
  { text: '  Remove-System -Id <id>', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: 'ESPs', kind: 'info' },
  { text: '  New-ESP [-Device "<name>"]* [-Reading "<type>|<node>|<value>|<date>|<time>"]* [-Status "<s>"] [-Desc "<d>"]', kind: 'plain' },
  { text: '  Get-ESPs | Get-ESP -Id <id>', kind: 'plain' },
  { text: '  Set-ESP -Id <id> [-Device "<name>"]* [-Reading "<type>|<node>|<value>|<date>|<time>"]* [-Status "<s>"] [-Desc "<d>"]', kind: 'plain' },
  { text: '  Remove-ESP -Id <id>', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: 'Predictions', kind: 'info' },
  { text: '  New-Prediction -System <id> [-Prediction "<name>=[v1,v2,...]"]*', kind: 'plain' },
  { text: '  Get-Predictions | Get-Prediction -Id <id>', kind: 'plain' },
  { text: '  Set-Prediction -Id <id> [-System <id>] [-Prediction "<name>=[v1,v2,...]"]*', kind: 'plain' },
  { text: '  Remove-Prediction -Id <id>', kind: 'plain' },
  { text: '', kind: 'plain' },
  { text: 'Notes', kind: 'info' },
  { text: '  * Flags marked with * may be repeated to pass multiple values. Users pass a list of -System flags.', kind: 'plain' },
  { text: '  <id> is a MongoDB ObjectId, e.g. 507f1f77bcf86cd799439011.', kind: 'plain' },
  { text: '  Values containing spaces must be wrapped in double quotes.', kind: 'plain' },
  { text: '  Set-* with a repeated flag replaces the whole array for that field.', kind: 'plain' },
];

function help(): CommandResult {
  return { ok: true, lines: HELP_LINES };
}

// ---- Entry point -----------------------------------------------------------

const NOUN_HANDLERS: Record<string, (verb: string, flags: FlagMap) => Promise<CommandResult>> = {
  user: handleUser,
  system: handleSystem,
  esp: handleESP,
  prediction: handlePrediction,
};

export async function runCommand(input: string): Promise<CommandResult> {
  try {
    const tokens = tokenize(input);
    if (tokens.length === 0) return { ok: true, lines: [] };

    const head = tokens[0].toLowerCase();
    if (head === 'help' || head === 'get-help' || head === '?') return help();

    const match = tokens[0].match(/^([a-z]+)-([a-z]+)$/i);
    if (!match) {
      return error(`unknown command "${tokens[0]}". Type "help" to list all commands.`);
    }

    const verb = VERBS[match[1].toLowerCase()];
    const noun = NOUNS[match[2].toLowerCase()];
    if (!verb) {
      return error(`unknown verb "${match[1]}". Use New-, Get-, Set- or Remove-.`);
    }
    if (!noun) {
      return error(`unknown noun "${match[2]}". Use User, System, ESP or Prediction.`);
    }

    const flags = parseFlags(tokens.slice(1));
    if (typeof flags === 'string') return error(flags);

    await connectDB();
    return await NOUN_HANDLERS[noun](verb, flags);
  } catch (err) {
    return error(`command failed: ${(err as Error).message}`);
  }
}