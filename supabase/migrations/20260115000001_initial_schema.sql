-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: events
-- ============================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    brief TEXT NOT NULL,
    description TEXT NOT NULL,
    
    min_team_size INT NOT NULL CHECK (min_team_size > 0),
    max_team_size INT NOT NULL CHECK (max_team_size >= min_team_size),
    
    rulebook_url TEXT,
    
    prize_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    prize_currency TEXT NOT NULL DEFAULT 'INR',
    
    start_time TIMESTAMP WITH TIME ZONE,
    venue TEXT,
    
    visibility TEXT NOT NULL DEFAULT 'draft' CHECK (visibility IN ('draft', 'public', 'hidden', 'archived')),
    registration_open BOOLEAN NOT NULL DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Index for faster slug lookups
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_visibility ON events(visibility);

-- ============================================
-- TABLE: event_rules
-- ============================================
CREATE TABLE event_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    rule_text TEXT NOT NULL
);

CREATE INDEX idx_event_rules_event_id ON event_rules(event_id);

-- ============================================
-- TABLE: teams
-- ============================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    team_name TEXT NOT NULL,
    college_name TEXT NOT NULL,
    
    captain_name TEXT NOT NULL,
    captain_email TEXT NOT NULL UNIQUE,
    
    total_amount_payable NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    
    has_paid BOOLEAN NOT NULL DEFAULT false,
    
    payment_gateway TEXT NOT NULL DEFAULT 'razorpay',
    payment_order_id TEXT UNIQUE,
    payment_mode TEXT CHECK (payment_mode IN ('upi', 'card', 'netbanking')),
    payment_status TEXT NOT NULL DEFAULT 'created' CHECK (payment_status IN ('created', 'captured', 'failed')),
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_teams_event_id ON teams(event_id);
CREATE INDEX idx_teams_captain_email ON teams(captain_email);
CREATE INDEX idx_teams_payment_order_id ON teams(payment_order_id);
CREATE INDEX idx_teams_has_paid ON teams(has_paid);

-- ============================================
-- TABLE: team_members
-- ============================================
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    
    member_name TEXT NOT NULL,
    member_email TEXT NOT NULL,
    member_contact TEXT NOT NULL,
    
    role TEXT NOT NULL CHECK (role IN ('captain', 'member')),
    
    is_active BOOLEAN NOT NULL DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(team_id, member_email)
);

-- Ensure only one captain per team
CREATE UNIQUE INDEX idx_team_members_captain ON team_members(team_id) WHERE role = 'captain';
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

-- ============================================
-- TABLE: admin_users
-- ============================================
CREATE TABLE admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_users_email ON admin_users(email);

-- ============================================
-- TRIGGER: Enforce max_team_size
-- ============================================
CREATE OR REPLACE FUNCTION check_team_size()
RETURNS TRIGGER AS $$
DECLARE
    current_size INT;
    max_size INT;
BEGIN
    -- Get current team size
    SELECT COUNT(*) INTO current_size
    FROM team_members
    WHERE team_id = NEW.team_id AND is_active = true;
    
    -- Get max team size for the event
    SELECT e.max_team_size INTO max_size
    FROM events e
    INNER JOIN teams t ON t.event_id = e.id
    WHERE t.id = NEW.team_id;
    
    -- Check if adding this member would exceed max
    IF current_size >= max_size THEN
        RAISE EXCEPTION 'Team has reached maximum size of % members', max_size;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_max_team_size
BEFORE INSERT ON team_members
FOR EACH ROW
EXECUTE FUNCTION check_team_size();

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VIEW: event_kpis
-- ============================================
CREATE OR REPLACE VIEW event_kpis AS
SELECT 
    e.id AS event_id,
    e.name AS event_name,
    e.visibility,
    COUNT(DISTINCT t.id) AS total_teams,
    COUNT(DISTINCT tm.id) AS total_participants,
    COUNT(DISTINCT CASE WHEN t.has_paid = true THEN t.id END) AS paid_teams,
    COALESCE(SUM(CASE WHEN t.has_paid = true THEN t.total_amount_payable END), 0) AS total_collection
FROM events e
LEFT JOIN teams t ON e.id = t.event_id AND t.is_active = true
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.is_active = true
GROUP BY e.id, e.name, e.visibility;
