/*
  # Create email verification codes table

  1. New Tables
    - `email_verification_codes`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `code` (text, not null)
      - `expires_at` (timestamptz, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `email_verification_codes` table
    - No policies for anon/authenticated users (service_role only access)

  3. Purpose
    - Store temporary verification codes for stamp card email verification
    - Codes expire after 15 minutes
    - Only one active code per email (unique constraint)
*/

CREATE TABLE IF NOT EXISTS email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - service_role bypasses RLS
-- This ensures only Edge Functions can access this table