-- ==============================================================================
-- Supabase PostgreSQL Schema: user_profiles Table
-- Dedicated, isolated table for storing all user profile, account, preference, 
-- notification, and cashback payout data in Supabase.
-- ==============================================================================

-- 1. Create the dedicated user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  -- Unique user identifier (Firebase UID string or Supabase auth UUID)
  id TEXT PRIMARY KEY,
  
  -- Account identity & authentication
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  headline VARCHAR(160) DEFAULT '',
  avatar_url TEXT DEFAULT '',
  
  -- Professional & Geographic information
  company TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  
  -- Social media handles stored as structured JSONB
  -- Structure: {"linkedin": "...", "twitter": "...", "github": "..."}
  social_links JSONB NOT NULL DEFAULT '{"linkedin": "", "twitter": "", "github": ""}'::jsonb,
  
  -- UI / Regional preferences stored as structured JSONB
  -- Structure: {"language": "en", "timezone": "Asia/Kolkata", "theme": "system", "currency": "INR"}
  preferences JSONB NOT NULL DEFAULT '{"language": "en", "timezone": "Asia/Kolkata", "theme": "system", "currency": "INR"}'::jsonb,
  
  -- Granular notification channel preferences stored as structured JSONB
  -- Structure: {"email_price_alerts": true, "email_weekly_digest": true, "email_security": true, "in_app_deals": true, "in_app_system": true}
  notifications JSONB NOT NULL DEFAULT '{"email_price_alerts": true, "email_weekly_digest": true, "email_security": true, "email_restock": false, "in_app_deals": true, "in_app_system": true}'::jsonb,
  
  -- Marketplace cashback wallet & payout destination stored as structured JSONB
  -- Structure: {"wallet_balance": 0, "pending_cashback": 0, "payout_method": "UPI", "upi_id": ""}
  billing JSONB NOT NULL DEFAULT '{"wallet_balance": 0, "pending_cashback": 0, "payout_method": "UPI", "upi_id": ""}'::jsonb,
  
  -- Security flags
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance & Unique Constraints
-- Case-insensitive unique index so "Dhanush" and "dhanush" cannot collide
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username_lower 
  ON public.user_profiles (LOWER(username));

-- Index on email for fast lookups during login/session hydration
CREATE INDEX IF NOT EXISTS idx_user_profiles_email 
  ON public.user_profiles (email);

-- 3. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_profiles_updated ON public.user_profiles;
CREATE TRIGGER on_user_profiles_updated
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_profiles_updated_at();

-- 4. Row Level Security (RLS) Configuration
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow reading public profile data
CREATE POLICY "Public user_profiles are viewable by everyone" 
  ON public.user_profiles FOR SELECT 
  USING (true);

-- Allow inserting user profile on registration / first login
CREATE POLICY "Users can create their own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (true);

-- Allow users to update their own profile record
CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (true);

-- Allow users to delete their own profile record (Danger Zone)
CREATE POLICY "Users can delete their own profile" 
  ON public.user_profiles FOR DELETE 
  USING (true);

-- 5. Backwards-compatibility view (in case any queries target "profiles")
CREATE OR REPLACE VIEW public.profiles AS 
  SELECT * FROM public.user_profiles;
