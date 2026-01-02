-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 02, 2026 at 11:59 PM
-- Server version: 8.0.30
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `proyek3db`
--

-- --------------------------------------------------------

--
-- Table structure for table `affiliate_applications`
--

CREATE TABLE `affiliate_applications` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `motivation` text,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `affiliate_balances`
--

CREATE TABLE `affiliate_balances` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `balance` decimal(15,2) DEFAULT '0.00',
  `total_earned` decimal(15,2) DEFAULT '0.00',
  `total_withdrawn` decimal(15,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `affiliate_balances`
--

INSERT INTO `affiliate_balances` (`id`, `user_id`, `balance`, `total_earned`, `total_withdrawn`, `updated_at`) VALUES
(1, 17, '27900.00', '27900.00', '0.00', '2026-01-02 23:51:33'),
(3, 18, '9000.00', '9000.00', '0.00', '2026-01-02 23:05:04');

-- --------------------------------------------------------

--
-- Table structure for table `affiliate_ledgers`
--

CREATE TABLE `affiliate_ledgers` (
  `id` bigint NOT NULL,
  `affiliate_submission_id` bigint NOT NULL,
  `order_id` varchar(100) NOT NULL,
  `transaction_amount` decimal(15,2) NOT NULL,
  `platform_fee` decimal(15,2) NOT NULL,
  `affiliate_amount` decimal(15,2) NOT NULL,
  `is_paid_out` tinyint(1) DEFAULT '0',
  `paid_out_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `affiliate_ledgers`
--

INSERT INTO `affiliate_ledgers` (`id`, `affiliate_submission_id`, `order_id`, `transaction_amount`, `platform_fee`, `affiliate_amount`, `is_paid_out`, `paid_out_at`, `created_at`) VALUES
(1, 7, 'ORDER-1767269119-17-18', '10000.00', '1000.00', '9000.00', 1, NULL, '2026-01-01 19:05:45'),
(2, 7, 'ORDER-1767269157-19-18', '1000.00', '100.00', '900.00', 1, NULL, '2026-01-01 19:06:19'),
(3, 8, 'ORDER-1767395084-21-8', '10000.00', '1000.00', '9000.00', 1, NULL, '2026-01-03 06:05:04'),
(4, 7, 'ORDER-1767395177-17-8', '10000.00', '1000.00', '9000.00', 1, NULL, '2026-01-03 06:06:32'),
(5, 7, 'ORDER-1767397885-18-8', '10000.00', '1000.00', '9000.00', 1, NULL, '2026-01-03 06:51:33');

-- --------------------------------------------------------

--
-- Table structure for table `affiliate_submissions`
--

CREATE TABLE `affiliate_submissions` (
  `id` bigint NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `event_title` varchar(255) NOT NULL,
  `event_description` text,
  `event_price` bigint DEFAULT '0',
  `event_category` varchar(100) DEFAULT 'Teknologi',
  `poster_url` text,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_account_holder` varchar(150) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `review_note` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `video_url` text,
  `video_title` varchar(255) DEFAULT NULL,
  `file_url` text,
  `file_title` varchar(255) DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `event_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `affiliate_submissions`
--

INSERT INTO `affiliate_submissions` (`id`, `full_name`, `email`, `phone`, `event_title`, `event_description`, `event_price`, `event_category`, `poster_url`, `bank_name`, `bank_account_number`, `bank_account_holder`, `status`, `reviewed_by`, `reviewed_at`, `review_note`, `created_at`, `updated_at`, `video_url`, `video_title`, `file_url`, `file_title`, `user_id`, `event_id`) VALUES
(7, 'budi afiliate', 'budi@gmail.com', '084316516561', 'event afiliate', 'gatau cape', 10000, 'Teknologi', 'uploads\\posters\\1767012238524937900_3db4d762.png', 'Bca', '8964165', 'budi', 'APPROVED', 11, '2025-12-29 19:44:39', 'okei', '2025-12-29 19:43:58', '2025-12-29 19:44:39', 'uploads\\affiliate_videos\\1767012238557368700_8e15e952.mp4', '1', 'uploads\\affiliate_files\\1767012238566448300_18a152c8.pdf', '1 m', 17, NULL),
(8, 'aku baru', 'baru@gmail.com', '081354984231', 'event affiliate yang paling baru ', 'membuat kursus yang sangat seru', 10000, 'Seni & Kreativitas', 'uploads\\posters\\1767261654180902300_355ae05e.png', 'mandiri', '852169484613', 'yanto', 'APPROVED', 11, '2026-01-01 17:02:09', '', '2026-01-01 17:00:54', '2026-01-01 17:02:09', 'uploads\\affiliate_videos\\1767261654188405900_932a4972.mp4', '1', 'uploads\\affiliate_files\\1767261654194831900_877f0ad7.pdf', 'aDASd', 18, NULL),
(9, 'aku baru', 'baru@gmail.com', '081354984231', 'awdsad', 'dsada', 9997, 'Teknologi', 'uploads\\posters\\1767261990969904100_9c7c56be.png', 'asdas', 'sadas', 'asda', 'APPROVED', 11, '2026-01-01 17:07:13', '', '2026-01-01 17:06:30', '2026-01-01 17:07:13', 'uploads\\affiliate_videos\\1767261990993128800_e5a3aeca.mp4', 'aaa', '', '', 18, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `affiliate_submission_files`
--

CREATE TABLE `affiliate_submission_files` (
  `id` bigint NOT NULL,
  `submission_id` bigint NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `affiliate_submission_files`
--

INSERT INTO `affiliate_submission_files` (`id`, `submission_id`, `title`, `url`, `original_name`, `created_at`) VALUES
(3, 7, '1 m', 'uploads\\affiliate_files\\1767012238566448300_18a152c8.pdf', NULL, '2025-12-29 12:43:58'),
(4, 7, '2 m', 'uploads\\affiliate_files\\1767012238569442000_6deb3ef0.pdf', NULL, '2025-12-29 12:43:58'),
(5, 8, 'aDASd', 'uploads\\affiliate_files\\1767261654194831900_877f0ad7.pdf', NULL, '2026-01-01 10:00:54'),
(6, 8, '2', 'uploads\\affiliate_files\\1767261654199620700_b625e2b9.pdf', NULL, '2026-01-01 10:00:54');

-- --------------------------------------------------------

--
-- Table structure for table `affiliate_submission_videos`
--

CREATE TABLE `affiliate_submission_videos` (
  `id` bigint NOT NULL,
  `submission_id` bigint NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `affiliate_submission_videos`
--

INSERT INTO `affiliate_submission_videos` (`id`, `submission_id`, `title`, `url`, `created_at`) VALUES
(3, 7, '1', 'uploads\\affiliate_videos\\1767012238557368700_8e15e952.mp4', '2025-12-29 12:43:58'),
(4, 7, '2', 'uploads\\affiliate_videos\\1767012238561999900_3fa8263c.mp4', '2025-12-29 12:43:58'),
(5, 8, '1', 'uploads\\affiliate_videos\\1767261654188405900_932a4972.mp4', '2026-01-01 10:00:54'),
(6, 8, '2', 'uploads\\affiliate_videos\\1767261654191698800_781d708a.mp4', '2026-01-01 10:00:54'),
(7, 9, 'aaa', 'uploads\\affiliate_videos\\1767261990993128800_e5a3aeca.mp4', '2026-01-01 10:06:31');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint NOT NULL,
  `organization_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `publish_status` enum('DRAFT','PUBLISHED','SCHEDULED') DEFAULT 'DRAFT',
  `publish_at` datetime DEFAULT NULL,
  `affiliate_submission_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `organization_id`, `title`, `description`, `category`, `thumbnail_url`, `is_published`, `created_at`, `updated_at`, `publish_status`, `publish_at`, `affiliate_submission_id`) VALUES
(2, 3, 'Belajar Golang untuk Pemula banget', 'Webinar lengkap belajar Golang dari dasar sampai mahir.', 'Programming', 'uploads/events/event_thumb_2_1766140370.png', 0, '2025-11-30 11:57:40', '2025-12-20 10:25:07', 'PUBLISHED', NULL, NULL),
(9, 3, 'event baru banget', 'test fitur crud', 'Teknologi', 'uploads/events/event_thumb_9_1766310687.png', 0, '2025-12-21 09:51:28', '2025-12-24 17:17:31', 'PUBLISHED', NULL, NULL),
(19, 8, 'event afiliate', 'gatau cape', 'Gaming', 'uploads\\posters\\1767092863529034900_19.jpg', 0, '2025-12-29 19:44:39', '2026-01-01 18:09:48', 'PUBLISHED', NULL, 7),
(20, 8, 'event dari admin ', 'event yang dibuat admin dari official Organisasi', 'Teknologi', 'uploads\\posters\\1767094897968020100_20.png', 0, '2025-12-30 18:41:22', '2026-01-01 16:43:58', 'PUBLISHED', NULL, NULL),
(21, 8, 'event affiliate yang paling baru ', 'membuat kursus yang sangat seru', 'Seni & Kreativitas', 'uploads\\posters\\1767261654180902300_355ae05e.png', 0, '2026-01-01 17:02:08', '2026-01-01 17:04:01', 'PUBLISHED', NULL, 8),
(22, 8, 'awdsad', 'dsada', 'Teknologi', 'uploads\\posters\\1767261990969904100_9c7c56be.png', 0, '2026-01-01 17:07:13', '2026-01-02 18:18:20', 'DRAFT', NULL, 9);

-- --------------------------------------------------------

--
-- Table structure for table `event_certificates`
--

CREATE TABLE `event_certificates` (
  `id` bigint NOT NULL,
  `event_id` bigint NOT NULL,
  `is_enabled` tinyint(1) DEFAULT '0',
  `min_score_percent` int DEFAULT '80',
  `certificate_title` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `featured_events`
--

CREATE TABLE `featured_events` (
  `id` bigint NOT NULL,
  `event_id` bigint NOT NULL,
  `order_index` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_by` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `featured_events`
--

INSERT INTO `featured_events` (`id`, `event_id`, `order_index`, `created_at`, `created_by`) VALUES
(11, 2, 1, '2026-01-02 11:37:00', 11),
(12, 19, 2, '2026-01-02 11:37:03', 11),
(13, 9, 3, '2026-01-02 23:06:58', 11);

-- --------------------------------------------------------

--
-- Table structure for table `financial_transactions`
--

CREATE TABLE `financial_transactions` (
  `id` bigint NOT NULL,
  `transaction_type` enum('SALE','AFFILIATE_CREDIT','PLATFORM_FEE','WITHDRAWAL') NOT NULL,
  `entity_type` enum('ORGANIZATION','AFFILIATE','PLATFORM') NOT NULL,
  `entity_id` bigint NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `description` text,
  `reference_id` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `financial_transactions`
--

INSERT INTO `financial_transactions` (`id`, `transaction_type`, `entity_type`, `entity_id`, `amount`, `description`, `reference_id`, `created_at`) VALUES
(1, 'AFFILIATE_CREDIT', 'AFFILIATE', 17, '9000.00', 'Penjualan event: event afiliate', 'ORDER-1767269119-17-18', '2026-01-01 12:05:45'),
(2, 'AFFILIATE_CREDIT', 'AFFILIATE', 17, '900.00', 'Penjualan event: event afiliate', 'ORDER-1767269157-19-18', '2026-01-01 12:06:19'),
(3, 'SALE', 'ORGANIZATION', 3, '10000.00', 'Penjualan sesi ID 7', 'ORDER-1767269311-7-18', '2026-01-01 12:09:03'),
(4, 'SALE', 'ORGANIZATION', 3, '150000.00', 'Penjualan sesi ID 8', 'ORDER-1767271378-8-6', '2026-01-01 12:43:21'),
(5, 'SALE', 'ORGANIZATION', 3, '10000.00', 'Penjualan sesi ID 7', 'ORDER-1767271421-7-6', '2026-01-01 12:44:00'),
(6, 'AFFILIATE_CREDIT', 'AFFILIATE', 18, '9000.00', 'Penjualan event: event affiliate yang paling baru ', 'ORDER-1767395084-21-8', '2026-01-02 23:05:04'),
(7, 'SALE', 'ORGANIZATION', 3, '10000.00', 'Penjualan sesi ID 7', 'ORDER-1767395145-7-8', '2026-01-02 23:06:02'),
(8, 'AFFILIATE_CREDIT', 'AFFILIATE', 17, '9000.00', 'Penjualan event: event afiliate', 'ORDER-1767395177-17-8', '2026-01-02 23:06:32'),
(9, 'SALE', 'ORGANIZATION', 3, '150000.00', 'Penjualan sesi ID 8', 'ORDER-1767396654-8-8', '2026-01-02 23:31:31'),
(10, 'AFFILIATE_CREDIT', 'AFFILIATE', 17, '9000.00', 'Penjualan event: event afiliate', 'ORDER-1767397885-18-8', '2026-01-02 23:51:33');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE `organizations` (
  `id` bigint NOT NULL,
  `owner_user_id` bigint NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_link` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_official` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `owner_user_id`, `name`, `description`, `category`, `logo_url`, `email`, `phone`, `website`, `social_link`, `address`, `created_at`, `is_official`) VALUES
(3, 6, 'Pemuda IT lembang', 'latihan ngoding pemula', 'Teknologi', 'uploads/organization/org_logo_3_1767105073515261400.jpg', 'Rakaacademy@gmail.com', '084531065649', 'http://localhost:5173/dashboard', 'http://localhost:5173/dashboard', 'lembang', '2025-11-30 11:54:47', 0),
(8, 3, 'WEBBINAR OFFICIAL 💎', 'Platform official events & affiliate courses', 'Platform', 'uploads\\logos\\official_1767092828229877500.jpg', 'webbinar@gmail.com', NULL, NULL, NULL, NULL, '2025-12-28 14:10:25', 1),
(35, 15, 'pemuda bengkel', 'bikin kapal selam', 'Otomotif', 'uploads/organization/org_logo_35_1767105237830593300.jpg', 'bengkelacademy@gmail.com', '0854351645096854', 'https://www.youtube.com/watch?v=wn05Kgt73HA&list=RD-UhazbVoRNo&index=19', 'https://www.youtube.com/watch?v=wn05Kgt73HA&list=RD-UhazbVoRNo&index=19', 'subang', '2025-12-30 14:22:59', 0);

-- --------------------------------------------------------

--
-- Table structure for table `organization_applications`
--

CREATE TABLE `organization_applications` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `org_name` varchar(150) NOT NULL,
  `org_description` text,
  `org_category` varchar(100) DEFAULT NULL,
  `org_logo_url` varchar(255) DEFAULT NULL,
  `org_email` varchar(150) DEFAULT NULL,
  `org_phone` varchar(50) DEFAULT NULL,
  `org_website` varchar(255) DEFAULT NULL,
  `reason` text,
  `social_media` text,
  `status` enum('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
  `reviewed_by` bigint DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_note` text,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `organization_applications`
--

INSERT INTO `organization_applications` (`id`, `user_id`, `org_name`, `org_description`, `org_category`, `org_logo_url`, `org_email`, `org_phone`, `org_website`, `reason`, `social_media`, `status`, `reviewed_by`, `reviewed_at`, `review_note`, `submitted_at`) VALUES
(2, 6, 'Programmer Academy', 'Lembaga edukasi programming', 'Education', 'https://example.com/logo.png', 'academy@example.com', '08123456789', 'https://academy.example.com', 'Ingin membuat webinar programming', '@academy', 'APPROVED', 11, '2025-12-22 04:17:35', '', '2025-11-30 04:52:42'),
(3, 15, 'Pemuda Bengkel', 'ingin menyediakan kursus untuk membuat panduan untuk otomotif', 'Lainnya', '', 'pemudabengkel@gmail.com', '0804806651', '', 'membuka peluang belajar untuk otomotif', 'pemuda bengkel', 'REJECTED', 11, '2025-12-26 02:48:19', '', '2025-12-26 02:33:47'),
(4, 15, 'Pemuda Bengkel', 'asd', 'Teknologi', '', '', '0804806651', '', 'SADDasds', 'pemuda bengkel', 'APPROVED', 11, '2025-12-26 03:08:54', '', '2025-12-26 03:08:15'),
(5, 15, 'Pemuda Bengkel', 'asd', 'Teknologi', '', 'pemudabengkel@gmail.com', '0804806651', '', 'sad', 'pemuda bengkel', 'APPROVED', 11, '2025-12-26 03:44:13', '', '2025-12-26 03:43:43'),
(6, 15, 'Pemuda Bengkel', 'dasdawdawd', 'Lainnya', '', 'Bengkelacademy@gmail.com', '01235314216541', '', 'membuka pembelajaran', '', 'APPROVED', 11, '2025-12-30 07:22:59', '', '2025-12-30 07:22:30');

-- --------------------------------------------------------

--
-- Table structure for table `organization_balances`
--

CREATE TABLE `organization_balances` (
  `id` bigint NOT NULL,
  `organization_id` bigint NOT NULL,
  `balance` decimal(15,2) DEFAULT '0.00',
  `total_earned` decimal(15,2) DEFAULT '0.00',
  `total_withdrawn` decimal(15,2) DEFAULT '0.00',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `organization_balances`
--

INSERT INTO `organization_balances` (`id`, `organization_id`, `balance`, `total_earned`, `total_withdrawn`, `updated_at`) VALUES
(6, 3, '160000.00', '330000.00', '170000.00', '2026-01-02 23:31:31');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `session_id` bigint NOT NULL,
  `price_paid` double NOT NULL,
  `purchased_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','PAID','FAILED') DEFAULT 'PAID',
  `order_id` varchar(100) DEFAULT NULL,
  `snap_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `user_id`, `session_id`, `price_paid`, `purchased_at`, `status`, `order_id`, `snap_token`) VALUES
(61, 18, 17, 10000, '2026-01-01 19:05:19', 'PAID', 'ORDER-1767269119-17-18', NULL),
(62, 18, 19, 1000, '2026-01-01 19:05:57', 'PAID', 'ORDER-1767269157-19-18', NULL),
(63, 18, 1, 0, '2026-01-01 19:08:21', 'PAID', NULL, NULL),
(64, 18, 7, 10000, '2026-01-01 19:08:31', 'PAID', 'ORDER-1767269311-7-18', NULL),
(65, 19, 1, 0, '2026-01-01 19:12:14', 'PAID', NULL, NULL),
(66, 6, 8, 150000, '2026-01-01 19:42:58', 'PAID', 'ORDER-1767271378-8-6', NULL),
(67, 6, 7, 10000, '2026-01-01 19:43:41', 'PAID', 'ORDER-1767271421-7-6', NULL),
(68, 11, 7, 10000, '2026-01-02 17:51:48', 'PENDING', 'ORDER-1767351108-7-11', NULL),
(71, 8, 21, 10000, '2026-01-03 06:04:44', 'PAID', 'ORDER-1767395084-21-8', NULL),
(72, 8, 7, 10000, '2026-01-03 06:05:45', 'PAID', 'ORDER-1767395145-7-8', NULL),
(73, 8, 17, 10000, '2026-01-03 06:06:17', 'PAID', 'ORDER-1767395177-17-8', NULL),
(76, 8, 8, 150000, '2026-01-03 06:30:54', 'PAID', 'ORDER-1767396654-8-8', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `quiz_id` bigint NOT NULL,
  `score_percent` decimal(5,2) NOT NULL,
  `answers` json DEFAULT NULL,
  `passed` tinyint(1) DEFAULT '0',
  `attempted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `quiz_attempts`
--

INSERT INTO `quiz_attempts` (`id`, `user_id`, `quiz_id`, `score_percent`, `answers`, `passed`, `attempted_at`) VALUES
(1, 8, 5, '50.00', '{\"12\": \"A\", \"13\": \"B\"}', 0, '2025-12-30 13:28:25'),
(2, 8, 1, '33.33', '{\"7\": \"A\", \"8\": \"B\", \"9\": \"B\"}', 0, '2025-12-30 13:28:42'),
(3, 8, 1, '100.00', '{\"7\": \"A\", \"8\": \"D\", \"9\": \"A\"}', 1, '2025-12-30 13:33:14'),
(4, 8, 5, '100.00', '{\"12\": \"A\", \"13\": \"A\"}', 1, '2025-12-30 13:33:29'),
(5, 6, 5, '100.00', '{\"12\": \"A\", \"13\": \"A\"}', 1, '2026-01-01 12:43:29'),
(6, 6, 1, '33.33', '{\"7\": \"A\", \"8\": \"A\", \"9\": \"B\"}', 0, '2026-01-01 12:44:07'),
(7, 6, 1, '100.00', '{\"7\": \"A\", \"8\": \"D\", \"9\": \"A\"}', 1, '2026-01-01 12:44:25'),
(8, 8, 1, '66.67', '{\"7\": \"A\", \"8\": \"C\", \"9\": \"A\"}', 0, '2026-01-02 23:32:24'),
(9, 8, 5, '100.00', '{\"12\": \"A\", \"13\": \"A\"}', 1, '2026-01-02 23:32:34');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` bigint NOT NULL,
  `quiz_id` bigint NOT NULL,
  `question_text` text NOT NULL,
  `option_a` varchar(500) NOT NULL,
  `option_b` varchar(500) NOT NULL,
  `option_c` varchar(500) DEFAULT NULL,
  `option_d` varchar(500) DEFAULT NULL,
  `correct_option` char(1) NOT NULL,
  `order_index` int DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option`, `order_index`) VALUES
(7, 1, 'wawa', 'sadas', 'dsadas', 'daasda', 'sdasdad', 'A', 1),
(8, 1, 'dasdABSb', 'fcccxv', 'fsftgh', 'asghg', 'hgfhfgsd', 'D', 2),
(9, 1, 'asDsad', 'ghfh', 'sdfghf', 'dvddfgdr', 'dsfasaDA', 'A', 3),
(12, 5, 'gdfdas', 'asdad', 'asdas', 'adad', 'adsadsdas', 'A', 1),
(13, 5, 'dasdasd', 'adadsadsad', 'adasdad', 'adada', 'dadadada', 'A', 2);

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  `category` varchar(100) DEFAULT 'general',
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `status` enum('pending','in_progress','resolved','rejected') DEFAULT 'pending',
  `admin_notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `user_id`, `category`, `subject`, `description`, `photo_url`, `status`, `admin_notes`, `created_at`, `updated_at`) VALUES
(1, NULL, 'FRAUD', 'TOLOOOOOOOOOOONG', 'ngete saja', 'uploads\\reports\\report_1767351752425218900_59a34cf0.jpg', 'resolved', 'Masalah sudah diselesaikan', '2026-01-02 18:02:32', '2026-01-02 18:07:02'),
(2, NULL, 'CONTENT', 'awkmawikawkoaikw', 'sadsa', '', 'rejected', 'Ditolak oleh admin', '2026-01-02 18:25:36', '2026-01-02 18:29:32'),
(3, NULL, 'BUG', 'asd', 'dasd', '', 'rejected', 'Ditolak oleh admin', '2026-01-02 18:31:33', '2026-01-02 18:40:46'),
(4, 8, 'BUG', 'wadas', 'dasd', '', 'resolved', 'Masalah sudah diselesaikan', '2026-01-02 18:37:48', '2026-01-02 18:40:48');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(3, 'ADMIN'),
(4, 'AFFILIATE'),
(2, 'ORGANIZATION'),
(1, 'USER');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` bigint NOT NULL,
  `event_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `price` int DEFAULT '0',
  `order_index` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `publish_status` enum('DRAFT','PUBLISHED','SCHEDULED') DEFAULT 'DRAFT',
  `publish_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `event_id`, `title`, `description`, `price`, `order_index`, `created_at`, `publish_status`, `publish_at`) VALUES
(1, 2, 'Introduction 1', 'Dasar golang', 0, 1, '2025-11-30 12:15:28', 'PUBLISHED', NULL),
(7, 9, 'sadasd', 'asdasdas', 10000, 1, '2025-12-21 09:55:40', 'PUBLISHED', '2025-12-21 10:17:00'),
(8, 9, 'sesi baru', 'waw', 150000, 2, '2025-12-24 10:17:54', 'PUBLISHED', NULL),
(9, 2, 'golang dasar', 'mulai belajar golaang', 30000, 2, '2025-12-26 10:06:58', 'DRAFT', NULL),
(17, 19, 'event afiliate', 'gatau cape', 10000, 0, '2025-12-29 19:44:39', 'PUBLISHED', NULL),
(18, 19, 'dari admin', 'kiwwwwwwwwwwwww', 10000, 1, '2025-12-30 18:39:04', 'PUBLISHED', NULL),
(19, 19, 'asdAS', 'sadasd', 1000, 2, '2025-12-30 18:39:41', 'PUBLISHED', NULL),
(20, 20, 'event pertama official dari platform', 'first event', 10000, 1, '2025-12-30 18:42:11', 'PUBLISHED', '2025-12-30 18:45:00'),
(21, 21, 'event affiliate yang paling baru ', 'membuat kursus yang sangat seru', 10000, 0, '2026-01-01 17:02:09', 'PUBLISHED', NULL),
(22, 22, 'awdsad', 'dsada', 9997, 0, '2026-01-01 17:07:13', 'DRAFT', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `session_files`
--

CREATE TABLE `session_files` (
  `id` bigint NOT NULL,
  `session_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `file_url` varchar(255) NOT NULL,
  `size_bytes` bigint DEFAULT '0',
  `order_index` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `session_files`
--

INSERT INTO `session_files` (`id`, `session_id`, `title`, `description`, `file_url`, `size_bytes`, `order_index`, `created_at`) VALUES
(1, 1, 'Transkrip.pdf', 'in modul 1\n', 'uploads/files/session_1_1764505346.pdf', 290731, 1, '2025-11-30 12:22:27'),
(12, 17, '1 m', NULL, 'uploads\\files\\1767012238566448300_18a152c8.pdf', 0, 1, '2025-12-29 19:44:39'),
(13, 17, '2 m', NULL, 'uploads\\files\\1767012238569442000_6deb3ef0.pdf', 0, 2, '2025-12-29 19:44:39'),
(14, 20, 'materi 1', '', 'uploads\\files\\official_1767094954073249400_20.pdf', 0, 1, '2025-12-30 18:42:34'),
(15, 21, 'aDASd', NULL, 'uploads\\files\\1767261654194831900_877f0ad7.pdf', 0, 1, '2026-01-01 17:02:09'),
(16, 21, '2', NULL, 'uploads\\files\\1767261654199620700_b625e2b9.pdf', 0, 2, '2026-01-01 17:02:09'),
(17, 17, 'materi dummy.pptx', '', 'uploads\\files\\official_1767395362479473900_17.pptx', 0, 3, '2026-01-03 06:09:22');

-- --------------------------------------------------------

--
-- Table structure for table `session_quizzes`
--

CREATE TABLE `session_quizzes` (
  `id` bigint NOT NULL,
  `session_id` bigint NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `is_enabled` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `session_quizzes`
--

INSERT INTO `session_quizzes` (`id`, `session_id`, `title`, `is_enabled`, `created_at`) VALUES
(1, 7, 'kuis pertama', 1, '2025-12-30 13:12:18'),
(5, 8, 'kuis sesi 1', 1, '2025-12-30 13:23:10');

-- --------------------------------------------------------

--
-- Table structure for table `session_videos`
--

CREATE TABLE `session_videos` (
  `id` bigint NOT NULL,
  `session_id` bigint NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `video_url` varchar(255) NOT NULL,
  `size_bytes` bigint DEFAULT '0',
  `order_index` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `session_videos`
--

INSERT INTO `session_videos` (`id`, `session_id`, `title`, `description`, `video_url`, `size_bytes`, `order_index`, `created_at`) VALUES
(1, 1, 'materi 1', 'asdsad', 'uploads/videos/session_1_1764505284.mp4', 3315805, 1, '2025-11-30 12:21:25'),
(3, 1, 'materi 22', '', 'uploads/videos/session_1_1765297924.mp4', 3315805, 3, '2025-12-09 16:32:04'),
(15, 7, 'materi 111', '', 'uploads/videos/session_7_1766312098.png', 5410207, 1, '2025-12-21 10:14:59'),
(16, 8, 'materi di sesi baru', 'belajar backend', 'uploads/videos/session_8_1766571511.mp4', 3315805, 1, '2025-12-24 10:18:31'),
(25, 17, 'materi 1', 'wadadidaw', 'uploads\\videos\\1767012238557368700_8e15e952.mp4', 0, 1, '2025-12-29 19:44:39'),
(26, 17, '2', NULL, 'uploads\\videos\\1767012238561999900_3fa8263c.mp4', 0, 2, '2025-12-29 19:44:39'),
(27, 18, 'Output PBO7.mp4', '', 'uploads\\videos\\official_1767094795747444800_18.mp4', 0, 1, '2025-12-30 18:39:55'),
(28, 20, 'materi 1 video', '', 'uploads\\videos\\official_1767094943958690400_20.mp4', 0, 1, '2025-12-30 18:42:23'),
(29, 21, '1', NULL, 'uploads\\videos\\1767261654188405900_932a4972.mp4', 0, 1, '2026-01-01 17:02:09'),
(30, 21, '2', NULL, 'uploads\\videos\\1767261654191698800_781d708a.mp4', 0, 2, '2026-01-01 17:02:09'),
(31, 22, 'aaa', NULL, 'uploads\\videos\\1767261990993128800_e5a3aeca.mp4', 0, 1, '2026-01-01 17:07:13');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(50) DEFAULT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  `username` varchar(60) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `admin_level` int DEFAULT '0',
  `gender` varchar(20) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `address` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `created_at`, `phone`, `profile_img`, `username`, `bio`, `admin_level`, `gender`, `birthdate`, `address`) VALUES
(6, 'ananda raka academy', 'rakaacademy@gmail.com', '$2a$14$mxwRh9bgvTmhVwRxxtY4hOT/GSmltg6BimFEVNdMucW3un8Q/RGnu', '2025-11-30 11:51:25', '065165235498', 'uploads/profile/user_6_1766404223.png', 'raka', 'admin besar', 0, 'Laki-laki', '2003-07-16', 'bandung banget, kota subang, desa los angeles'),
(7, 'admin kecil', 'user@gmail.com', '$2a$14$y6D8jQm5mCi.5BVcCnpfauWBCpgu/j6fgcbUFkQP4N2aB.SKpOecu', '2025-12-06 11:23:53', '', NULL, NULL, '', 2, NULL, NULL, NULL),
(8, 'customer 1', 'beli@gmail.com', '$2a$14$EU8Vx9/FNRUaccG8Z7fBy.GGM6x7uTdU0fCoVfaPWKEnDSPC2TA0y', '2025-12-09 15:51:08', '055521315651', 'uploads/profile/user_8_1766410150.png', 'juragan', 'sadsad', 0, 'Laki-laki', '2025-12-28', 'aSas'),
(11, 'admin ganteng akun pertama', 'admin@gmail.com', '$2a$14$QK8pHMK06iVP2an007KitOYMiIETFcDkPRslfIwKHq2FOaZzTJsvS', '2025-12-21 10:37:04', '0813134746651', 'uploads/profile/user_11_1766402298.png', 'SUPERRRRR Admin ', 'aman banget gweh admin', 1, 'Laki-laki', '2005-07-30', 'lembang'),
(12, 'academy Ulbi baik', 'Ulbiacademy@gmail.com', '$2a$14$aBeE8vqPO/a3Kxy7EI2oa.0Kd.ESXphoOon.TCxFCFQQkpGynaJlW', '2025-12-21 10:51:43', '08165468796651', NULL, NULL, 'asdasmdnasm,', 0, NULL, NULL, NULL),
(13, 'admin junior', 'admin2@gmail.com', '$2a$10$Du0k5Qu1Wlh0pIElzbJbTOP77F.DTHwo3nY.ZwEvZS1RiS5E/oJ.u', '2025-12-24 12:17:03', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL),
(15, 'Andi andarsyah jelek', 'bengkelacademy@gmail.com', '$2a$14$XdBxGokAI64MLlORL4cH7O8PTkJpRjqI/b9IKWm/jrG/2ebhTY/Pe', '2025-12-26 08:56:38', '084316516561', 'uploads/profile/user_15_1766741449.jpg', 'andi bengkel', 'sarjana mesin dari unversitas gajah duduk', 0, 'Laki-laki', '2025-12-26', 'gatau dimana sih aowkoakwoko'),
(17, 'budi afiliate', 'budi@gmail.com', '$2a$14$BCmYuc8FK6ZkNXXDbTskQ.XlEj5otZ0t76NtNozVLYPXtaZ0KIh0.', '2025-12-29 10:11:27', '084316516561', 'uploads/profile/user_17_1767003740.png', 'budi ganteng', 'bismillah affiliate beres', 0, 'Laki-laki', '2001-06-13', 'jakarta '),
(18, 'aku baru', 'baru@gmail.com', '$2a$14$W3BvwkhRe7utGMgNkZ0oPOVjpDFtrODYm8ifyD6n.GVTePGmfOkCO', '2026-01-01 09:52:41', '081354984231', 'uploads/profile/user_18_1767261487.png', 'anak baru', 'anak baru yang gantentg\n', 0, 'Laki-laki', '2005-05-23', 'rumah'),
(19, 'wahyu', 'wahyu@gmail.com', '$2a$14$wAVPuzdVIrDBLD34ijlSAu/ssv7n1lDK5j1aCiYyFMbT56MM.iO0e', '2026-01-01 12:11:56', NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_certificates`
--

CREATE TABLE `user_certificates` (
  `id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `event_id` bigint NOT NULL,
  `total_score_percent` decimal(5,2) NOT NULL,
  `certificate_code` varchar(50) DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_certificates`
--

INSERT INTO `user_certificates` (`id`, `user_id`, `event_id`, `total_score_percent`, `certificate_code`, `issued_at`) VALUES
(1, 8, 9, '100.00', 'CERT-7c76d002e77f64ba', '2025-12-30 13:33:32'),
(2, 6, 9, '100.00', 'CERT-ead963d03e4ab2af', '2026-01-01 12:44:27');

-- --------------------------------------------------------

--
-- Table structure for table `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(8, 1),
(13, 1),
(17, 1),
(18, 1),
(19, 1),
(6, 2),
(12, 2),
(15, 2),
(7, 3),
(11, 3),
(17, 4),
(18, 4);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `affiliate_applications`
--
ALTER TABLE `affiliate_applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_affiliate_applications_user` (`user_id`);

--
-- Indexes for table `affiliate_balances`
--
ALTER TABLE `affiliate_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `affiliate_ledgers`
--
ALTER TABLE `affiliate_ledgers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliate_submission_id` (`affiliate_submission_id`);

--
-- Indexes for table `affiliate_submissions`
--
ALTER TABLE `affiliate_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_affiliate_submissions_event_id` (`event_id`);

--
-- Indexes for table `affiliate_submission_files`
--
ALTER TABLE `affiliate_submission_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asf_submission_id` (`submission_id`);

--
-- Indexes for table `affiliate_submission_videos`
--
ALTER TABLE `affiliate_submission_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_asv_submission_id` (`submission_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_events_org` (`organization_id`),
  ADD KEY `fk_events_affiliate` (`affiliate_submission_id`);

--
-- Indexes for table `event_certificates`
--
ALTER TABLE `event_certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_id` (`event_id`);

--
-- Indexes for table `featured_events`
--
ALTER TABLE `featured_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `financial_transactions`
--
ALTER TABLE `financial_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organization_applications`
--
ALTER TABLE `organization_applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organization_balances`
--
ALTER TABLE `organization_balances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organization_id` (`organization_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`session_id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_id` (`quiz_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sessions_event` (`event_id`);

--
-- Indexes for table `session_files`
--
ALTER TABLE `session_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_session_files_session` (`session_id`);

--
-- Indexes for table `session_quizzes`
--
ALTER TABLE `session_quizzes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_id` (`session_id`);

--
-- Indexes for table `session_videos`
--
ALTER TABLE `session_videos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_session_videos_session` (`session_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `user_certificates`
--
ALTER TABLE `user_certificates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cert` (`user_id`,`event_id`),
  ADD UNIQUE KEY `certificate_code` (`certificate_code`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `affiliate_applications`
--
ALTER TABLE `affiliate_applications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `affiliate_balances`
--
ALTER TABLE `affiliate_balances`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `affiliate_ledgers`
--
ALTER TABLE `affiliate_ledgers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `affiliate_submissions`
--
ALTER TABLE `affiliate_submissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `affiliate_submission_files`
--
ALTER TABLE `affiliate_submission_files`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `affiliate_submission_videos`
--
ALTER TABLE `affiliate_submission_videos`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `event_certificates`
--
ALTER TABLE `event_certificates`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `featured_events`
--
ALTER TABLE `featured_events`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `financial_transactions`
--
ALTER TABLE `financial_transactions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=110;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `organization_applications`
--
ALTER TABLE `organization_applications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `organization_balances`
--
ALTER TABLE `organization_balances`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=81;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `session_files`
--
ALTER TABLE `session_files`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `session_quizzes`
--
ALTER TABLE `session_quizzes`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `session_videos`
--
ALTER TABLE `session_videos`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `user_certificates`
--
ALTER TABLE `user_certificates`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `affiliate_applications`
--
ALTER TABLE `affiliate_applications`
  ADD CONSTRAINT `fk_affiliate_applications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `affiliate_balances`
--
ALTER TABLE `affiliate_balances`
  ADD CONSTRAINT `affiliate_balances_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `affiliate_ledgers`
--
ALTER TABLE `affiliate_ledgers`
  ADD CONSTRAINT `affiliate_ledgers_ibfk_1` FOREIGN KEY (`affiliate_submission_id`) REFERENCES `affiliate_submissions` (`id`);

--
-- Constraints for table `affiliate_submissions`
--
ALTER TABLE `affiliate_submissions`
  ADD CONSTRAINT `fk_affiliate_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `affiliate_submission_files`
--
ALTER TABLE `affiliate_submission_files`
  ADD CONSTRAINT `affiliate_submission_files_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `affiliate_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `affiliate_submission_videos`
--
ALTER TABLE `affiliate_submission_videos`
  ADD CONSTRAINT `affiliate_submission_videos_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `affiliate_submissions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_events_affiliate` FOREIGN KEY (`affiliate_submission_id`) REFERENCES `affiliate_submissions` (`id`),
  ADD CONSTRAINT `fk_events_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Constraints for table `event_certificates`
--
ALTER TABLE `event_certificates`
  ADD CONSTRAINT `event_certificates_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `featured_events`
--
ALTER TABLE `featured_events`
  ADD CONSTRAINT `featured_events_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `organization_balances`
--
ALTER TABLE `organization_balances`
  ADD CONSTRAINT `organization_balances_ibfk_1` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`);

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `session_quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `session_quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `fk_sessions_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`);

--
-- Constraints for table `session_files`
--
ALTER TABLE `session_files`
  ADD CONSTRAINT `fk_session_files_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`);

--
-- Constraints for table `session_quizzes`
--
ALTER TABLE `session_quizzes`
  ADD CONSTRAINT `session_quizzes_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_videos`
--
ALTER TABLE `session_videos`
  ADD CONSTRAINT `fk_session_videos_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`);

--
-- Constraints for table `user_certificates`
--
ALTER TABLE `user_certificates`
  ADD CONSTRAINT `user_certificates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_certificates_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
