-- ============================================================================
-- Bento Ordering System - Utility Queries
-- ============================================================================
-- Execution Order: 4 (Optional, for checking and maintenance)
-- Description: Provides queries for checking database status
-- ============================================================================

-- ============================================================================
-- Check if tables exist
-- ============================================================================
SELECT
  table_name,
  CASE
    WHEN table_name IN ('user_profiles', 'restaurants', 'menu_items', 'orders', 'order_items', 'ratings')
    THEN '✓ Exists'
    ELSE '✗ Not Found'
  END as status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'restaurants', 'menu_items', 'orders', 'order_items', 'ratings')
ORDER BY table_name;

-- ============================================================================
-- Check if RLS is enabled
-- ============================================================================
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'restaurants', 'menu_items', 'orders', 'order_items', 'ratings')
ORDER BY tablename;

-- ============================================================================
-- Check current user's admin status
-- ============================================================================
SELECT
  id,
  email,
  name,
  is_admin,
  created_at
FROM user_profiles
WHERE id = auth.uid();

-- ============================================================================
-- Check all admins
-- ============================================================================
SELECT
  id,
  email,
  name,
  is_admin,
  created_at
FROM user_profiles
WHERE is_admin = TRUE
ORDER BY created_at;

-- ============================================================================
-- Check indexes
-- ============================================================================
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'restaurants', 'menu_items', 'orders', 'order_items', 'ratings')
ORDER BY tablename, indexname;
