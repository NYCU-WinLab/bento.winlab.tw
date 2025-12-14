-- ============================================================================
-- Bento Ordering System - Fix RLS Policies
-- ============================================================================
-- Execution Order: 3 (Execute only when fixing existing policies)
-- Description: Fix old RLS policies, remove direct queries to auth.users
-- Use Case: If previously created RLS policies have permission issues, execute this script to fix
-- ============================================================================

-- Drop old restaurants INSERT policy (if exists)
DROP POLICY IF EXISTS "Admins can insert restaurants" ON restaurants;

-- Create new restaurants INSERT policy (using only user_profiles)
CREATE POLICY "Admins can insert restaurants" ON restaurants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Drop old restaurants UPDATE policy (if exists)
DROP POLICY IF EXISTS "Admins can update restaurants" ON restaurants;

-- Create new restaurants UPDATE policy
CREATE POLICY "Admins can update restaurants" ON restaurants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Drop old menu_items policy (if exists)
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;

-- Create new menu_items policy
CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Drop old orders policy (if exists)
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;

-- Create new orders policy
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
