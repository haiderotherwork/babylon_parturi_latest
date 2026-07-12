# Security Fixes Applied

This document outlines all security fixes that have been applied to the Babylon Parturi application.

## Database Security Fixes (Completed)

### 1. Foreign Key Indexes Added ✅

**Issue:** Table `public.booking_services` had foreign keys without covering indexes, leading to suboptimal query performance.

**Fix:** Added indexes for both foreign keys:
- `idx_booking_services_booking_id` - Index on `booking_id` column
- `idx_booking_services_service_id` - Index on `service_id` column

**Impact:** Improved JOIN performance between `booking_services` and related tables (`bookings` and `services`).

### 2. Unused Indexes Removed ✅

**Issue:** Table `public.stamp_card_requests` had 4 unused indexes consuming unnecessary storage:
- `idx_stamp_card_requests_email`
- `idx_stamp_card_requests_status`
- `idx_stamp_card_requests_status_created`
- `idx_stamp_card_requests_created_at`

**Fix:** Removed all unused indexes.

**Impact:** Reduced database size and maintenance overhead. Only the primary key index remains on this table.

### 3. Function Search Path Security ✅

**Issue:** Function `public.update_stamp_card_request_updated_at` had a role-mutable search_path, which could be exploited for SQL injection.

**Fix:** Recreated the function with:
- `SECURITY DEFINER` flag
- Fixed `search_path` set to `public, pg_temp`

**Impact:** Prevents potential security vulnerabilities from search_path manipulation attacks.

## Authentication Security (Manual Configuration Required)

### 4. Leaked Password Protection ⚠️

**Issue:** Supabase Auth leaked password protection is disabled.

**Fix Required:** This must be enabled through the Supabase Dashboard:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `cvxjdtxivokoqoblgrbs`
3. Navigate to **Authentication** → **Settings**
4. Scroll to **Security and Protection**
5. Find **"Breach Detection (HaveIBeenPwned)"** or **"Leaked Password Protection"**
6. Toggle it **ON**

**Impact:** When enabled, Supabase will check user passwords against the HaveIBeenPwned database to prevent the use of compromised passwords.

**Why Manual?** This setting is managed through Supabase's Authentication API configuration, not through database migrations.

## Verification

You can verify these fixes were applied by checking:

```sql
-- 1. Verify foreign key indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'booking_services'
AND schemaname = 'public';

-- 2. Verify unused indexes were removed
SELECT indexname
FROM pg_indexes
WHERE tablename = 'stamp_card_requests'
AND schemaname = 'public';

-- 3. Verify function security settings
SELECT proname, prosecdef, pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'update_stamp_card_request_updated_at';
```

## Migration File

All database fixes are contained in the migration file:
`supabase/migrations/fix_security_issues.sql`

This migration is idempotent and can be safely run multiple times.
