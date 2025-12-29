-- Migration: Add event_id to affiliate_submissions for simplified flow
-- Affiliate now creates event/session directly, this links submission to the event

ALTER TABLE affiliate_submissions 
ADD COLUMN event_id BIGINT NULL AFTER user_id;

-- Add foreign key constraint
ALTER TABLE affiliate_submissions
ADD CONSTRAINT fk_affiliate_event 
FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_affiliate_submissions_event_id ON affiliate_submissions(event_id);
