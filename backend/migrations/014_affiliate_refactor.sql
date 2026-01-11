-- =====================================================
-- MIGRATION: Refactoring Affiliate & Purchase System
-- Date: 2026-01-11
-- =====================================================

-- =====================================================
-- 1. CREATE NEW TABLES (Minimized - only 2 new tables)
-- =====================================================

-- Affiliate Partnerships: User joins as affiliate to promote org events
CREATE TABLE IF NOT EXISTS `affiliate_partnerships` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT 'Affiliate user',
  `event_id` BIGINT NOT NULL COMMENT 'Target event to promote',
  `organization_id` BIGINT NOT NULL,
  `unique_code` VARCHAR(50) NOT NULL COMMENT 'Promo code: EVENTNAME-USERID',
  `commission_percentage` DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  `phone` VARCHAR(20) DEFAULT NULL,
  `bank_name` VARCHAR(50) DEFAULT NULL,
  `bank_account` VARCHAR(50) DEFAULT NULL,
  `bank_account_name` VARCHAR(100) DEFAULT NULL,
  `social_media` VARCHAR(255) DEFAULT NULL COMMENT 'Instagram/TikTok/etc',
  `status` ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `approved_at` DATETIME DEFAULT NULL,
  `approved_by` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_affiliate_event` (`user_id`, `event_id`),
  UNIQUE KEY `uk_unique_code` (`unique_code`),
  KEY `fk_ap_user` (`user_id`),
  KEY `fk_ap_event` (`event_id`),
  KEY `fk_ap_org` (`organization_id`),
  CONSTRAINT `fk_ap_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ap_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ap_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Ad Banners for advertisements
CREATE TABLE IF NOT EXISTS `ad_banners` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `target_url` VARCHAR(500) DEFAULT NULL,
  `placement` ENUM('HOME_SLIDER','SIDEBAR','FOOTER') NOT NULL,
  `start_date` DATE DEFAULT NULL,
  `end_date` DATE DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `order_index` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_by` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 2. ADD COLUMN FOR PACKAGE PRICING (Bundling)
-- =====================================================
-- Add package_price to events for "Buy All Sessions" bundle
-- Note: Run only if column doesn't exist yet
ALTER TABLE `events` 
ADD COLUMN `package_price` DECIMAL(15,2) DEFAULT NULL 
COMMENT 'Price for buying all sessions as bundle (null = no bundle)';

-- =====================================================
-- 3. ADD CART TABLE (Simplified - reuse purchases flow)
-- =====================================================
-- Cart stores items before checkout
CREATE TABLE IF NOT EXISTS `carts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `affiliate_code` VARCHAR(50) DEFAULT NULL COMMENT 'Applied affiliate promo code',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cart_user` (`user_id`),
  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `cart_id` BIGINT NOT NULL,
  `item_type` ENUM('SESSION','EVENT_PACKAGE') NOT NULL DEFAULT 'SESSION',
  `session_id` BIGINT DEFAULT NULL,
  `event_id` BIGINT DEFAULT NULL COMMENT 'For EVENT_PACKAGE type',
  `price` DECIMAL(15,2) NOT NULL,
  `added_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ci_cart` (`cart_id`),
  KEY `fk_ci_session` (`session_id`),
  KEY `fk_ci_event` (`event_id`),
  CONSTRAINT `fk_ci_cart` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ci_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ci_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 5. WITHDRAWAL REQUEST TABLE (Centralized to Admin)
-- =====================================================
-- All withdrawals must be requested and approved by admin
CREATE TABLE IF NOT EXISTS `withdrawal_requests` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `requester_type` ENUM('ORGANIZATION', 'AFFILIATE') NOT NULL,
  `requester_id` BIGINT NOT NULL COMMENT 'org_id for ORGANIZATION, user_id for AFFILIATE',
  `amount` DECIMAL(15,2) NOT NULL,
  `bank_name` VARCHAR(50) NOT NULL,
  `bank_account` VARCHAR(50) NOT NULL,
  `bank_account_name` VARCHAR(100) NOT NULL,
  `notes` TEXT DEFAULT NULL COMMENT 'Optional notes from requester',
  `status` ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  `admin_notes` TEXT DEFAULT NULL COMMENT 'Admin response/notes',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `processed_at` DATETIME DEFAULT NULL,
  `processed_by` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_wr_requester` (`requester_type`, `requester_id`),
  KEY `idx_wr_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- =====================================================
-- 6. CLEANUP OLD AFFILIATE TABLES (RUN AFTER TESTING)
-- =====================================================
-- UNCOMMENT THESE AFTER VERIFYING NEW SYSTEM WORKS

-- First remove FK from events
-- ALTER TABLE `events` DROP FOREIGN KEY `fk_events_affiliate`;
-- ALTER TABLE `events` DROP COLUMN `affiliate_submission_id`;

-- Then drop old tables
-- DROP TABLE IF EXISTS `affiliate_ledgers`;
-- DROP TABLE IF EXISTS `affiliate_submission_files`;
-- DROP TABLE IF EXISTS `affiliate_submission_videos`;
-- DROP TABLE IF EXISTS `affiliate_submissions`;
