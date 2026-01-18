package test

import (
	"fmt"
	"log"
	"os"
	"strings"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"

	"BACKEND/config"
)

// SetupTestDB initializes the test database using MySQL
// It uses the same MySQL server but creates a separate test database
func SetupTestDB() *sqlx.DB {
	// Load .env from parent directory
	godotenv.Load("../.env")
	godotenv.Load(".env")

	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	host := os.Getenv("DB_HOST")

	// Connect without database first to create test db
	dsnRoot := fmt.Sprintf("%s:%s@tcp(%s)/", user, pass, host)
	dbRoot, err := sqlx.Connect("mysql", dsnRoot)
	if err != nil {
		log.Fatal("Failed to connect to MySQL:", err)
	}

	// Create test database if not exists
	testDBName := "proyek3_test"
	dbRoot.MustExec(fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", testDBName))
	dbRoot.Close()

	// Connect to test database
	dsn := fmt.Sprintf("%s:%s@tcp(%s)/%s?parseTime=true&multiStatements=true", user, pass, host, testDBName)
	db, err := sqlx.Connect("mysql", dsn)
	if err != nil {
		log.Fatal("Failed to connect to test database:", err)
	}

	// Set the global DB to this test database
	config.DB = db

	// Create schema
	createTestSchema(db)

	return db
}

// createTestSchema creates all required tables for testing
func createTestSchema(db *sqlx.DB) {
	// Drop all tables first for clean state
	tables := []string{
		"password_reset_tokens",
		"featured_events",
		"ad_banners",
		"financial_transactions",
		"affiliate_ledgers",
		"affiliate_partnerships",
		"affiliate_submissions",
		"affiliate_applications",
		"affiliate_balances",
		"affiliates",
		"notifications",
		"reports",
		"cart_items",
		"carts",
		"cart",
		"purchases",
		"session_files",
		"session_videos",
		"sessions",
		"events",
		"organization_applications",
		"organizations",
		"user_roles",
		"users",
		"roles",
	}

	// Disable foreign key checks for clean drop
	db.MustExec("SET FOREIGN_KEY_CHECKS = 0")
	for _, table := range tables {
		db.Exec(fmt.Sprintf("DROP TABLE IF EXISTS %s", table))
	}
	db.MustExec("SET FOREIGN_KEY_CHECKS = 1")

	// Users table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS users (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			password_hash VARCHAR(255) NOT NULL,
			phone VARCHAR(50),
			bio TEXT,
			gender VARCHAR(20),
			birth_date DATE,
			avatar_url VARCHAR(500),
			address TEXT,
			admin_level INT DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		)
	`)

	// Roles table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS roles (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(50) UNIQUE NOT NULL
		)
	`)

	// Insert default roles
	db.MustExec(`INSERT IGNORE INTO roles (id, name) VALUES (1, 'USER')`)
	db.MustExec(`INSERT IGNORE INTO roles (id, name) VALUES (2, 'ORGANIZATION')`)
	db.MustExec(`INSERT IGNORE INTO roles (id, name) VALUES (3, 'ADMIN')`)
	db.MustExec(`INSERT IGNORE INTO roles (id, name) VALUES (4, 'AFFILIATE')`)

	// User roles table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS user_roles (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			role_id BIGINT NOT NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
		)
	`)

	// Organizations table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS organizations (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			owner_user_id BIGINT,
			name VARCHAR(255) NOT NULL,
			description TEXT,
			category VARCHAR(100),
			email VARCHAR(255),
			phone VARCHAR(50),
			website VARCHAR(500),
			logo_url VARCHAR(500),
			balance DECIMAL(15,2) DEFAULT 0,
			bank_name VARCHAR(100),
			bank_account VARCHAR(100),
			bank_account_name VARCHAR(255),
			is_official TINYINT DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)

	// Organization applications table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS organization_applications (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			org_name VARCHAR(255) NOT NULL,
			org_description TEXT,
			org_category VARCHAR(100),
			org_email VARCHAR(255),
			org_phone VARCHAR(50),
			org_website VARCHAR(500),
			org_logo_url VARCHAR(500),
			social_media VARCHAR(500),
			bank_name VARCHAR(100),
			bank_account VARCHAR(100),
			bank_account_name VARCHAR(255),
			reason TEXT,
			status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
			reviewed_by BIGINT,
			reviewed_note TEXT,
			submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			reviewed_at TIMESTAMP NULL,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)

	// Events table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS events (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			organization_id BIGINT NOT NULL,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			category VARCHAR(100),
			thumbnail_url VARCHAR(500),
			publish_status ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED') DEFAULT 'DRAFT',
			publish_at TIMESTAMP NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
		)
	`)

	// Sessions table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS sessions (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			event_id BIGINT NOT NULL,
			title VARCHAR(255) NOT NULL,
			description TEXT,
			price DECIMAL(15,2) DEFAULT 0,
			order_index INT DEFAULT 0,
			publish_status ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED') DEFAULT 'DRAFT',
			publish_at TIMESTAMP NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
		)
	`)

	// Session videos table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS session_videos (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			session_id BIGINT NOT NULL,
			title VARCHAR(255),
			description TEXT,
			video_url VARCHAR(500) NOT NULL,
			duration INT DEFAULT 0,
			sort_order INT DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
		)
	`)

	// Session files table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS session_files (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			session_id BIGINT NOT NULL,
			title VARCHAR(255),
			file_url VARCHAR(500) NOT NULL,
			file_type VARCHAR(50),
			sort_order INT DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
		)
	`)

	// Purchases table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS purchases (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			session_id BIGINT NOT NULL,
			amount DECIMAL(15,2) NOT NULL,
			price_paid DECIMAL(15,2) DEFAULT 0,
			order_id VARCHAR(255),
			status ENUM('PENDING', 'PAID', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
			payment_method VARCHAR(50),
			midtrans_order_id VARCHAR(255),
			snap_token VARCHAR(500),
			affiliate_code VARCHAR(50),
			purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
		)
	`)

	// Cart table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS cart (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			session_id BIGINT NOT NULL,
			affiliate_code VARCHAR(50),
			added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
		)
	`)

	// Reports table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS reports (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT,
			category VARCHAR(100),
			subject VARCHAR(255) NOT NULL,
			description TEXT NOT NULL,
			photo_url VARCHAR(500),
			status ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'PENDING',
			admin_notes TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
		)
	`)

	// Notifications table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS notifications (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			type VARCHAR(50),
			title VARCHAR(255) NOT NULL,
			message TEXT,
			is_read BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)

	// Carts table (new structure used by cart_controller)
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS carts (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL UNIQUE,
			affiliate_code VARCHAR(50),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)

	// Cart items table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS cart_items (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			cart_id BIGINT NOT NULL,
			item_type ENUM('SESSION', 'EVENT_PACKAGE') DEFAULT 'SESSION',
			session_id BIGINT,
			event_id BIGINT,
			price DECIMAL(15,2) DEFAULT 0,
			added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
			FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
		)
	`)

	// Affiliates table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS affiliates (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL UNIQUE,
			affiliate_code VARCHAR(50) UNIQUE,
			status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
			balance DECIMAL(15,2) DEFAULT 0,
			total_earnings DECIMAL(15,2) DEFAULT 0,
			bank_name VARCHAR(100),
			bank_account VARCHAR(100),
			bank_holder VARCHAR(255),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)

	// Affiliate applications table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS affiliate_applications (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			motivation TEXT,
			status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
			reviewed_by BIGINT,
			review_note TEXT,
			reviewed_at TIMESTAMP NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)

	// Affiliate balances table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS affiliate_balances (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL UNIQUE,
			total_earned DECIMAL(15,2) DEFAULT 0,
			total_withdrawn DECIMAL(15,2) DEFAULT 0,
			balance DECIMAL(15,2) DEFAULT 0,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)

	// Affiliate submissions table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS affiliate_submissions (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT,
			affiliate_id BIGINT,
			event_id BIGINT,
			full_name VARCHAR(255),
			email VARCHAR(255),
			phone VARCHAR(50),
			event_title VARCHAR(255) NOT NULL,
			event_description TEXT,
			event_price DECIMAL(15,2) DEFAULT 0,
			event_category VARCHAR(100) DEFAULT 'Teknologi',
			poster_url VARCHAR(500),
			video_url VARCHAR(500),
			video_title VARCHAR(255),
			file_url VARCHAR(500),
			file_title VARCHAR(255),
			bank_name VARCHAR(100),
			bank_account_number VARCHAR(100),
			bank_account_holder VARCHAR(255),
			affiliate_code VARCHAR(100),
			commission_rate DECIMAL(5,2) DEFAULT 10,
			status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
			review_note TEXT,
			reviewed_by BIGINT,
			reviewed_at TIMESTAMP NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
			FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
		)
	`)

	// Affiliate ledgers table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS affiliate_ledgers (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			affiliate_submission_id BIGINT NOT NULL,
			order_id VARCHAR(255),
			transaction_amount DECIMAL(15,2) DEFAULT 0,
			platform_fee DECIMAL(15,2) DEFAULT 0,
			affiliate_amount DECIMAL(15,2) DEFAULT 0,
			is_paid_out BOOLEAN DEFAULT FALSE,
			paid_out_at TIMESTAMP NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (affiliate_submission_id) REFERENCES affiliate_submissions(id) ON DELETE CASCADE
		)
	`)

	// Affiliate partnerships table
	// Affiliate partnerships table - matches affiliate_partnership_controller.go
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS affiliate_partnerships (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			event_id BIGINT NOT NULL,
			organization_id BIGINT NOT NULL,
			unique_code VARCHAR(50) UNIQUE,
			commission_percentage DECIMAL(5,2) DEFAULT 10,
			phone VARCHAR(20),
			bank_name VARCHAR(50),
			bank_account VARCHAR(50),
			bank_account_name VARCHAR(100),
			social_media VARCHAR(255),
			is_active BOOLEAN DEFAULT TRUE,
			expires_at TIMESTAMP NULL,
			status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			approved_at TIMESTAMP NULL,
			approved_by BIGINT,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
			FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
			FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
		)
	`)

	// Financial transactions table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS financial_transactions (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			transaction_type VARCHAR(50) NOT NULL,
			entity_type VARCHAR(50),
			entity_id BIGINT,
			user_id BIGINT,
			organization_id BIGINT,
			affiliate_id BIGINT,
			amount DECIMAL(15,2) NOT NULL,
			description TEXT,
			reference_id VARCHAR(255),
			status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
			bank_name VARCHAR(100),
			bank_account VARCHAR(100),
			bank_holder VARCHAR(255),
			proof_url VARCHAR(500),
			notes TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			processed_at TIMESTAMP NULL
		)
	`)

	// Ad banners table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS ad_banners (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			title VARCHAR(255),
			image_url VARCHAR(500) NOT NULL,
			link_url VARCHAR(500),
			placement ENUM('SIDEBAR_LEFT', 'SIDEBAR_RIGHT', 'BANNER_SLIDER') DEFAULT 'SIDEBAR_LEFT',
			is_active BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`)

	// Featured events table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS featured_events (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			event_id BIGINT NOT NULL UNIQUE,
			sort_order INT DEFAULT 0,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
		)
	`)

	// Password reset tokens table
	db.MustExec(`
		CREATE TABLE IF NOT EXISTS password_reset_tokens (
			id BIGINT AUTO_INCREMENT PRIMARY KEY,
			user_id BIGINT NOT NULL,
			token VARCHAR(255) NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			used BOOLEAN DEFAULT FALSE,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
		)
	`)
}

// CleanupTestDB clears all data from tables for fresh tests
func CleanupTestDB(db *sqlx.DB) {
	tables := []string{
		"password_reset_tokens",
		"featured_events",
		"ad_banners",
		"financial_transactions",
		"affiliate_partnerships",
		"affiliate_submissions",
		"affiliates",
		"notifications",
		"reports",
		"cart",
		"purchases",
		"session_files",
		"session_videos",
		"sessions",
		"events",
		"organization_applications",
		"organizations",
		"user_roles",
		"users",
	}

	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	for _, table := range tables {
		db.Exec(fmt.Sprintf("TRUNCATE TABLE %s", table))
	}
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")
}

// TeardownTestDB closes the test database connection
func TeardownTestDB(db *sqlx.DB) {
	if db != nil {
		// Clean up data first
		CleanupTestDB(db)
		db.Close()
	}
}

// Helper to ignore certain errors
func ignoreError(err error, contains string) error {
	if err != nil && !strings.Contains(err.Error(), contains) {
		return err
	}
	return nil
}
