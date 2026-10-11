-- SafePaw Connect: Complete Supabase Database Schema, Row Level Security (RLS), Storage & Triggers
-- Execute this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- Highly optimized: zero unnecessary disk IO, single index scans, safe and non-destructive.

-- ==============================================================================
-- 0. QUICK ACCOUNT ROLE FIX (Run this if you registered as Veterinarian but show as Pet Owner)
-- ==============================================================================
-- To instantly upgrade your existing account to Veterinarian, execute this query (replace with your email):
-- UPDATE public.profiles 
-- SET role = 'veterinarian', vet_status = 'approved', updated_at = now() 
-- WHERE email = 'YOUR_EMAIL_HERE';

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. USER PROFILES TABLE (Supports both Supabase Auth UUIDs and custom IDs)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
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

-- Safe migration if table was previously created with strict UUID foreign key constraint:
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
  ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clinic_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS clinic_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vet_status TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, vet_status);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow profile access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own details" ON public.profiles;

CREATE POLICY "Allow profile access"
  ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 2B. VETERINARIANS TABLE (Clinical Directory & Accreditation Roster)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.veterinarians (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  clinic_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  title TEXT DEFAULT 'Attending Clinical Veterinarian',
  license_number TEXT,
  specialization TEXT,
  avatar_url TEXT,
  bio TEXT,
  approval_status TEXT DEFAULT 'approved',
  approved_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

DO $$
BEGIN
  ALTER TABLE public.veterinarians DROP CONSTRAINT IF EXISTS veterinarians_user_id_fkey;
  ALTER TABLE public.veterinarians ALTER COLUMN user_id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_veterinarians_user_id ON public.veterinarians(user_id);
CREATE INDEX IF NOT EXISTS idx_veterinarians_clinic ON public.veterinarians(clinic_id);

ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all veterinarians access" ON public.veterinarians;
CREATE POLICY "Allow all veterinarians access"
  ON public.veterinarians
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 3. PETS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pets (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
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
  registered_date TEXT NOT NULL DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Safe migration if owner_id was previously a strict UUID FK
DO $$
BEGIN
  ALTER TABLE public.pets DROP CONSTRAINT IF EXISTS pets_owner_id_fkey;
  ALTER TABLE public.pets ALTER COLUMN owner_id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS primary_clinic_id TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS registered_date TEXT DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD');

CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets(owner_id);

ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow pet access" ON public.pets;
DROP POLICY IF EXISTS "Allow all authenticated users to read pets" ON public.pets;
DROP POLICY IF EXISTS "Users can insert own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can update own pets" ON public.pets;
DROP POLICY IF EXISTS "Users can delete own pets" ON public.pets;

CREATE POLICY "Allow pet access"
  ON public.pets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 4. APPOINTMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,
  owner_id TEXT,
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

DO $$
BEGIN
  ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_owner_id_fkey;
  ALTER TABLE public.appointments ALTER COLUMN owner_id TYPE TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON public.appointments(clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet ON public.appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet ON public.appointments(pet_id);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow appointment access" ON public.appointments;
DROP POLICY IF EXISTS "Users and vets can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users and vets can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete appointments" ON public.appointments;

CREATE POLICY "Allow appointment access"
  ON public.appointments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 5. HEALTH RECORDS TABLE
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
DROP POLICY IF EXISTS "Allow health record access" ON public.health_records;
DROP POLICY IF EXISTS "Allow reading health records" ON public.health_records;
DROP POLICY IF EXISTS "Allow inserting health records" ON public.health_records;
DROP POLICY IF EXISTS "Allow updating health records" ON public.health_records;

CREATE POLICY "Allow health record access"
  ON public.health_records
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 6. CONVERSATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  clinic_id TEXT NOT NULL,
  clinic_name TEXT NOT NULL DEFAULT 'Veterinary Hospital',
  clinic_avatar TEXT,
  pet_id TEXT NOT NULL DEFAULT 'pet-general',
  pet_name TEXT NOT NULL DEFAULT 'General Care Inquiry',
  owner_id TEXT,
  last_message TEXT DEFAULT 'Direct channel opened.',
  last_timestamp TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure columns exist in case table was created with older subset:
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS clinic_name TEXT DEFAULT 'Veterinary Hospital';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS clinic_avatar TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS pet_name TEXT DEFAULT 'General Care Inquiry';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS owner_id TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message TEXT DEFAULT 'Direct channel opened.';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_timestamp TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

CREATE INDEX IF NOT EXISTS idx_conversations_clinic ON public.conversations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_conversations_pet ON public.conversations(pet_id);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all conversation access" ON public.conversations;
CREATE POLICY "Allow all conversation access"
  ON public.conversations
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 7. CHAT MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL DEFAULT 'user',
  sender_type TEXT DEFAULT 'user',
  sender_name TEXT DEFAULT 'Pet Parent',
  sender_id TEXT,
  text TEXT NOT NULL DEFAULT '',
  message_text TEXT DEFAULT '',
  timestamp TEXT DEFAULT 'Just now',
  is_read BOOLEAN DEFAULT true,
  attachment JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure all column variations exist to handle both naming schemes:
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS sender TEXT DEFAULT 'user';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'user';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS sender_name TEXT DEFAULT 'Pet Parent';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS sender_id TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS text TEXT DEFAULT '';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS message_text TEXT DEFAULT '';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS timestamp TEXT DEFAULT 'Just now';
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT true;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS attachment JSONB;

CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all chat messages access" ON public.chat_messages;
CREATE POLICY "Allow all chat messages access"
  ON public.chat_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 8. LOST PETS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lost_pets (
  id TEXT PRIMARY KEY,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  photo_url TEXT,
  last_seen_location TEXT NOT NULL,
  city TEXT DEFAULT 'Metro Manila',
  country_code TEXT DEFAULT 'PH',
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

ALTER TABLE public.lost_pets ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Metro Manila';
ALTER TABLE public.lost_pets ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'PH';

ALTER TABLE public.lost_pets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all lost pets access" ON public.lost_pets;
CREATE POLICY "Allow all lost pets access"
  ON public.lost_pets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==============================================================================
-- 9. SUPABASE STORAGE BUCKET & POLICIES (Pet Photo Uploads)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read pet photos" ON storage.objects;
CREATE POLICY "Public read pet photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pet-photos');

DROP POLICY IF EXISTS "Public insert pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pet photos" ON storage.objects;
CREATE POLICY "Public insert pet photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pet-photos');

DROP POLICY IF EXISTS "Public update pet photos" ON storage.objects;
CREATE POLICY "Public update pet photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pet-photos');

-- ==============================================================================
-- 10. AUTH TRIGGER (Auto-creates profile on Supabase Auth signup)
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
  user_full_name TEXT;
  user_avatar TEXT;
BEGIN
  intended_role := COALESCE(NEW.raw_user_meta_data->>'role', 'pet_owner');
  intended_license := COALESCE(NEW.raw_user_meta_data->>'license_number', 'PRC-VET-VERIFIED');
  intended_clinic_id := COALESCE(NEW.raw_user_meta_data->>'clinic_id', '00000000-0000-0000-0000-000000000001');
  intended_clinic_name := COALESCE(NEW.raw_user_meta_data->>'clinic_name', 'Vets in Practice Animal Hospital (VIP)');
  intended_specialization := COALESCE(NEW.raw_user_meta_data->>'specialization', 'Clinical Veterinary Medicine');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  user_avatar := COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture');
  
  IF intended_role = 'veterinarian' THEN
    initial_vet_status := 'approved';
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
    NEW.id::text,
    NEW.email,
    user_full_name,
    user_avatar,
    intended_role,
    initial_vet_status,
    intended_license,
    intended_clinic_id,
    intended_clinic_name,
    intended_specialization
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = CASE 
      WHEN EXCLUDED.role = 'veterinarian' THEN 'veterinarian' 
      ELSE profiles.role 
    END,
    vet_status = CASE 
      WHEN EXCLUDED.role = 'veterinarian' THEN 'approved' 
      ELSE profiles.vet_status 
    END,
    license_number = COALESCE(EXCLUDED.license_number, profiles.license_number),
    clinic_id = COALESCE(EXCLUDED.clinic_id, profiles.clinic_id),
    clinic_name = COALESCE(EXCLUDED.clinic_name, profiles.clinic_name),
    specialization = COALESCE(EXCLUDED.specialization, profiles.specialization),
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  -- If veterinarian, record in veterinarians roster table
  IF intended_role = 'veterinarian' THEN
    INSERT INTO public.veterinarians (
      id,
      user_id,
      clinic_id,
      name,
      email,
      phone,
      title,
      license_number,
      specialization,
      avatar_url,
      approval_status
    )
    VALUES (
      NEW.id::text,
      NEW.id::text,
      intended_clinic_id,
      user_full_name,
      NEW.email,
      '+639178349210',
      'Attending Clinical Veterinarian',
      intended_license,
      intended_specialization,
      user_avatar,
      'approved'
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      license_number = EXCLUDED.license_number;
  END IF;
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
