import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  new URL('../prisma/migrations/20240912130000_seed_aurora_catalog/migration.sql', import.meta.url),
  'utf8',
);

describe('catalogue data migration', () => {
  it('inserts every frontend vehicle id', () => {
    for (const id of [
      'aureon-x1',
      'aureon-v9',
      'velora-gt',
      'velora-estate',
      'nexen-e7',
      'nexen-city',
      'kairo-s',
      'kairo-cross',
      'orion-touring',
      'rivana-xr',
      'solace-ev',
      'ventra-rs',
    ]) {
      expect(sql).toContain(`'${id}'`);
    }
  });

  it('inserts demo personas used by the frontend', () => {
    expect(sql).toContain('maya@demo.aurora');
    expect(sql).toContain('visitor@demo.aurora');
    expect(sql).toContain('daniel@demo.aurora');
    expect(sql).toContain('priya@demo.aurora');
  });
});

describe('username and notification migration', () => {
  const followUp = readFileSync(
    new URL('../prisma/migrations/20240913180000_username_notifications_push/migration.sql', import.meta.url),
    'utf8',
  );

  it('adds usernames for the frontend demo personas', () => {
    expect(followUp).toContain("`username` = 'maya'");
    expect(followUp).toContain("`username` = 'visitor'");
    expect(followUp).toContain("`username` = 'daniel'");
    expect(followUp).toContain("`username` = 'priya'");
  });

  it('adds notification href/kind and push subscriptions', () => {
    expect(followUp).toContain('ADD COLUMN `href`');
    expect(followUp).toContain('CREATE TABLE `push_subscriptions`');
    expect(followUp).toContain('/cars/aureon-x1');
  });
});
