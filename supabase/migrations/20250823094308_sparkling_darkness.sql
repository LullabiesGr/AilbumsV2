/*
  # Support and Bug Report Tables

  1. New Tables
    - `bug_reports`: Store user bug reports
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `user_email` (text)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `priority` (text)
      - `status` (text, default 'open')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `support_requests`: Store user support requests
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `user_email` (text)
      - `subject` (text)
      - `message` (text)
      - `category` (text)
      - `priority` (text)
      - `status` (text, default 'open')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to insert their own reports/requests
    - Add policies for authenticated users to read their own reports/requests
*/

-- Bug Reports Table
CREATE TABLE IF NOT EXISTS bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category text DEFAULT 'general',
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own bug reports"
  ON bug_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own bug reports"
  ON bug_reports
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Support Requests Table
CREATE TABLE IF NOT EXISTS support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  category text DEFAULT 'general',
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE support_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own support requests"
  ON support_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read their own support requests"
  ON support_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Update function for updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_bug_reports_updated_at ON bug_reports;
CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_requests_updated_at ON support_requests;
CREATE TRIGGER update_support_requests_updated_at
  BEFORE UPDATE ON support_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();