import React, { useState } from 'react';
import { X, Copy, Check, Database, Shield, ExternalLink, Key, Sparkles } from 'lucide-react';

interface SupabaseSetupHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPABASE_SQL_SCHEMA = `-- SafePaw Supabase Database Schema & RLS Setup
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query)
-- Highly optimized: zero unnecessary disk IO, single index scans, strict RLS.

-- 1. Create Profiles Table (Linked to Supabase Auth)
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

-- 2. Performance Indexes (Ensures instant lookups without disk scans)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, vet_status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 5. RLS Policy: Users can insert their own initial profile during registration
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. RLS Policy: Users can update their basic profile (name, avatar, phone, bio)
-- CRITICAL SECURITY: Users cannot arbitrarily change their own role or vet_status!
CREATE POLICY "Users can update own details"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Prevent self-escalation of role or approval status
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      AND vet_status IS NOT DISTINCT FROM (SELECT p.vet_status FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

-- 7. Automatic Profile Creation Trigger on Supabase Auth Signup
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

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
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
