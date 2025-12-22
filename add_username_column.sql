-- Menambahkan kolom username ke tabel users jika belum ada
-- Jalankan query ini di phpMyAdmin atau MySQL client

-- Cek dan tambahkan kolom username
SET @dbname = DATABASE();
SET @tablename = 'users';
SET @columnname = 'username';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
    AND TABLE_NAME = @tablename
    AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE `', @tablename, '` ADD COLUMN `', @columnname, '` VARCHAR(100) DEFAULT NULL AFTER `bio`')
));

PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Atau cukup jalankan query sederhana ini (akan error jika kolom sudah ada, abaikan saja):
-- ALTER TABLE users ADD COLUMN username VARCHAR(100) DEFAULT NULL AFTER bio;
