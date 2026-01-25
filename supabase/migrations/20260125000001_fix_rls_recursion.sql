-- Fix infinite recursion in RLS policies for admin_users
-- Add policy to allow users to read their own admin record

CREATE POLICY "Users can view own admin record"
ON admin_users FOR SELECT
TO authenticated
USING (id = auth.uid());