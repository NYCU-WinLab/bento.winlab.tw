# SQL Script Execution Guide

This directory contains all SQL scripts required for the Bento ordering system. Please execute them in order.

## Execution Order

### 1. `01-schema.sql` - Database Structure
**Required** - Creates all necessary tables, indexes, and triggers

- Create `user_profiles` table
- Create `restaurants` table
- Create `menu_items` table
- Create `orders` table
- Create `order_items` table
- Create `ratings` table
- Create all necessary indexes
- Create triggers for auto-updating `updated_at`
- Create trigger for auto-creating `user_profiles`

### 2. `02-rls-policies.sql` - Row Level Security Policies
**Required** - Enables RLS and creates all security policies

- Enable RLS on all tables
- Create user permission policies
- Create admin permission policies
- Create order and rating related policies

### 3. `03-fix-rls-policies.sql` - Fix RLS Policies
**Optional** - Execute only when fixing existing policies

- Fix old RLS policies
- Remove direct queries to `auth.users`
- Unify admin permission checks using `user_profiles.is_admin`

### 4. `04-utilities.sql` - Utility Queries
**Optional** - For checking and maintenance

- Check if tables exist
- Check if RLS is enabled
- Check current user's admin status
- Check all admins
- Check indexes

## Execution Method

1. Log in to Supabase Dashboard
2. Go to **SQL Editor**
3. Execute each SQL file in order
4. Confirm each script executed successfully

## Notes

- ⚠️ **Initial Setup**: Must execute `01-schema.sql` and `02-rls-policies.sql`
- ⚠️ **Fix Permission Issues**: If you encounter permission errors, execute `03-fix-rls-policies.sql`
- ⚠️ **Check Status**: Use queries in `04-utilities.sql` to check database status

## Set Up Admin

After executing SQL scripts, refer to [ADMIN_SETUP.md](../ADMIN_SETUP.md) to set up admin permissions.
