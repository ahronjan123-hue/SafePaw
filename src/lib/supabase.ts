import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Read Vite client environment variables safely with runtime fallback
const getClientEnv = (key: string): string => {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(`safepaw_config_${key}`);
    if (local && local.trim()) return local.trim();
    const winVal = (window as any)?.__ENV__?.[key];
    if (winVal && typeof winVal === 'string') return winVal.trim();
  }
  return ((import.meta.env[key] as string) || '').trim();
};

const supabaseUrl = getClientEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getClientEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project-ref')
  );
};

// Initialize Supabase Client singleton
let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseInstance && isSupabaseConfigured()) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
      });
    } catch (err) {
      console.error('[SafePaw] Failed to initialize Supabase client:', err);
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
};

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'pet_owner' | 'veterinarian' | 'admin';
  vetStatus: 'pending' | 'approved' | 'rejected' | null;
  licenseNumber?: string;
  clinicId?: string;
  clinicName?: string;
  specialization?: string;
  bio?: string;
  phone?: string;
  createdAt: string;
  updatedAt?: string;
}
