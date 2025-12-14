-- ============================================================================
-- Bento Ordering System - Row Level Security (RLS) Policies
-- ============================================================================
-- Execution Order: 2
-- Description: Enable RLS and create all security policies
-- Note: This script uses user_profiles.is_admin to check admin permissions
-- ============================================================================

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- user_profiles RLS Policies
-- ============================================================================

-- Anyone can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Anyone can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- restaurants RLS Policies
-- ============================================================================

-- Anyone can view restaurants
CREATE POLICY "Anyone can view restaurants" ON restaurants
  FOR SELECT USING (true);

-- Admins can insert restaurants
CREATE POLICY "Admins can insert restaurants" ON restaurants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can update restaurants
CREATE POLICY "Admins can update restaurants" ON restaurants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admins can delete restaurants
CREATE POLICY "Admins can delete restaurants" ON restaurants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- menu_items RLS Policies
-- ============================================================================

-- Anyone can view menu items
CREATE POLICY "Anyone can view menu items" ON menu_items
  FOR SELECT USING (true);

-- Admins can manage menu items
CREATE POLICY "Admins can manage menu items" ON menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- orders RLS Policies
-- ============================================================================

-- Anyone can view orders
CREATE POLICY "Anyone can view orders" ON orders
  FOR SELECT USING (true);

-- Admins can manage orders
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- ============================================================================
-- order_items RLS Policies
-- ============================================================================

-- Anyone can view order items
CREATE POLICY "Anyone can view order items" ON order_items
  FOR SELECT USING (true);

-- Anyone can insert their own order items
CREATE POLICY "Users can insert own order items" ON order_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can delete their own order items
CREATE POLICY "Users can delete own order items" ON order_items
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- ratings RLS Policies
-- ============================================================================

-- Anyone can view ratings
CREATE POLICY "Anyone can view ratings" ON ratings
  FOR SELECT USING (true);

-- Anyone can insert their own ratings
CREATE POLICY "Users can insert own ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can update their own ratings
CREATE POLICY "Users can update own ratings" ON ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Anyone can delete their own ratings
CREATE POLICY "Users can delete own ratings" ON ratings
  FOR DELETE USING (auth.uid() = user_id);
