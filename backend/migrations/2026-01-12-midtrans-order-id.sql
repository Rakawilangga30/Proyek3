-- Add midtrans_order_id column to purchases table
-- This stores the full Midtrans order ID (which may include affiliate code suffix)
-- The order_id column stores the base order ID for our DB lookups

ALTER TABLE purchases ADD COLUMN IF NOT EXISTS midtrans_order_id VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchases_midtrans_order ON purchases(midtrans_order_id);
