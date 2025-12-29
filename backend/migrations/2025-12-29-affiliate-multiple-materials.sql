-- Migration: Add tables for multiple affiliate submission materials
-- Run this migration to support up to 3 videos and 3 files per submission

-- Table for affiliate submission videos
CREATE TABLE IF NOT EXISTS affiliate_submission_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    title VARCHAR(255),
    url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES affiliate_submissions(id) ON DELETE CASCADE
);

-- Table for affiliate submission files
CREATE TABLE IF NOT EXISTS affiliate_submission_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    title VARCHAR(255),
    url VARCHAR(500) NOT NULL,
    original_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES affiliate_submissions(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_asv_submission_id ON affiliate_submission_videos(submission_id);
CREATE INDEX idx_asf_submission_id ON affiliate_submission_files(submission_id);
