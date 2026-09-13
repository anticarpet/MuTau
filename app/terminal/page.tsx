'use client';

import { useEffect, useRef, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

type LineKind = 'plain' | 'info' | 'success' | 'error' | 'prompt';

interface Line {
  id: number;
  text: string;
  kind: LineKind;
}

const COLORS: Record<LineKind, string> = {
  prompt: 'text-[#9cdcfe]',
  info: 'text-[#4fc1ff]',
  success: 'text-[#6ce27a]',
  error: 'text-[#ff7b72]',
  plain: 'text-[#d6e2f0]',
};

let nextId = 1;

const PROMPT = 'PS C:\\Users\\mutau>';

export default function TerminalPage() {
  const [lines, setLines] = useState<Line[]>(() => [
    { id: nextId++, text: 'Windows PowerShell — MuTau database terminal', kind: 'info' },
    { id: nextId++, text: 'Type "help" to list all available commands.', kind: 'plain' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, busy]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function run(cmd: string) {
    if (cmd.trim() === '') return;

    if (cmd.trim().toLowerCase() === 'clear' || cmd.trim().toLowerCase() === 'cls') {
      setLines([]);
      setInput('');
      setHistory((prev) => [...prev, cmd]);
      setHistoryIndex(-1);
      return;
    }

    const echo: Line = { id: nextId++, text: `${PROMPT} ${cmd}`, kind: 'prompt' };
    setLines((prev) => [...prev, echo]);
    setBusy(true);
    try {
      const res = await fetch('/api/terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data: { lines?: { text: string; kind: LineKind }[] } = await res.json();
      const next = (data?.lines ?? []).map((l) => ({
        id: nextId++,
        text: l.text,
        kind: l.kind ?? 'plain',
      }));
      setLines((prev) => [...prev, ...next]);
    } catch {
      setLines((prev) => [
        ...prev,
        { id: nextId++, text: 'Failed to reach the terminal API.', kind: 'error' },
      ]);
    } finally {
      setBusy(false);
    }

    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setInput('');
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      void run(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const index = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(index);
      setInput(history[index]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const index = historyIndex + 1;
      if (index >= history.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(index);
        setInput(history[index]);
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />

      <main className="flex-1 ml-14 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-5xl rounded-lg overflow-hidden border border-black/25 shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#013da8] to-[#0d5fd4] select-none">
            <span className="w-3 h-3 rounded-full bg-[#ff5f5a]" />
            <span className="w-3 h-3 rounded-full bg-[#ffc02e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 text-white/95 text-sm font-semibold tracking-wide">
              Administrator: Windows PowerShell
            </span>
          </div>

          <div
            ref={scrollRef}
            className="bg-[#012456] h-[520px] overflow-y-auto px-5 py-4 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words"
          >
            {lines.map((line) => (
              <div key={line.id} className={COLORS[line.kind]}>
                {line.text || '\u00A0'}
              </div>
            ))}

            <div className="flex items-center gap-2 text-white">
              <span className={COLORS.prompt}>{PROMPT}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                readOnly={busy}
                disabled={busy}
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                aria-label="terminal input"
                className="flex-1 bg-transparent outline-none caret-white disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-1.5 bg-[#001a4a] text-white/70 font-mono text-xs">
            <span>{PROMPT}</span>
            <span className="flex items-center gap-2">
              {busy && <span className="text-[#4fc1ff] animate-pulse">running...</span>}
              <span>UTF-8</span>
              <span>{String(lines.length).padStart(3, '0')} lines</span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}