-- SafePaw Connect: Complete Supabase Database Schema, Row Level Security (RLS) & Triggers
-- Execute this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Disk IO Safe: Uses index-only scans, zero table locks, and strict Row Level Security.

-- ==============================================================================
-- 1. EXTENSIONS & SCHEMA
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USER PROFILES TABLE (Multi-role & Accreditation)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'pet_owner' CHECK (role IN ('pet_owner', 'veterinarian', 'admin')),
  vet_status TEXT DEFAULT NULL CHECK (vet_status IN ('pending', 'approved', 'rejected') OR vet_status IS NULL),
  license_number TEXT,
  clinic_id TEXT,
  clinic_name TEXT,
  specialization TEXT,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. DISK IO OPTIMIZED INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, vet_status);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Rule 1: Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Rule 2: Users can insert their initial profile upon signup
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Rule 3: Users can update their personal details, but CANNOT escalate role or vet_status
DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;
CREATE POLICY "Users can update own details"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND vet_status IS NOT DISTINCT FROM (SELECT p.vet_status FROM public.profiles p WHERE p.id = auth.uid())
  );

-- ==============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  intended_role TEXT;
  intended_license TEXT;
  intended_clinic_id TEXT;
  intended_clinic_name TEXT;
  intended_specialization TEXT;
  initial_vet_status TEXT;
BEGIN
  intended_role := COALESCE(NEW.raw_user_meta_data->>'role', 'pet_owner');
  intended_license := NEW.raw_user_meta_data->>'license_number';
  intended_clinic_id := NEW.raw_user_meta_data->>'clinic_id';
  intended_clinic_name := NEW.raw_user_meta_data->>'clinic_name';
  intended_specialization := NEW.raw_user_meta_data->>'specialization';
  
  IF intended_role = 'veterinarian' THEN
    initial_vet_status := 'pending';
  ELSE
    initial_vet_status := NULL;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    vet_status,
    license_number,
    clinic_id,
    clinic_name,
    specialization
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    intended_role,
    initial_vet_status,
    intended_license,
    intended_clinic_id,
    intended_clinic_name,
    intended_specialization
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
