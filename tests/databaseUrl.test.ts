import { afterEach, describe, expect, it } from 'vitest';
import { resolveDatabaseUrl } from '../src/config/databaseUrl.js';

const keys = [
  'DATABASE_URL',
  'MYSQLHOST',
  'MYSQLUSER',
  'MYSQLPASSWORD',
  'MYSQLPORT',
  'MYSQLDATABASE',
  'MYSQL_HOST',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'MYSQL_PORT',
  'MYSQL_DATABASE',
] as const;

const snapshot = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    const value = snapshot[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

describe('resolveDatabaseUrl', () => {
  it('prefers an explicit DATABASE_URL', () => {
    process.env.DATABASE_URL = 'mysql://app:secret@db:3306/aurora';
    process.env.MYSQLHOST = 'ignored';
    expect(resolveDatabaseUrl()).toBe('mysql://app:secret@db:3306/aurora');
  });

  it('builds a URL from the Railway MySQL plugin variables', () => {
    delete process.env.DATABASE_URL;
    process.env.MYSQLHOST = 'mysql.railway.internal';
    process.env.MYSQLUSER = 'root';
    process.env.MYSQLPASSWORD = 'p@ss:word';
    process.env.MYSQLPORT = '3306';
    process.env.MYSQLDATABASE = 'railway';
    expect(resolveDatabaseUrl()).toBe(
      'mysql://root:p%40ss%3Aword@mysql.railway.internal:3306/railway',
    );
  });
});
