/*
  # Update user_credits table structure

  1. Changes
    - Remove user_email column (deprecated)
    - Ensure user_id column exists and is properly configured
    - Update RLS policies to use auth.uid() instead of email
    - Add proper foreign key constraint to auth.users

  2. Security
    - Update RLS policies for new structure
    - Ensure users can only access their own credits via user_id
*/

-- Add user_id column if it doesn't exist (should already exist from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_credits' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE user_credits ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Remove user_email column if it exists (cleanup)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_credits' AND column_name = 'user_email'
  ) THEN
    ALTER TABLE user_credits DROP COLUMN user_email;
  END IF;
END $$;

-- Ensure user_id is NOT NULL and has proper constraint
ALTER TABLE user_credits ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_credits_user_id_fkey' 
    AND table_name = 'user_credits'
  ) THEN
    ALTER TABLE user_credits 
    ADD CONSTRAINT user_credits_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Users can read own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
DROP POLICY IF EXISTS "Service role can manage all credits" ON user_credits;

-- Create new policies using user_id
CREATE POLICY "Users can read own credits by user_id"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own credits by user_id"
  ON user_credits
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own credits by user_id"
  ON user_credits
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy for service role to manage all credits (for admin operations)
CREATE POLICY "Service role can manage all credits"
  ON user_credits
  FOR ALL
  TO service_role
  USING (true);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);

-- Drop old email index if it exists
DROP INDEX IF EXISTS idx_user_credits_email;