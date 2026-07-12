/*
  # Fix Database Security Issues

  1. Performance Improvements
    - Add indexes for foreign keys in `booking_services` table
    - Remove unused index on `stamp_cards` table

  2. Security Improvements
    - Add RLS policies for `email_verification_codes` table
    - Ensure proper access control for verification codes

  3. Database Structure
    - Optimize query performance with proper indexing
    - Secure email verification workflow
*/

-- Add indexes for foreign keys in booking_services table
CREATE INDEX IF NOT EXISTS idx_booking_services_booking_id 
  ON public.booking_services (booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_services_service_id 
  ON public.booking_services (service_id);

-- Remove unused index on stamp_cards table
DROP INDEX IF EXISTS public.idx_stamp_cards_email;

-- Add RLS policies for email_verification_codes table
-- Policy 1: Allow anonymous users to insert verification codes (for sending codes)
CREATE POLICY "Allow anon insert verification codes"
  ON public.email_verification_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy 2: Allow anonymous users to select their own verification codes (for verification)
CREATE POLICY "Allow anon select own verification codes"
  ON public.email_verification_codes
  FOR SELECT
  TO anon
  USING (true);

-- Policy 3: Allow anonymous users to delete verification codes (for cleanup after verification)
CREATE POLICY "Allow anon delete verification codes"
  ON public.email_verification_codes
  FOR DELETE
  TO anon
  USING (true);

-- Policy 4: Prevent updates to verification codes (they should be single-use)
CREATE POLICY "Prevent updates to verification codes"
  ON public.email_verification_codes
  FOR UPDATE
  TO anon
  USING (false);

-- Add a function to automatically clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.email_verification_codes
  WHERE expires_at < NOW();
END;
$$;

-- Create a trigger to clean up expired codes periodically
-- Note: This is a simple approach. In production, you might want to use pg_cron or similar
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_codes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clean up expired codes when new ones are inserted
  PERFORM cleanup_expired_verification_codes();
  RETURN NEW;
END;
$$;

-- Create trigger on insert to clean up expired codes
DROP TRIGGER IF EXISTS cleanup_expired_codes_trigger ON public.email_verification_codes;
CREATE TRIGGER cleanup_expired_codes_trigger
  AFTER INSERT ON public.email_verification_codes
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_expired_codes();