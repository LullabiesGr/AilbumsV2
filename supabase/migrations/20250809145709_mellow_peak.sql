/*
  # Create user_credits table

  1. New Tables
    - `user_credits`
      - `id` (uuid, primary key)
      - `user_email` (text, unique)
      - `credits` (integer) - Διαθέσιμα credits
      - `monthly_credits` (integer) - Μηνιαία credits από συνδρομή
      - `extra_credits` (integer) - Extra credits που αγόρασε
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_credits` table
    - Add policy for authenticated users to read/update their own credits
    - Add policy for service role to manage all credits
*/

CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text UNIQUE NOT NULL,
  credits integer NOT NULL DEFAULT 100,
  monthly_credits integer NOT NULL DEFAULT 0,
  extra_credits integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own credits
CREATE POLICY "Users can read own credits"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (user_email = auth.jwt() ->> 'email');

-- Policy for users to update their own credits (for usage tracking)
CREATE POLICY "Users can update own credits"
  ON user_credits
  FOR UPDATE
  TO authenticated
  USING (user_email = auth.jwt() ->> 'email');

-- Policy for service role to manage all credits (for admin operations)
CREATE POLICY "Service role can manage all credits"
  ON user_credits
  FOR ALL
  TO service_role
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_credits_email ON user_credits(user_email);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();