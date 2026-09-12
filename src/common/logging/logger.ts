import { env } from '../../config/environment.js';

type Level = 'debug' | 'info' | 'warn' | 'error';

const rank: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const SENSITIVE = /password|token|secret|authorization|cookie|refresh|accessToken|reset/i;

function redact(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    out[key] = SENSITIVE.test(key) ? '[redacted]' : redact(item);
  }
  return out;
}

function write(level: Level, message: string, fields?: Record<string, unknown>) {
  if (rank[level] < rank[env.LOG_LEVEL]) return;
  const line = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...((redact(fields) as Record<string, unknown>) ?? {}),
  };
  const serialized = JSON.stringify(line);
  if (level === 'error') process.stderr.write(`${serialized}\n`);
  else process.stdout.write(`${serialized}\n`);
}

export const logger = {
  debug: (message: string, fields?: Record<string, unknown>) => write('debug', message, fields),
  info: (message: string, fields?: Record<string, unknown>) => write('info', message, fields),
  warn: (message: string, fields?: Record<string, unknown>) => write('warn', message, fields),
  error: (message: string, fields?: Record<string, unknown>) => write('error', message, fields),
};
