-- Migration: add social_link and address to organizations
-- Run this SQL against your database (MySQL/MariaDB)

ALTER TABLE organizations
  ADD COLUMN social_link VARCHAR(255) NULL AFTER website,
  ADD COLUMN address VARCHAR(255) NULL AFTER social_link;

-- Optional: initialize values if you have a default mapping, otherwise leave NULL
-- UPDATE organizations SET social_link = '', address = '' WHERE social_link IS NULL OR address IS NULL;
