-- Add access_code to admin_users table for rotating security
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS access_code TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create access_codes table for rotating codes
CREATE TABLE IF NOT EXISTS access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_codes_active ON access_codes(is_active, code);

-- Insert a default access code (change this immediately!)
INSERT INTO access_codes (code, is_active) 
VALUES ('GANTAVYA2026', true)
ON CONFLICT (code) DO NOTHING;
