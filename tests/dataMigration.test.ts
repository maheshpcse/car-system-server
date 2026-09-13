import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

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
