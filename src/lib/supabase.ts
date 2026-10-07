import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Read Vite client environment variables safely
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
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

// Local demo storage fallback key for session restoration when env keys are being setup
const DEMO_AUTH_STORAGE_KEY = 'safepaw_supabase_auth_session_v4';

export const getStoredDemoSession = (): { user: User; profile: UserProfile; session: Session } | null => {
  try {
    const data = localStorage.getItem(DEMO_AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveStoredDemoSession = (sessionData: { user: any; profile: UserProfile; session: any } | null) => {
  try {
    if (sessionData) {
      localStorage.setItem(DEMO_AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    } else {
      localStorage.removeItem(DEMO_AUTH_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[SafePaw] Error persisting session cache:', err);
  }
};
