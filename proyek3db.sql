-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 29, 2025 at 09:21 AM
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
  `user_id` bigint DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `affiliate_submissions`
--

INSERT INTO `affiliate_submissions` (`id`, `full_name`, `email`, `phone`, `event_title`, `event_description`, `event_price`, `poster_url`, `bank_name`, `bank_account_number`, `bank_account_holder`, `status`, `reviewed_by`, `reviewed_at`, `review_note`, `created_at`, `updated_at`, `video_url`, `video_title`, `file_url`, `file_title`, `user_id`) VALUES
(1, 'galuh', 'galuh@gmail.com', '06109823516', 'buat jurnal;', 'latuihan jurnal', 10000, 'uploads\\posters\\affiliate_1766927859868373500.jpg', 'BCA', '984623103', 'galu jomok', 'PENDING', NULL, NULL, NULL, '2025-12-28 20:17:39', '2025-12-28 20:17:39', NULL, NULL, NULL, NULL, NULL),
(2, 'budi', 'budi@gmail.com', NULL, 'event affiliate', 'event affiliate as d', 10000, 'uploads\\posters\\1766930641038467500_b09ce912.png', NULL, NULL, NULL, 'PENDING', NULL, NULL, NULL, '2025-12-28 21:04:01', '2025-12-28 21:04:01', 'uploads\\affiliate_videos\\1766930641047380800_3fa5e88c.mp4', 'materi affiliate', 'uploads\\affiliate_files\\1766930641057375200_06c1db79.pdf', 'materi pembantu', 16);

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
(9, 3, 'event baru banget', 'test fitur crud', 'Teknologi', 'uploads/events/event_thumb_9_1766310687.png', 0, '2025-12-21 09:51:28', '2025-12-24 17:17:31', 'PUBLISHED', NULL, NULL);

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

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at`) VALUES
(1, 15, 'profile_updated', '👤 Profil Diperbarui', 'Admin telah memperbarui informasi profil Anda. Silakan periksa data profil Anda.', 1, '2025-12-26 10:06:05'),
(2, 7, 'new_session', '📚 Sesi Baru Tersedia!', 'Event \"Belajar Golang untuk Pemula banget\" menambahkan sesi baru: \"golang dasar\"', 0, '2025-12-26 10:06:58'),
(3, 8, 'new_session', '📚 Sesi Baru Tersedia!', 'Event \"Belajar Golang untuk Pemula banget\" menambahkan sesi baru: \"golang dasar\"', 1, '2025-12-26 10:06:58'),
(4, 6, 'new_session', '📚 Sesi Baru Tersedia!', 'Event \"Belajar Golang untuk Pemula banget\" menambahkan sesi baru: \"golang dasar\"', 1, '2025-12-26 10:06:58'),
(5, 7, 'new_application', '📝 Pengajuan Baru!', 'Andi andarsyah jelek mengajukan organisasi \"Pemuda Bengkel\"', 0, '2025-12-26 10:08:15'),
(6, 11, 'new_application', '📝 Pengajuan Baru!', 'Andi andarsyah jelek mengajukan organisasi \"Pemuda Bengkel\"', 1, '2025-12-26 10:08:15'),
(7, 13, 'new_application', '📝 Pengajuan Baru!', 'Andi andarsyah jelek mengajukan organisasi \"Pemuda Bengkel\"', 1, '2025-12-26 10:08:15'),
(8, 15, 'application_approved', '🎉 Pengajuan Disetujui!', 'Selamat! Pengajuan organisasi \"Pemuda Bengkel\" telah disetujui. Anda sekarang dapat membuat event.', 1, '2025-12-26 10:08:54'),
(9, 6, 'organization_updated', '🏢 Organisasi Diperbarui', 'Admin telah memperbarui informasi organisasi \"Pemuda IT banget\".', 1, '2025-12-26 10:35:14'),
(10, 15, 'organization_deleted', '🗑️ Organisasi Dihapus', 'Organisasi \"Pemuda Bengkel\" telah dihapus oleh admin.', 1, '2025-12-26 10:36:32'),
(11, 7, 'new_application', '📝 Pengajuan Baru!', 'Andi andarsyah jelek mengajukan organisasi \"Pemuda Bengkel\"', 0, '2025-12-26 10:43:43'),
(12, 11, 'new_application', '📝 Pengajuan Baru!', 'Andi andarsyah jelek mengajukan organisasi \"Pemuda Bengkel\"', 1, '2025-12-26 10:43:43'),
(13, 13, 'new_application', '📝 Pengajuan Baru!', 'Andi andarsyah jelek mengajukan organisasi \"Pemuda Bengkel\"', 1, '2025-12-26 10:43:43'),
(14, 15, 'application_approved', '🎉 Pengajuan Disetujui!', 'Selamat! Pengajuan organisasi \"Pemuda Bengkel\" telah disetujui. Anda sekarang dapat membuat event.', 1, '2025-12-26 10:44:13'),
(15, 6, 'new_purchase', '💰 Pembelian Baru!', 'admin ganteng membeli sesi \"sadasd\" dari event \"event baru banget\"', 1, '2025-12-28 12:48:45'),
(16, 6, 'new_purchase', '💰 Pembelian Baru!', 'admin ganteng membeli sesi \"sesi baru\" dari event \"event baru banget\"', 1, '2025-12-28 12:48:48'),
(17, 6, 'new_purchase', '💰 Pembelian Baru!', 'budi membeli sesi \"sadasd\" dari event \"event baru banget\"', 0, '2025-12-28 13:23:07');

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
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`id`, `owner_user_id`, `name`, `description`, `category`, `logo_url`, `email`, `phone`, `website`, `social_link`, `address`, `created_at`) VALUES
(3, 6, 'Pemuda IT banget', 'menyediakan berbagai materi pemrograman sada', 'Pendidikan', 'uploads/organization/org_logo_3_1766568959165780900.png', 'rakaacademy@gmail.com', '08165465266565', '', 'https://www.youtube.com/@aksakotamaro1361', 'bandung', '2025-11-30 11:54:47'),
(7, 15, 'Pemuda Bengkel', 'asd', 'Teknologi', '', 'pemudabengkel@gmail.com', '0804806651', '', NULL, NULL, '2025-12-26 10:44:13'),
(8, 3, 'Official', 'Platform official events & affiliate courses', 'Platform', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-28 14:10:25');

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
(5, 15, 'Pemuda Bengkel', 'asd', 'Teknologi', '', 'pemudabengkel@gmail.com', '0804806651', '', 'sad', 'pemuda bengkel', 'APPROVED', 11, '2025-12-26 03:44:13', '', '2025-12-26 03:43:43');

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
  `order_id` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `user_id`, `session_id`, `price_paid`, `purchased_at`, `status`, `order_id`) VALUES
(1, 7, 1, 0, '2025-12-06 18:25:30', 'PAID', NULL),
(2, 8, 1, 0, '2025-12-09 22:51:24', 'PAID', NULL),
(6, 6, 1, 0, '2025-12-21 17:02:40', 'PAID', NULL),
(7, 6, 7, 0, '2025-12-21 17:17:19', 'PAID', NULL),
(8, 8, 7, 0, '2025-12-24 16:03:32', 'PAID', NULL),
(9, 6, 8, 150000, '2025-12-24 17:18:43', 'PAID', NULL),
(10, 8, 8, 150000, '2025-12-24 17:21:53', 'PAID', NULL),
(11, 11, 7, 10000, '2025-12-28 19:48:44', 'PAID', NULL),
(12, 11, 8, 150000, '2025-12-28 19:48:48', 'PAID', NULL),
(13, 16, 7, 10000, '2025-12-28 20:23:06', 'PAID', NULL);

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
(9, 2, 'golang dasar', 'mulai belajar golaang', 30000, 2, '2025-12-26 10:06:58', 'DRAFT', NULL);

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
(1, 1, 'Transkrip.pdf', 'in modul 1\n', 'uploads/files/session_1_1764505346.pdf', 290731, 1, '2025-11-30 12:22:27');

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
(16, 8, 'materi di sesi baru', 'belajar backend', 'uploads/videos/session_8_1766571511.mp4', 3315805, 1, '2025-12-24 10:18:31');

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
(7, 'user', 'user@gmail.com', '$2a$14$y6D8jQm5mCi.5BVcCnpfauWBCpgu/j6fgcbUFkQP4N2aB.SKpOecu', '2025-12-06 11:23:53', NULL, NULL, NULL, NULL, 2, NULL, NULL, NULL),
(8, 'customer 1', 'beli@gmail.com', '$2a$14$EU8Vx9/FNRUaccG8Z7fBy.GGM6x7uTdU0fCoVfaPWKEnDSPC2TA0y', '2025-12-09 15:51:08', '055521315651', 'uploads/profile/user_8_1766410150.png', 'juragan', 'sadsad', 0, 'Laki-laki', '2025-12-28', 'aSas'),
(11, 'admin ganteng', 'admin@gmail.com', '$2a$14$QK8pHMK06iVP2an007KitOYMiIETFcDkPRslfIwKHq2FOaZzTJsvS', '2025-12-21 10:37:04', '', 'uploads/profile/user_11_1766402298.png', 'Admin 1', NULL, 1, NULL, NULL, NULL),
(12, 'academy Ulbi baik', 'Ulbiacademy@gmail.com', '$2a$14$aBeE8vqPO/a3Kxy7EI2oa.0Kd.ESXphoOon.TCxFCFQQkpGynaJlW', '2025-12-21 10:51:43', '08165468796651', NULL, NULL, 'asdasmdnasm,', 0, NULL, NULL, NULL),
(13, 'admin junior', 'admin2@gmail.com', '$2a$10$Du0k5Qu1Wlh0pIElzbJbTOP77F.DTHwo3nY.ZwEvZS1RiS5E/oJ.u', '2025-12-24 12:17:03', NULL, NULL, NULL, NULL, 2, NULL, NULL, NULL),
(15, 'Andi andarsyah jelek', 'bengkelacademy@gmail.com', '$2a$14$XdBxGokAI64MLlORL4cH7O8PTkJpRjqI/b9IKWm/jrG/2ebhTY/Pe', '2025-12-26 08:56:38', '084316516561', 'uploads/profile/user_15_1766741449.jpg', 'andi bengkel', 'sarjana mesin dari unversitas gajah duduk', 0, 'Laki-laki', '2025-12-26', 'gatau dimana sih aowkoakwoko'),
(16, 'budi', 'budi@gmail.com', '$2a$14$kfdV5Oz5yKfnlvhm9lulJeyegvwdjZcfgrd7AYhNfh7oH5YwioL2G', '2025-12-28 13:21:59', '080321348941', '', 'budi ganten', 'asdasdgfsdaSD AS', 0, 'Laki-laki', '2001-07-27', 'asdasdASd ASDASD asd');

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
(16, 1),
(6, 2),
(12, 2),
(15, 2),
(7, 3),
(11, 3),
(13, 3);

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
-- Indexes for table `affiliate_ledgers`
--
ALTER TABLE `affiliate_ledgers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `affiliate_submission_id` (`affiliate_submission_id`);

--
-- Indexes for table `affiliate_submissions`
--
ALTER TABLE `affiliate_submissions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_events_org` (`organization_id`),
  ADD KEY `fk_events_affiliate` (`affiliate_submission_id`);

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
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`,`session_id`),
  ADD KEY `session_id` (`session_id`);

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
-- AUTO_INCREMENT for table `affiliate_ledgers`
--
ALTER TABLE `affiliate_ledgers`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `affiliate_submissions`
--
ALTER TABLE `affiliate_submissions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `organization_applications`
--
ALTER TABLE `organization_applications`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `session_files`
--
ALTER TABLE `session_files`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `session_videos`
--
ALTER TABLE `session_videos`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `affiliate_applications`
--
ALTER TABLE `affiliate_applications`
  ADD CONSTRAINT `fk_affiliate_applications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `affiliate_ledgers`
--
ALTER TABLE `affiliate_ledgers`
  ADD CONSTRAINT `affiliate_ledgers_ibfk_1` FOREIGN KEY (`affiliate_submission_id`) REFERENCES `affiliate_submissions` (`id`);

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `fk_events_affiliate` FOREIGN KEY (`affiliate_submission_id`) REFERENCES `affiliate_submissions` (`id`),
  ADD CONSTRAINT `fk_events_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`);

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`);

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
-- Constraints for table `session_videos`
--
ALTER TABLE `session_videos`
  ADD CONSTRAINT `fk_session_videos_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`);

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
