-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Public users can read public events
CREATE POLICY "Public events are viewable by everyone"
ON events FOR SELECT
USING (visibility = 'public');

-- Admins can do everything with events
CREATE POLICY "Admins can view all events"
ON events FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can insert events"
ON events FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can update events"
ON events FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can delete events"
ON events FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- ============================================
-- EVENT_RULES POLICIES
-- ============================================

-- Public users can read rules for public events
CREATE POLICY "Rules for public events are viewable"
ON event_rules FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM events
        WHERE events.id = event_rules.event_id
        AND events.visibility = 'public'
    )
);

-- Admins can manage all rules
CREATE POLICY "Admins can view all rules"
ON event_rules FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can insert rules"
ON event_rules FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can update rules"
ON event_rules FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

CREATE POLICY "Admins can delete rules"
ON event_rules FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- ============================================
-- TEAMS POLICIES
-- ============================================

-- Public users can insert teams (registration)
CREATE POLICY "Anyone can register teams"
ON teams FOR INSERT
WITH CHECK (true);

-- Teams cannot read other teams
CREATE POLICY "Teams cannot view other teams"
ON teams FOR SELECT
USING (false);

-- Admins can view all teams
CREATE POLICY "Admins can view all teams"
ON teams FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Admins can update teams
CREATE POLICY "Admins can update teams"
ON teams FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Only webhooks (service role) can update has_paid
-- This is enforced at application level via service role key

-- ============================================
-- TEAM_MEMBERS POLICIES
-- ============================================

-- Public users can insert members during registration
CREATE POLICY "Anyone can add team members during registration"
ON team_members FOR INSERT
WITH CHECK (true);

-- Members cannot read other members
CREATE POLICY "Members cannot view others"
ON team_members FOR SELECT
USING (false);

-- Admins can view all members
CREATE POLICY "Admins can view all members"
ON team_members FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- Admins can update members
CREATE POLICY "Admins can update members"
ON team_members FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
    )
);

-- ============================================
-- ADMIN_USERS POLICIES
-- ============================================

-- Only super_admins can manage admin_users
CREATE POLICY "Super admins can view admin users"
ON admin_users FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can insert admin users"
ON admin_users FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can update admin users"
ON admin_users FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'super_admin'
    )
);

CREATE POLICY "Super admins can delete admin users"
ON admin_users FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.id = auth.uid()
        AND admin_users.role = 'super_admin'
    )
);
