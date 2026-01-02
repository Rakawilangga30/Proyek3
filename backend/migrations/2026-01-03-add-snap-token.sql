-- Migration: Add snap_token column to purchases table
-- This allows users to continue pending payments

ALTER TABLE purchases ADD COLUMN snap_token VARCHAR(255) NULL AFTER order_id;
