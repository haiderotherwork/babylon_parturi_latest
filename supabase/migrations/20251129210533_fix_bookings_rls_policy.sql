/*
  # Fix Bookings RLS Policy

  1. Purpose
    - Ensure anonymous users can insert bookings without authentication
    - Fix any potential RLS policy conflicts
    - Add explicit policies for all operations

  2. Changes
    - Drop and recreate RLS policies for bookings table
    - Drop and recreate RLS policies for booking_services table
    - Ensure policies are permissive and allow anonymous access

  3. Security
    - Allow anonymous users to INSERT bookings (public booking form)
    - Allow anonymous users to SELECT their bookings (for confirmation)
    - Allow anonymous users to INSERT booking_services (junction table)
    - Authenticated users can UPDATE and manage bookings
*/

-- Drop existing policies for bookings
DROP POLICY IF EXISTS "Allow anon insert booking" ON public.bookings;
DROP POLICY IF EXISTS "Select anon policy" ON public.bookings;
DROP POLICY IF EXISTS "Allow authenticated update bookings" ON public.bookings;

-- Drop existing policies for booking_services
DROP POLICY IF EXISTS "Allow anon insert booking_services" ON public.booking_services;
DROP POLICY IF EXISTS "Allow anon select booking_services" ON public.booking_services;
DROP POLICY IF EXISTS "Allow authenticated select booking_services" ON public.booking_services;

-- Create comprehensive policies for bookings table
CREATE POLICY "Allow anonymous insert bookings"
  ON public.bookings
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select bookings"
  ON public.bookings
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated select bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update bookings"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete bookings"
  ON public.bookings
  FOR DELETE
  TO authenticated
  USING (true);

-- Create comprehensive policies for booking_services table
CREATE POLICY "Allow anonymous insert booking_services"
  ON public.booking_services
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous select booking_services"
  ON public.booking_services
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated select booking_services"
  ON public.booking_services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated update booking_services"
  ON public.booking_services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete booking_services"
  ON public.booking_services
  FOR DELETE
  TO authenticated
  USING (true);
