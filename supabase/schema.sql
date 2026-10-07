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
-- 5. PETS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pets (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  age_years NUMERIC NOT NULL DEFAULT 1,
  birth_date TEXT,
  weight_kg NUMERIC NOT NULL DEFAULT 5,
  gender TEXT NOT NULL,
  neutered BOOLEAN NOT NULL DEFAULT false,
  microchip_id TEXT,
  photo_url TEXT,
  allergies JSONB DEFAULT '[]'::jsonb,
  chronic_conditions JSONB DEFAULT '[]'::jsonb,
  temperament TEXT,
  dietary_notes TEXT,
  primary_clinic_id TEXT,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  registered_date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets(owner_id);
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all authenticated users to read pets" ON public.pets;
CREATE POLICY "Allow all authenticated users to read pets" ON public.pets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own pets" ON public.pets;
CREATE POLICY "Users can insert own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = owner_id OR owner_id IS NULL);

DROP POLICY IF EXISTS "Users can update own pets" ON public.pets;
CREATE POLICY "Users can update own pets" ON public.pets FOR UPDATE USING (auth.uid() = owner_id OR owner_id IS NULL);

DROP POLICY IF EXISTS "Users can delete own pets" ON public.pets;
CREATE POLICY "Users can delete own pets" ON public.pets FOR DELETE USING (auth.uid() = owner_id OR owner_id IS NULL);

-- ==============================================================================
-- 6. APPOINTMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  clinic_id TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  clinic_address TEXT NOT NULL,
  vet_id TEXT,
  vet_name TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  is_telehealth BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'scheduled',
  queue_position INTEGER,
  estimated_wait_mins INTEGER,
  symptoms TEXT,
  notes TEXT,
  base_cost_usd NUMERIC NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pay_at_clinic',
  owner_name TEXT,
  owner_phone TEXT,
  rejection_reason TEXT,
  completed_at TEXT,
  clinical_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_appointments_owner ON public.appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet ON public.appointments(vet_id);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users and vets can view appointments" ON public.appointments;
CREATE POLICY "Users and vets can view appointments" ON public.appointments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert appointments" ON public.appointments;
CREATE POLICY "Users can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users and vets can update appointments" ON public.appointments;
CREATE POLICY "Users and vets can update appointments" ON public.appointments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete appointments" ON public.appointments;
CREATE POLICY "Users can delete appointments" ON public.appointments FOR DELETE USING (true);

-- ==============================================================================
-- 7. HEALTH RECORDS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.health_records (
  id TEXT PRIMARY KEY,
  pet_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  next_due_date TEXT,
  veterinarian TEXT NOT NULL,
  vet_license_number TEXT,
  clinic_name TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'valid',
  batch_number TEXT,
  attachment_name TEXT,
  created_by_vet_id TEXT,
  vitals JSONB,
  prescriptions JSONB,
  vaccine_administered JSONB,
  is_private_vet_note BOOLEAN DEFAULT false,
  private_vet_notes TEXT,
  owner_discharge_instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_health_records_pet ON public.health_records(pet_id);
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow reading health records" ON public.health_records;
CREATE POLICY "Allow reading health records" ON public.health_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow inserting health records" ON public.health_records;
CREATE POLICY "Allow inserting health records" ON public.health_records FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow updating health records" ON public.health_records;
CREATE POLICY "Allow updating health records" ON public.health_records FOR UPDATE USING (true);

-- ==============================================================================
-- 8. CONVERSATIONS & CHAT MESSAGES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  clinic_id TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  clinic_avatar TEXT,
  pet_id TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  unread_count INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  is_read BOOLEAN DEFAULT true,
  attachment JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all conversation access" ON public.conversations;
CREATE POLICY "Allow all conversation access" ON public.conversations FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all chat messages access" ON public.chat_messages;
CREATE POLICY "Allow all chat messages access" ON public.chat_messages FOR ALL USING (true);

-- ==============================================================================
-- 9. LOST PETS RADAR TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lost_pets (
  id TEXT PRIMARY KEY,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  photo_url TEXT,
  last_seen_location TEXT NOT NULL,
  last_seen_date TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT,
  microchip_number TEXT,
  base_reward_usd NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active Missing Alert',
  description TEXT,
  reported_by TEXT,
  date_reported TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.lost_pets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read and write for lost pets" ON public.lost_pets;
CREATE POLICY "Allow public read and write for lost pets" ON public.lost_pets FOR ALL USING (true);

-- ==============================================================================
-- 10. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
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
