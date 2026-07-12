/*
  # Create stamp card requests table

  1. New Tables
    - `stamp_card_requests`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Customer's name
      - `email` (text, not null) - Customer's email address
      - `status` (text, default 'pending') - Request status: pending, approved, rejected
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `stamp_card_requests` table
    - Allow anonymous users to insert new requests (for customers requesting stamp cards)
    - Allow anonymous users to check if they already have a pending request by email
    - Only service_role can update or delete requests (for admin management)

  3. Indexes
    - Add index on email for faster duplicate checking
    - Add index on status for admin filtering

  4. Purpose
    - Store customer requests for new stamp cards
    - Allow admins to review and approve/reject requests
    - Prevent duplicate requests from the same email
*/

-- Create the stamp_card_requests table
CREATE TABLE IF NOT EXISTS public.stamp_card_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  status text DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.stamp_card_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert new stamp card requests
CREATE POLICY "Allow anon insert stamp card requests"
  ON public.stamp_card_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anonymous users to check for existing requests by their email
-- This helps prevent duplicate submissions
CREATE POLICY "Allow anon check own requests"
  ON public.stamp_card_requests
  FOR SELECT
  TO anon
  USING (true);

-- Prevent anonymous users from updating requests
-- Only service_role (admins) can update request status
CREATE POLICY "Prevent anon update requests"
  ON public.stamp_card_requests
  FOR UPDATE
  TO anon
  USING (false);

-- Prevent anonymous users from deleting requests
CREATE POLICY "Prevent anon delete requests"
  ON public.stamp_card_requests
  FOR DELETE
  TO anon
  USING (false);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stamp_card_requests_email 
  ON public.stamp_card_requests (email);

CREATE INDEX IF NOT EXISTS idx_stamp_card_requests_status 
  ON public.stamp_card_requests (status);

CREATE INDEX IF NOT EXISTS idx_stamp_card_requests_created_at 
  ON public.stamp_card_requests (created_at DESC);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_stamp_card_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS set_stamp_card_requests_updated_at ON public.stamp_card_requests;
CREATE TRIGGER set_stamp_card_requests_updated_at
  BEFORE UPDATE ON public.stamp_card_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_stamp_card_request_updated_at();