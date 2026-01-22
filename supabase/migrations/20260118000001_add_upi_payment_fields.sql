-- Add UPI payment fields to teams table
-- This migration adds fields needed for QR code based UPI payments

-- Add transaction_id column
ALTER TABLE teams ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- Add account_holder_name column  
ALTER TABLE teams ADD COLUMN IF NOT EXISTS account_holder_name TEXT;

-- Update payment_gateway type to include 'upi' and 'free'
-- First check existing values and update enum constraint if needed
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_payment_gateway_check;

-- Add new constraint allowing: razorpay, upi, free, manual
ALTER TABLE teams ADD CONSTRAINT teams_payment_gateway_check 
  CHECK (payment_gateway IN ('razorpay', 'upi', 'free', 'manual', 'paytm', 'stripe'));

-- Update payment_status to include 'pending_verification' and 'not_required'
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_payment_status_check;

ALTER TABLE teams ADD CONSTRAINT teams_payment_status_check 
  CHECK (payment_status IN ('created', 'pending', 'pending_verification', 'completed', 'failed', 'refunded', 'not_required'));

-- Create index for transaction_id lookups
CREATE INDEX IF NOT EXISTS idx_teams_transaction_id ON teams(transaction_id);

COMMENT ON COLUMN teams.transaction_id IS 'UPI Transaction ID / UTR number entered by user';
COMMENT ON COLUMN teams.account_holder_name IS 'Name of the account holder who made the payment';
