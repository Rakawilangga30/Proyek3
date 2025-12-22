-- Script untuk menambahkan kolom yang kurang ke tabel users
-- Jalankan di phpMyAdmin atau MySQL client

-- Cek dan tambahkan kolom bio jika belum ada
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(500) DEFAULT NULL;

-- Cek dan tambahkan kolom username jika belum ada  
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) DEFAULT NULL;

-- Jika MySQL Anda tidak mendukung IF NOT EXISTS, jalankan satu per satu
-- dan abaikan error jika kolom sudah ada:

-- ALTER TABLE users ADD COLUMN bio VARCHAR(500) DEFAULT NULL;
-- ALTER TABLE users ADD COLUMN username VARCHAR(100) DEFAULT NULL;
