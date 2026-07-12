/*
  # Fix Security Issues

  ## Summary
  This migration addresses multiple security and performance issues identified in the database:
  
  1. **Performance Improvements**
     - Add indexes for foreign keys in `booking_services` table:
       - Index on `booking_id` to improve JOIN performance with `bookings` table
       - Index on `service_id` to improve JOIN performance with `services` table
  
  2. **Database Optimization**
     - Remove unused indexes from `stamp_card_requests` table:
       - `idx_stamp_card_requests_email`
       - `idx_stamp_card_requests_status`
       - `idx_stamp_card_requests_status_created`
       - `idx_stamp_card_requests_created_at`
     These indexes are not being used by queries and consume unnecessary space
  
  3. **Function Security**
     - Fix `update_stamp_card_request_updated_at` function to have immutable search_path
     - This prevents potential security vulnerabilities from search_path manipulation
  
  ## Security Notes
  - Foreign key indexes improve query performance and prevent full table scans
  - Removing unused indexes reduces database maintenance overhead
  - Fixed search_path prevents potential SQL injection vectors
*/

-- ==================================================
-- 1. Add indexes for foreign keys in booking_services
-- ==================================================

-- Index for booking_id foreign key
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id 
ON public.booking_services(booking_id);

-- Index for service_id foreign key
CREATE INDEX IF NOT EXISTS idx_booking_services_service_id 
ON public.booking_services(service_id);

-- ==================================================
-- 2. Remove unused indexes from stamp_card_requests
-- ==================================================

DROP INDEX IF EXISTS public.idx_stamp_card_requests_email;
DROP INDEX IF EXISTS public.idx_stamp_card_requests_status;
DROP INDEX IF EXISTS public.idx_stamp_card_requests_status_created;
DROP INDEX IF EXISTS public.idx_stamp_card_requests_created_at;

-- ==================================================
-- 3. Fix function search_path mutability issue
-- ==================================================

-- Drop and recreate the function with proper security settings
DROP FUNCTION IF EXISTS public.update_stamp_card_request_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_stamp_card_request_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger if it exists
DROP TRIGGER IF EXISTS update_stamp_card_requests_updated_at ON public.stamp_card_requests;

CREATE TRIGGER update_stamp_card_requests_updated_at
  BEFORE UPDATE ON public.stamp_card_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stamp_card_request_updated_at();
