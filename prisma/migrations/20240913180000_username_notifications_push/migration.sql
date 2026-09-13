-- Username login, notification href/kind, and browser push subscriptions.

ALTER TABLE `users` ADD COLUMN `username` VARCHAR(191) NULL;

UPDATE `users` SET `username` = 'maya' WHERE `email` = 'maya@demo.aurora';
UPDATE `users` SET `username` = 'visitor' WHERE `email` = 'visitor@demo.aurora';
UPDATE `users` SET `username` = 'daniel' WHERE `email` = 'daniel@demo.aurora';
UPDATE `users` SET `username` = 'priya' WHERE `email` = 'priya@demo.aurora';

UPDATE `users`
SET `username` = CONCAT(LOWER(SUBSTRING_INDEX(`email`, '@', 1)), '_', LEFT(`id`, 6))
WHERE `username` IS NULL;

ALTER TABLE `users` MODIFY `username` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `users_username_key` ON `users`(`username`);

ALTER TABLE `notifications` ADD COLUMN `href` VARCHAR(512) NULL;
ALTER TABLE `notifications` ADD COLUMN `kind` VARCHAR(191) NOT NULL DEFAULT 'info';

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `body`, `href`, `kind`, `read_at`, `created_at`)
SELECT
  CONCAT('n_demo_', u.`persona_id`, '_x1'),
  u.`id`,
  'vehicle',
  'Aureon X1 Performance now available',
  'A new variant has been added to the configurator.',
  '/cars/aureon-x1',
  'vehicle',
  NULL,
  DATE_SUB(NOW(3), INTERVAL 18 MINUTE)
FROM `users` u
WHERE u.`persona_id` IN ('customer', 'visitor', 'advisor', 'admin')
  AND NOT EXISTS (
    SELECT 1 FROM `notifications` n WHERE n.`id` = CONCAT('n_demo_', u.`persona_id`, '_x1')
  );

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `body`, `href`, `kind`, `read_at`, `created_at`)
SELECT
  CONCAT('n_demo_', u.`persona_id`, '_showroom'),
  u.`id`,
  'info',
  'Showroom lighting updated',
  'Studio mode now supports dark environments.',
  '/showroom',
  'info',
  NULL,
  DATE_SUB(NOW(3), INTERVAL 300 MINUTE)
FROM `users` u
WHERE u.`persona_id` IN ('customer', 'visitor', 'advisor', 'admin')
  AND NOT EXISTS (
    SELECT 1 FROM `notifications` n WHERE n.`id` = CONCAT('n_demo_', u.`persona_id`, '_showroom')
  );

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `body`, `href`, `kind`, `read_at`, `created_at`)
SELECT
  CONCAT('n_demo_', u.`persona_id`, '_build'),
  u.`id`,
  'success',
  'Your saved build is ready',
  'Velora GT · Deep Crimson · Forged 21"',
  '/saved-builds',
  'success',
  DATE_SUB(NOW(3), INTERVAL 1560 MINUTE),
  DATE_SUB(NOW(3), INTERVAL 1560 MINUTE)
FROM `users` u
WHERE u.`persona_id` IN ('customer', 'visitor', 'advisor', 'admin')
  AND NOT EXISTS (
    SELECT 1 FROM `notifications` n WHERE n.`id` = CONCAT('n_demo_', u.`persona_id`, '_build')
  );

CREATE TABLE `push_subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `endpoint` TEXT NOT NULL,
    `endpoint_hash` VARCHAR(191) NOT NULL,
    `p256dh` VARCHAR(255) NOT NULL,
    `auth` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `push_subscriptions_endpoint_hash_key`(`endpoint_hash`),
    INDEX `push_subscriptions_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `push_subscriptions` ADD CONSTRAINT `push_subscriptions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
