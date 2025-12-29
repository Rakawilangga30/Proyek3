-- Migration: Add description column to materials tables

ALTER TABLE affiliate_submission_videos ADD COLUMN description TEXT AFTER title;
ALTER TABLE affiliate_submission_files ADD COLUMN description TEXT AFTER title;
