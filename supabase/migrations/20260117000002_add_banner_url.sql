-- Add banner_url column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN events.banner_url IS 'URL to the event banner image';
