-- ==============================================================================
-- SafePaw Veterinary Platform - Complete Supabase Database Schema & Setup
-- Copy and paste this script directly into your Supabase Dashboard > SQL Editor
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums for safe typed fields
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('pet_owner', 'veterinarian', 'clinic_admin');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM (
    'scheduled',
    'checked_in',
    'in_consultation',
    'prescriptions_ready',
    'completed',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE health_record_type AS ENUM (
    'vaccine',
    'medication',
    'lab_result',
    'checkup',
    'surgery'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pet_species AS ENUM (
    'Dog',
    'Cat',
    'Bird',
    'Rabbit',
    'Reptile',
    'Other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ==============================================================================
-- 2. CORE TABLES
-- ==============================================================================

-- PROFILES (Links with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'pet_owner',
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  avatar_url TEXT,
  country_code TEXT DEFAULT 'PH',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLINICS / HOSPITALS
CREATE TABLE IF NOT EXISTS public.clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  clinic_type TEXT NOT NULL DEFAULT 'hospital_247',
  country_code TEXT NOT NULL DEFAULT 'PH',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  province_or_state TEXT NOT NULL,
  phone TEXT NOT NULL,
  hours TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 4.9,
  reviews_count INT DEFAULT 0,
  emergency_available BOOLEAN DEFAULT true,
  image_url TEXT,
  verified BOOLEAN DEFAULT true,
  about TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VETERINARIANS (Accredited Doctor Profiles)
CREATE TABLE IF NOT EXISTS public.veterinarians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'Attending Physician',
  license_number TEXT NOT NULL UNIQUE, -- e.g. PRC-VET-0038912
  specialization TEXT NOT NULL,
  avatar_url TEXT,
  consultation_fee_usd NUMERIC(10,2) DEFAULT 12.00,
  available_days TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  available_time_slots TEXT[] DEFAULT ARRAY['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '11:30 AM', '01:30 PM', '02:15 PM', '03:00 PM', '03:45 PM'],
  bio TEXT,
  approval_status approval_status DEFAULT 'approved',
  approved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PETS (Registered Biological Profiles)
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species pet_species NOT NULL DEFAULT 'Dog',
  breed TEXT NOT NULL,
  age_years NUMERIC(3,1) NOT NULL,
  birth_date DATE,
  weight_kg NUMERIC(5,2) NOT NULL,
  gender TEXT CHECK (gender IN ('Male', 'Female')),
  neutered BOOLEAN DEFAULT false,
  microchip_id TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
  chronic_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  temperament TEXT,
  dietary_notes TEXT,
  primary_clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPOINTMENTS (Visits & Queue Management)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES public.veterinarians(id) ON DELETE SET NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  is_telehealth BOOLEAN DEFAULT false,
  status appointment_status DEFAULT 'scheduled',
  queue_position INT DEFAULT 1,
  estimated_wait_mins INT DEFAULT 15,
  symptoms TEXT,
  notes TEXT,
  base_cost_usd NUMERIC(10,2) NOT NULL DEFAULT 12.00,
  payment_status TEXT CHECK (payment_status IN ('paid', 'deposit_paid', 'pay_at_clinic')) DEFAULT 'pay_at_clinic',
  rejection_reason TEXT,
  clinical_summary TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate appointments for the same vet on the same date and time slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_vet_slot_no_double_booking 
ON public.appointments (vet_id, appointment_date, appointment_time) 
WHERE status != 'cancelled';

-- HEALTH RECORDS & EMR SOAP NOTES
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  record_type health_record_type NOT NULL DEFAULT 'checkup',
  title TEXT NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_due_date DATE,
  veterinarian_name TEXT NOT NULL,
  vet_license_number TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  created_by_vet_id UUID REFERENCES public.veterinarians(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed',
  batch_number TEXT,
  attachment_url TEXT,
  
  -- Clinical Vitals
  vitals JSONB DEFAULT '{}'::JSONB, -- { "weightKg": 28.5, "tempC": 38.6, "heartRateBpm": 110, "respiratoryRateBpm": 24 }
  diagnosis TEXT,
  prescriptions JSONB DEFAULT '[]'::JSONB, -- [{ "medicineName": "Meloxicam", "dosage": "0.1mg/kg", "frequency": "Daily", "durationDays": 5, "instructions": "..." }]
  
  -- Security: Owner visible vs Private Vet Notes
  is_private_vet_note BOOLEAN DEFAULT false,
  private_vet_notes TEXT, -- Hidden from pet owners via Row Level Security (RLS)
  owner_discharge_instructions TEXT, -- Publicly visible to pet owner on passport
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VETERINARIAN CREDENTIAL APPLICATIONS (Board Review Queue)
CREATE TABLE IF NOT EXISTS public.vet_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_provider TEXT NOT NULL, -- 'google' or 'phone'
  identifier TEXT NOT NULL, -- email or phone
  doctor_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  license_number TEXT NOT NULL,
  clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  clinic_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  prc_id_photo_url TEXT,
  status approval_status DEFAULT 'pending',
  review_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- CONVERSATIONS & CHAT
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT,
  last_timestamp TIMESTAMPTZ DEFAULT NOW(),
  unread_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type TEXT CHECK (sender_type IN ('user', 'clinic')) NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message_text TEXT NOT NULL,
  attachment JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOST PET RADAR REPORTS
CREATE TABLE IF NOT EXISTS public.lost_pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_name TEXT NOT NULL,
  species pet_species NOT NULL DEFAULT 'Dog',
  breed TEXT NOT NULL,
  last_seen_location TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Metro Manila',
  country_code TEXT NOT NULL DEFAULT 'PH',
  date_reported DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('lost', 'found', 'reunited')) DEFAULT 'lost',
  contact_phone TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  microchip_number TEXT,
  reward_usd NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_pets ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policies
CREATE POLICY "Allow public read clinics" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Allow public read approved vets" ON public.veterinarians FOR SELECT USING (approval_status = 'approved');
CREATE POLICY "Allow public read lost pets" ON public.lost_pets FOR SELECT USING (true);

-- 2. Profiles Policies
CREATE POLICY "Users can read their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Pets Policies
CREATE POLICY "Owners can manage their pets" ON public.pets FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Vets can view clinic patients" ON public.pets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.veterinarians v
    WHERE v.user_id = auth.uid() AND v.approval_status = 'approved'
  )
);

-- 4. Health Records Policies (Strict Privacy Enforcement)
-- Pet owners see non-private records for their pets
CREATE POLICY "Owners can view public health records" ON public.health_records FOR SELECT USING (
  is_private_vet_note = false AND
  EXISTS (
    SELECT 1 FROM public.pets p
    WHERE p.id = health_records.pet_id AND p.owner_id = auth.uid()
  )
);

-- Veterinarians can view all records (including internal private notes) and insert new SOAP charts
CREATE POLICY "Vets can manage health records" ON public.health_records FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.veterinarians v
    WHERE v.user_id = auth.uid() AND v.approval_status = 'approved'
  )
);

-- 5. Appointments Policies
CREATE POLICY "Owners can view and book their appointments" ON public.appointments FOR ALL USING (
  auth.uid() = owner_id OR
  EXISTS (
    SELECT 1 FROM public.pets p WHERE p.id = appointments.pet_id AND p.owner_id = auth.uid()
  )
);

CREATE POLICY "Vets can view and update clinic appointments" ON public.appointments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.veterinarians v
    WHERE v.user_id = auth.uid() AND v.approval_status = 'approved'
  )
);

-- ==============================================================================
-- 4. INITIAL SEED DATA (PHILIPPINES CLINICS & ACCREDITED DOCTORS)
-- ==============================================================================

-- Seed Clinics
INSERT INTO public.clinics (id, name, clinic_type, country_code, address, city, province_or_state, phone, hours, rating, reviews_count, emergency_available, image_url, verified, about)
VALUES 
  (
    '00000000-0000-0000-0000-000000000001',
    'Greenwood Animal Hospital & Wellness Center',
    'hospital_247',
    'PH',
    'Bonifacio Global City (BGC), 26th Street',
    'Taguig City',
    'Metro Manila',
    '(02) 8834-9210',
    'Open 24/7 (Emergency & Routine)',
    4.9,
    312,
    true,
    'https://images.unsplash.com/photo-1583912267670-6575ad472688?auto=format&fit=crop&w=600&q=80',
    true,
    'Premier veterinary facility in BGC providing advanced surgical suites, digital radiography, cardiology, and 24/7 emergency response.'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'St. Francis 24/7 Pet Emergency & Trauma Center',
    'hospital_247',
    'PH',
    'Katipunan Ave. cor. Aurora Blvd.',
    'Quezon City',
    'Metro Manila',
    '(02) 8999-HELP',
    'Open 24/7 (Level 1 Trauma)',
    4.9,
    428,
    true,
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    true,
    'Level 1 Emergency & Trauma Critical Care Center with on-site blood bank, ICU incubators, and emergency ultrasound.'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Makati Paws Holistic & Veterinary Clinic',
    'clinic',
    'PH',
    'Legaspi Village, Salcedo Street',
    'Makati City',
    'Metro Manila',
    '(02) 8812-PAWS',
    'Mon-Sat: 8:00 AM - 7:00 PM',
    4.8,
    184,
    false,
    'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80',
    true,
    'Feline friendly certified clinic offering integrative veterinary medicine, acupuncture, dermatology, and preventive wellness.'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Verified Veterinarians
INSERT INTO public.veterinarians (id, clinic_id, name, email, phone, title, license_number, specialization, avatar_url, consultation_fee_usd, bio, approval_status)
VALUES 
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Elena Ramos, DVM',
    'elena.ramos@greenwoodvet.ph',
    '+639178349210',
    'Medical Director',
    'PRC-VET-0038912',
    'Canine & Feline Internal Medicine',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    12.00,
    '14+ years of clinical excellence specializing in geriatric patient management, chronic kidney disease, and feline medicine.',
    'approved'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000001',
    'Dr. Marcus Vance, DVM',
    'marcus.vance@greenwoodvet.ph',
    '+639185521902',
    'Senior Surgeon',
    'PRC-VET-0041289',
    'Orthopedic Surgery & Exotic Pets',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    15.00,
    'Board-certified orthopedic veterinary surgeon with deep passion for avian, rabbit, and exotic mammal soft tissue surgery.',
    'approved'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000002',
    'Dr. Sarah Alcantara, DVM',
    'sarah.alcantara@stfrancis247.ph',
    '+639209994357',
    'Emergency Care Specialist',
    'PRC-VET-0059281',
    'Critical Care & Anesthesiology',
    'https://images.unsplash.com/photo-1594824813583-57755f1f9a23?auto=format&fit=crop&w=300&q=80',
    20.00,
    'Dedicated trauma resuscitator managing acute trauma stabilization, emergency blood transfusions, and intensive care monitoring.',
    'approved'
  )
ON CONFLICT (email) DO NOTHING;

-- Seed Lost Pets Radar
INSERT INTO public.lost_pets (pet_name, species, breed, last_seen_location, city, country_code, contact_phone, description, photo_url, microchip_number, reward_usd)
VALUES 
  (
    'Oreo',
    'Dog',
    'Shih Tzu Mix (Black & White)',
    'Near Capitol Commons Park, Meralco Ave',
    'Pasig City',
    'PH',
    '(0917) 555-9012',
    'Wearing a teal reflective collar with gold bell. Shy around loud motorbikes, answers to whistle.',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    '985141003418291',
    80.00
  ),
  (
    'Simba',
    'Cat',
    'Ginger Tabby Domestic Shorthair',
    'Salcedo Village near Park, Makati',
    'Makati City',
    'PH',
    '(0920) 888-1122',
    'Microchipped, neutered male. Has a distinct white tip on his tail and green eyes.',
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80',
    '985141007721839',
    50.00
  );
