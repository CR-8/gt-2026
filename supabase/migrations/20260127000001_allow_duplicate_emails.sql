-- Allow duplicate emails for multiple registrations
-- Remove UNIQUE constraint from captain_email in teams table
-- Remove UNIQUE constraint from (team_id, member_email) in team_members table
-- Make college_name optional (nullable)

-- Drop the unique constraint on captain_email
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_captain_email_key;

-- Drop the unique constraint on (team_id, member_email)
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_team_id_member_email_key;

-- Make college_name nullable
ALTER TABLE teams ALTER COLUMN college_name DROP NOT NULL;