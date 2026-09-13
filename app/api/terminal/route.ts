import type { NextRequest } from 'next/server';
import { runCommand } from '@/lib/terminal/commands';

export async function POST(request: NextRequest) {
  let command = '';
  try {
    const body = await request.json();
    command = typeof body?.command === 'string' ? body.command : '';
  } catch {
    return Response.json({
      ok: false,
      lines: [{ text: 'invalid request body.', kind: 'error' }],
    });
  }

  const result = await runCommand(command);
  return Response.json(result);
}