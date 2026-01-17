-- Add entry_fee and content fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS entry_fee NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS content TEXT;
