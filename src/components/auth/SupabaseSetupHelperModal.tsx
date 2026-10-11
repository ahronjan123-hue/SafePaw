import React, { useState } from 'react';
import { X, Copy, Check, Database, Shield, ExternalLink, Key, Sparkles } from 'lucide-react';

interface SupabaseSetupHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPABASE_SQL_SCHEMA = `-- SafePaw Supabase Database Schema, Chat & Storage Setup
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query)
-- Highly optimized: zero unnecessary disk IO, single index scans, safe and non-destructive.

-- 1. Profiles (Supports both Supabase Auth users and demo personas)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'pet_owner',
  vet_status TEXT DEFAULT NULL,
  license_number TEXT,
  clinic_id TEXT,
  clinic_name TEXT,
  specialization TEXT,
  bio TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow profile access" ON public.profiles;
CREATE POLICY "Allow profile access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 2. Pets Table (Digital Health Passport)
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
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS primary_clinic_id TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS owner_name TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS owner_phone TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS owner_email TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS registered_date TEXT DEFAULT to_char(CURRENT_DATE, 'YYYY-MM-DD');
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON public.pets(owner_id);
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow pet access" ON public.pets;
CREATE POLICY "Allow pet access" ON public.pets FOR ALL USING (true) WITH CHECK (true);

-- 3. Conversations (Direct Clinic Messaging)
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
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS clinic_name TEXT DEFAULT 'Veterinary Hospital';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS clinic_avatar TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS pet_name TEXT DEFAULT 'General Care Inquiry';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS owner_id TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_message TEXT DEFAULT 'Direct channel opened.';
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS last_timestamp TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS unread_count INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_conversations_clinic ON public.conversations(clinic_id);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all conversation access" ON public.conversations;
CREATE POLICY "Allow all conversation access" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

-- 4. Chat Messages
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
CREATE POLICY "Allow all chat messages access" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

-- 5. Appointments Table
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
CREATE INDEX IF NOT EXISTS idx_appointments_clinic ON public.appointments(clinic_id);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow appointment access" ON public.appointments;
CREATE POLICY "Allow appointment access" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

-- 6. Health Records Table
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
CREATE POLICY "Allow health record access" ON public.health_records FOR ALL USING (true) WITH CHECK (true);

-- 7. Storage Bucket for Pet Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('pet-photos', 'pet-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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
`;

export const SupabaseSetupHelperModal: React.FC<SupabaseSetupHelperModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600/30 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Supabase Setup & SQL Schema</h3>
              <p className="text-xs text-stone-400">Row Level Security (RLS) & Google OAuth Configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Steps */}
          <div className="space-y-3">
            <h4 className="font-semibold text-teal-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> 3-Step Setup Instructions
            </h4>
            <ol className="space-y-2 text-xs text-stone-300 list-decimal list-inside pl-1">
              <li className="leading-relaxed">
                <strong>Configure Environment Variables</strong> in your deployment settings:
                <div className="my-1.5 p-2 bg-stone-950 font-mono text-[11px] rounded border border-stone-800 text-teal-300 select-all">
                  VITE_SUPABASE_URL=https://your-project-ref.supabase.co<br />
                  VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
                </div>
              </li>
              <li className="leading-relaxed">
                <strong>Enable Google Provider</strong> in your Supabase Dashboard &gt; <em>Authentication</em> &gt; <em>Providers</em> &gt; <em>Google</em>. Add your Google OAuth Client ID and Secret.
              </li>
              <li className="leading-relaxed">
                <strong>Run the SQL Script below</strong> in Supabase Dashboard &gt; <em>SQL Editor</em> to configure the <code className="text-teal-300">profiles</code> table, security triggers, and Row Level Security.
              </li>
            </ol>
          </div>

          {/* SQL Editor Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-400" />
                SQL Migration Script (Safe, Non-Destructive, High Performance)
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-stone-950 font-bold rounded-lg transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy SQL
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 bg-stone-950 text-stone-300 font-mono text-[11px] rounded-xl border border-stone-800 overflow-x-auto max-h-56 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
