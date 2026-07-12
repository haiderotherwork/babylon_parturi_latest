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
    - No policies created - access restricted to service_role key only
*/

-- Create the email_verification_codes table
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- No RLS policies are created for anon or authenticated roles.
-- Access to this table is restricted to service_role key via Edge Functions.