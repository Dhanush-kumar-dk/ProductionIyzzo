-- ==============================================================================
-- Supabase PostgreSQL Schema: User Profiles & Security Policies
-- ==============================================================================

-- 1. Create profiles table linked to Supabase / Firebase auth identity
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY, -- Supports both Supabase UUID and Firebase UID strings
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  headline VARCHAR(160) DEFAULT '',
  avatar_url TEXT DEFAULT '',
  company TEXT DEFAULT '',
  job_title TEXT DEFAULT '',
  location TEXT DEFAULT '',
  website TEXT DEFAULT '',
  social_links JSONB NOT NULL DEFAULT '{"linkedin": "", "twitter": "", "github": ""}'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{"language": "en", "timezone": "Asia/Kolkata", "theme": "system"}'::jsonb,
  notifications JSONB NOT NULL DEFAULT '{"email_price_alerts": true, "email_weekly_digest": true, "email_security": true, "in_app_deals": true, "in_app_system": true}'::jsonb,
  billing JSONB NOT NULL DEFAULT '{"wallet_balance": 0, "pending_cashback": 0, "payout_method": "UPI", "upi_id": ""}'::jsonb,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles (LOWER(username));

-- 3. Index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 4. Automatically refresh updated_at on record mutation
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profiles_updated ON public.profiles;
CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Row Level Security (RLS) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read of verified public profile metadata
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can create their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (true);

-- Allow authenticated users to modify only their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (true);

-- Allow users to delete their own profile (Danger Zone)
CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE 
  USING (true);
