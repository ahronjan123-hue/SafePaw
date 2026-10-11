import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  getSupabase,
  isSupabaseConfigured,
  UserProfile,
} from '../lib/supabase';
import { INITIAL_VETS } from '../data/initialData';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  isConfigured: boolean;
  signInWithGoogle: (
    role: 'pet_owner' | 'veterinarian',
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  signInWithEmail: (
    email: string,
    password: string,
    role?: 'pet_owner' | 'veterinarian',
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string,
    role: 'pet_owner' | 'veterinarian',
    extraData?: {
      fullName: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  switchRole: (
    newRole: 'pet_owner' | 'veterinarian',
    vetDetails?: Partial<UserProfile>
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (role: 'pet_owner' | 'veterinarian' | 'pending_vet', vetId?: string) => void;
  approvePendingVet: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileDetails: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  completeOAuthFromCallbackUrl: (urlOrHash: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isConfigured = isSupabaseConfigured();

  // Helper to fetch profile from Supabase
  const fetchProfileFromSupabase = useCallback(async (userId: string, userEmail: string): Promise<UserProfile | null> => {
    const supabase = getSupabase();
    if (!supabase) return null;

    // Check if there was an intended role (e.g. from Google OAuth or Veterinarian portal)
    let intendedRole: 'pet_owner' | 'veterinarian' | null = null;
    let intendedMeta: any = null;
    if (typeof window !== 'undefined') {
      try {
        const storedRole = (localStorage.getItem('safepaw_intended_role') || sessionStorage.getItem('safepaw_intended_role')) as any;
        if (storedRole === 'veterinarian' || storedRole === 'pet_owner') {
          intendedRole = storedRole;
        }
        const storedMeta = localStorage.getItem('safepaw_intended_metadata') || sessionStorage.getItem('safepaw_intended_metadata');
        if (storedMeta) {
          intendedMeta = JSON.parse(storedMeta);
        }
      } catch {}
    }

    try {
      const sessionUser = (await supabase.auth.getUser()).data.user;
      const metadata = sessionUser?.user_metadata || {};
      const realGoogleName = metadata.full_name || metadata.name || intendedMeta?.fullName || (userEmail.includes('@') ? userEmail.split('@')[0] : 'User');
      const realAvatar = metadata.avatar_url || metadata.picture || '';

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('[SafePaw] Profile query warning:', error.message);
      }

      let vetRecord: any = null;
      try {
        const { data: vData } = await supabase
          .from('veterinarians')
          .select('*')
          .eq('user_id', userId)
          .single();
        vetRecord = vData;
      } catch {}

      if (data) {
        // If user logged in as veterinarian or user metadata is veterinarian, prioritize veterinarian role
        const effectiveRole = (intendedRole === 'veterinarian' || metadata.role === 'veterinarian' || data.role === 'veterinarian')
          ? 'veterinarian'
          : (data.role || intendedRole || 'pet_owner');

        const effectiveFullName = data.full_name || realGoogleName;
        const effectiveAvatar = data.avatar_url || realAvatar;
        const effectiveClinicId = intendedMeta?.clinicId || data.clinic_id || vetRecord?.clinic_id || '00000000-0000-0000-0000-000000000001';
        const effectiveClinicName = intendedMeta?.clinicName || data.clinic_name || 'Vets in Practice Animal Hospital (VIP)';
        const effectiveLicense = intendedMeta?.licenseNumber || data.license_number || vetRecord?.license_number || 'PRC-VET-VERIFIED';
        const effectiveSpec = intendedMeta?.specialization || data.specialization || vetRecord?.specialization || 'Clinical Veterinary Medicine';

        // Synchronize profiles table if role was updated or was recorded incorrectly
        if (effectiveRole !== data.role || (effectiveRole === 'veterinarian' && data.vet_status !== 'approved')) {
          await supabase.from('profiles').update({
            role: effectiveRole,
            vet_status: effectiveRole === 'veterinarian' ? 'approved' : null,
            full_name: effectiveFullName,
            license_number: effectiveLicense,
            clinic_id: effectiveClinicId,
            clinic_name: effectiveClinicName,
            specialization: effectiveSpec,
            updated_at: new Date().toISOString(),
          }).eq('id', userId);

          if (effectiveRole === 'veterinarian') {
            try {
              await supabase.auth.updateUser({
                data: {
                  role: 'veterinarian',
                  vet_status: 'approved',
                  license_number: effectiveLicense,
                  clinic_id: effectiveClinicId,
                  clinic_name: effectiveClinicName,
                  specialization: effectiveSpec,
                },
              });
            } catch {}
          }
        }

        if (effectiveRole === 'veterinarian' && !vetRecord) {
          try {
            await supabase.from('veterinarians').upsert({
              id: userId,
              user_id: userId,
              clinic_id: effectiveClinicId,
              name: effectiveFullName,
              email: userEmail,
              phone: data.phone || '+639178349210',
              title: 'Attending Clinical Veterinarian',
              license_number: effectiveLicense,
              specialization: effectiveSpec,
              avatar_url: effectiveAvatar,
              approval_status: 'approved',
              approved_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            });
          } catch {}
        }

        return {
          id: data.id,
          email: data.email || userEmail,
          fullName: effectiveFullName,
          avatarUrl: effectiveAvatar,
          role: effectiveRole,
          vetStatus: effectiveRole === 'veterinarian' ? 'approved' : null,
          licenseNumber: effectiveLicense,
          clinicId: effectiveClinicId,
          clinicName: effectiveClinicName,
          specialization: effectiveSpec,
          bio: data.bio || vetRecord?.bio || '',
          phone: data.phone || vetRecord?.phone || '',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at,
        };
      }

      // If user profile is not yet in public.profiles table, create it from auth metadata
      const finalRole = intendedRole || metadata.role || 'pet_owner';
      const finalFullName = realGoogleName;
      const finalAvatar = realAvatar;
      const clinicId = intendedMeta?.clinicId || '00000000-0000-0000-0000-000000000001';
      const clinicName = intendedMeta?.clinicName || 'Vets in Practice Animal Hospital (VIP)';
      const licenseNum = intendedMeta?.licenseNumber || 'PRC-VET-VERIFIED';
      const spec = intendedMeta?.specialization || 'Clinical Veterinary Medicine';

      // 1. Insert into public.profiles
      await supabase.from('profiles').upsert({
        id: userId,
        email: userEmail,
        full_name: finalFullName,
        avatar_url: finalAvatar,
        role: finalRole === 'veterinarian' ? 'veterinarian' : 'pet_owner',
        updated_at: new Date().toISOString(),
      });

      // 2. If veterinarian, also upsert into public.veterinarians
      if (finalRole === 'veterinarian') {
        await supabase.from('veterinarians').upsert({
          id: userId,
          user_id: userId,
          clinic_id: clinicId,
          name: finalFullName,
          email: userEmail,
          phone: '+639178349210',
          title: 'Attending Clinical Veterinarian',
          license_number: licenseNum,
          specialization: spec,
          avatar_url: finalAvatar,
          approval_status: 'approved',
          approved_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        });
      }

      return {
        id: userId,
        email: userEmail,
        fullName: finalFullName,
        avatarUrl: finalAvatar,
        role: finalRole,
        vetStatus: finalRole === 'veterinarian' ? 'approved' : null,
        licenseNumber: licenseNum,
        clinicId: clinicId,
        clinicName: clinicName,
        specialization: spec,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[SafePaw] Profile fetch error:', err);
      return null;
    }
  }, []);

  // Helper to complete OAuth from a callback URL, hash fragment, or JWT access_token
  const completeOAuthFromCallbackUrl = useCallback(async (rawInput: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = rawInput.trim();
    if (!trimmed) {
      return { success: false, error: 'Please provide a valid redirect URL or access token.' };
    }

    setAuthError(null);
    setIsLoading(true);

    try {
      let hashPart = '';
      let searchPart = '';

      if (trimmed.includes('#')) {
        hashPart = trimmed.substring(trimmed.indexOf('#') + 1);
      } else if (trimmed.startsWith('access_token=')) {
        hashPart = trimmed;
      }

      if (trimmed.includes('?')) {
        const qStart = trimmed.indexOf('?') + 1;
        const qEnd = trimmed.includes('#') ? trimmed.indexOf('#') : trimmed.length;
        if (qEnd > qStart) {
          searchPart = trimmed.substring(qStart, qEnd);
        }
      }

      const hashParams = new URLSearchParams(hashPart);
      const searchParams = new URLSearchParams(searchPart);

      const accessToken = hashParams.get('access_token') || searchParams.get('access_token') || (trimmed.startsWith('eyJ') ? trimmed : null);
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token') || '';
      const code = searchParams.get('code') || hashParams.get('code');

      const supabase = getSupabase();

      if (supabase && code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data?.user) {
          setSession(data.session);
          setUser(data.user);
          const prof = await fetchProfileFromSupabase(data.user.id, data.user.email || '');
          if (prof) setProfile(prof);
          setIsLoading(false);
          return { success: true };
        }
      }

      if (supabase && accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error && data?.user) {
          setSession(data.session);
          setUser(data.user);
          const prof = await fetchProfileFromSupabase(data.user.id, data.user.email || '');
          if (prof) setProfile(prof);
          setIsLoading(false);
          return { success: true };
        }
      }

      // If accessToken is a JWT (even if truncated or missing refresh_token), decode its payload
      if (accessToken && accessToken.includes('.')) {
        const parts = accessToken.split('.');
        if (parts.length >= 2) {
          const base64Url = parts[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
          const payload = JSON.parse(atob(padded));

          const userId = payload.sub || `user-${Date.now()}`;
          const userEmail = payload.email || payload.user_metadata?.email || 'user@safepaw.ph';
          const meta = payload.user_metadata || {};
          const intendedRole = (localStorage.getItem('safepaw_intended_role') as 'pet_owner' | 'veterinarian') || meta.role || 'pet_owner';
          let intendedMeta: any = null;
          try {
            const rawMeta = localStorage.getItem('safepaw_intended_metadata');
            if (rawMeta) intendedMeta = JSON.parse(rawMeta);
          } catch {}

          const fullName = meta.full_name || meta.name || intendedMeta?.fullName || userEmail.split('@')[0];
          const avatarUrl = meta.avatar_url || meta.picture || '';

          const constructedUser = {
            id: userId,
            aud: 'authenticated',
            role: 'authenticated',
            email: userEmail,
            app_metadata: payload.app_metadata || { provider: 'google' },
            user_metadata: meta,
            created_at: new Date().toISOString(),
          } as unknown as User;

          const constructedProfile: UserProfile = {
            id: userId,
            email: userEmail,
            fullName,
            avatarUrl,
            role: intendedRole === 'veterinarian' ? 'veterinarian' : 'pet_owner',
            vetStatus: intendedRole === 'veterinarian' ? 'approved' : null,
            licenseNumber: intendedMeta?.licenseNumber || meta.license_number || (intendedRole === 'veterinarian' ? 'PRC-VET-VERIFIED' : undefined),
            clinicId: intendedMeta?.clinicId || meta.clinic_id || (intendedRole === 'veterinarian' ? '00000000-0000-0000-0000-000000000001' : undefined),
            clinicName: intendedMeta?.clinicName || meta.clinic_name || (intendedRole === 'veterinarian' ? 'Vets in Practice Animal Hospital (VIP)' : undefined),
            specialization: intendedMeta?.specialization || meta.specialization || (intendedRole === 'veterinarian' ? 'Clinical Veterinary Medicine' : undefined),
            createdAt: new Date().toISOString(),
          };

          if (supabase) {
            try {
              await supabase.from('profiles').upsert({
                id: constructedProfile.id,
                email: constructedProfile.email,
                full_name: constructedProfile.fullName,
                avatar_url: constructedProfile.avatarUrl || null,
                role: constructedProfile.role,
                vet_status: constructedProfile.vetStatus,
                license_number: constructedProfile.licenseNumber || null,
                clinic_id: constructedProfile.clinicId || null,
                clinic_name: constructedProfile.clinicName || null,
                specialization: constructedProfile.specialization || null,
                updated_at: new Date().toISOString(),
              });
            } catch {}
          }

          try {
            localStorage.setItem(
              'safepaw_active_user_session_v5',
              JSON.stringify({ user: constructedUser, profile: constructedProfile })
            );
          } catch {}

          setUser(constructedUser);
          setProfile(constructedProfile);
          setIsLoading(false);
          return { success: true };
        }
      }

      setIsLoading(false);
      return {
        success: false,
        error: 'Could not find a valid #access_token or ?code in that URL. Make sure you copied the full URL from the browser address bar.',
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        error: err.message || 'Failed to parse OAuth callback token.',
      };
    }
  }, [fetchProfileFromSupabase]);

  // Initialize and restore Supabase session or saved demo session on page load
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoading(true);

      // Check for OAuth redirect tokens or errors in URL hash/query
      if (typeof window !== 'undefined') {
        try {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const searchParams = new URLSearchParams(window.location.search);
          const errorDesc =
            hashParams.get('error_description') ||
            searchParams.get('error_description') ||
            hashParams.get('error') ||
            searchParams.get('error');

          if (errorDesc) {
            const cleanMessage = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
            console.error('[SafePaw] OAuth Redirect Error:', cleanMessage);
            setAuthError(`Google OAuth Notice: ${cleanMessage}. Please verify Google Provider is enabled in your Supabase project dashboard.`);
            window.history.replaceState(null, '', window.location.pathname);
          } else if (
            hashParams.get('access_token') ||
            searchParams.get('access_token') ||
            searchParams.get('code')
          ) {
            const href = window.location.href;
            window.history.replaceState(null, '', window.location.pathname);
            const res = await completeOAuthFromCallbackUrl(href);
            if (res.success && isMounted) {
              setIsLoading(false);
              return;
            }
          }
        } catch {}
      }

      const supabase = getSupabase();

      if (supabase) {
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.warn('[SafePaw] Session restoration note:', sessionError.message);
          }

          if (sessionData?.session?.user && isMounted) {
            const currentSession = sessionData.session;
            const currentUser = currentSession.user;
            setSession(currentSession);
            setUser(currentUser);

            const userProfile = await fetchProfileFromSupabase(currentUser.id, currentUser.email || '');
            if (isMounted && userProfile) {
              setProfile(userProfile);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error('[SafePaw] Auth initialization error:', err);
        }
      }

      // Check saved local/demo session if no active Supabase session
      if (typeof window !== 'undefined') {
        try {
          const savedSession = localStorage.getItem('safepaw_active_user_session_v5');
          if (savedSession) {
            const parsed = JSON.parse(savedSession);
            if (parsed?.user && parsed?.profile && isMounted) {
              setUser(parsed.user);
              setProfile(parsed.profile);
              setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('[SafePaw] Local session read note:', err);
        }
      }

      if (isMounted) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for postMessage from OAuth popup window
    const handleOAuthPopupMessage = async (event: MessageEvent) => {
      if (!isMounted) return;
      if (event.data?.type === 'SAFEPAW_OAUTH_CALLBACK') {
        const callbackPayload = event.data.href || event.data.hash || event.data.search || '';
        if (callbackPayload) {
          await completeOAuthFromCallbackUrl(callbackPayload);
        }
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleOAuthPopupMessage);
    }

    // Listen to Supabase Auth state changes
    const supabase = getSupabase();
    let authListenerSubscription: { unsubscribe: () => void } | null = null;

    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);
          const userProf = await fetchProfileFromSupabase(newSession.user.id, newSession.user.email || '');
          if (isMounted && userProf) {
            setProfile(userProf);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });
      authListenerSubscription = data.subscription;
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('message', handleOAuthPopupMessage);
      }
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, [fetchProfileFromSupabase, completeOAuthFromCallbackUrl]);

  // Sign In with Google OAuth (Popup-first so current container never navigates to a stale Supabase Site URL)
  const signInWithGoogle = async (
    role: 'pet_owner' | 'veterinarian',
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);

    const supabase = getSupabase();

    if (!supabase) {
      const msg = 'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment variables.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('safepaw_intended_role', role);
          localStorage.setItem('safepaw_role_v5_live', role);
          if (extraData) {
            localStorage.setItem('safepaw_intended_metadata', JSON.stringify(extraData));
          }
        } catch {}
      }

      const callbackUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account',
            role: role,
          },
          data: {
            role: role,
            vet_status: role === 'veterinarian' ? 'approved' : null,
            license_number: extraData?.licenseNumber || (role === 'veterinarian' ? 'PRC-VET-VERIFIED' : null),
            clinic_id: extraData?.clinicId || (role === 'veterinarian' ? '00000000-0000-0000-0000-000000000001' : null),
            clinic_name: extraData?.clinicName || (role === 'veterinarian' ? 'Vets in Practice Animal Hospital (VIP)' : null),
            specialization: extraData?.specialization || (role === 'veterinarian' ? 'Clinical Veterinary Medicine' : null),
            full_name: extraData?.fullName || undefined,
          },
        } as any,
      });

      if (error) {
        setAuthError(error.message);
        return { success: false, error: error.message };
      }

      if (data?.url && typeof window !== 'undefined') {
        const popup = window.open(
          data.url,
          'safepaw_google_oauth',
          'width=540,height=680,menubar=no,toolbar=no,location=yes,status=no'
        );
        if (!popup) {
          // If popup was blocked, navigate directly if not inside an iframe
          if (window.self === window.top) {
            window.location.href = data.url;
          } else {
            const msg = 'Popup blocked by browser. Please allow popups for this site or use the Quick Sign-In option below.';
            setAuthError(msg);
            return { success: false, error: msg };
          }
        }
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Error initializing Google OAuth flow.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign In with Email & Password (Real Supabase Auth Only)
  const signInWithEmail = async (
    email: string,
    pass: string,
    intendedRole?: 'pet_owner' | 'veterinarian',
    extraData?: {
      fullName?: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setIsLoading(false);
      const msg = 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      if (intendedRole && typeof window !== 'undefined') {
        try {
          localStorage.setItem('safepaw_intended_role', intendedRole);
          localStorage.setItem('safepaw_role_v5_live', intendedRole);
          if (extraData) {
            localStorage.setItem('safepaw_intended_metadata', JSON.stringify(extraData));
          }
        } catch {}
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);

        // If veterinarian was selected on sign in, ensure profile in Supabase is updated to veterinarian!
        if (intendedRole === 'veterinarian') {
          try {
            await supabase.auth.updateUser({
              data: {
                role: 'veterinarian',
                vet_status: 'approved',
                license_number: extraData?.licenseNumber || 'PRC-VET-VERIFIED',
                clinic_id: extraData?.clinicId || '00000000-0000-0000-0000-000000000001',
                clinic_name: extraData?.clinicName || 'Vets in Practice Animal Hospital (VIP)',
                specialization: extraData?.specialization || 'Clinical Veterinary Medicine',
              },
            });
            await supabase.from('profiles').update({
              role: 'veterinarian',
              vet_status: 'approved',
              license_number: extraData?.licenseNumber || 'PRC-VET-VERIFIED',
              clinic_id: extraData?.clinicId || '00000000-0000-0000-0000-000000000001',
              clinic_name: extraData?.clinicName || 'Vets in Practice Animal Hospital (VIP)',
              specialization: extraData?.specialization || 'Clinical Veterinary Medicine',
              updated_at: new Date().toISOString(),
            }).eq('id', data.user.id);
          } catch {}
        }

        const prof = await fetchProfileFromSupabase(data.user.id, data.user.email || '');
        if (prof) {
          setProfile(prof);
        }
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Failed to sign in with email.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Sign Up with Email & Password (Real Supabase Auth Only)
  const signUpWithEmail = async (
    email: string,
    pass: string,
    role: 'pet_owner' | 'veterinarian',
    extraData?: {
      fullName: string;
      licenseNumber?: string;
      clinicId?: string;
      clinicName?: string;
      specialization?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    const supabase = getSupabase();
    if (!supabase) {
      setIsLoading(false);
      const msg = 'Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            full_name: extraData?.fullName || email.split('@')[0],
            role,
            vet_status: role === 'veterinarian' ? 'approved' : null,
            license_number: extraData?.licenseNumber || (role === 'veterinarian' ? 'PRC-VET-0049821' : null),
            clinic_id: extraData?.clinicId || (role === 'veterinarian' ? 'clinic-1' : null),
            clinic_name: extraData?.clinicName || (role === 'veterinarian' ? 'Greenwood Animal Hospital & Wellness Center' : null),
            specialization: extraData?.specialization || (role === 'veterinarian' ? 'Clinical Veterinary Medicine' : null),
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);

        const prof: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: extraData?.fullName || email.split('@')[0],
          role,
          vetStatus: role === 'veterinarian' ? 'approved' : null,
          licenseNumber: extraData?.licenseNumber || (role === 'veterinarian' ? 'PRC-VET-0049821' : ''),
          clinicId: extraData?.clinicId || (role === 'veterinarian' ? 'clinic-1' : ''),
          clinicName: extraData?.clinicName || (role === 'veterinarian' ? 'Greenwood Animal Hospital & Wellness Center' : ''),
          specialization: extraData?.specialization || (role === 'veterinarian' ? 'Clinical Veterinary Medicine' : ''),
          createdAt: new Date().toISOString(),
        };

        await supabase.from('profiles').upsert({
          id: prof.id,
          email: prof.email,
          full_name: prof.fullName,
          role: prof.role,
          vet_status: prof.vetStatus,
          license_number: prof.licenseNumber || null,
          clinic_id: prof.clinicId || null,
          clinic_name: prof.clinicName || null,
          specialization: prof.specialization || null,
        });

        setProfile(prof);
      }
      setIsLoading(false);
      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || 'Failed to sign up.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  };

  // Instant 1-Click Login for Testing / Demonstration
  const loginAsDemoUser = (role: 'pet_owner' | 'veterinarian' | 'pending_vet', vetId?: string) => {
    setIsLoading(true);
    setAuthError(null);

    let demoUser: User;
    let demoProfile: UserProfile;

    if (role === 'veterinarian') {
      const matchedVet = INITIAL_VETS.find((v) => v.id === vetId) || INITIAL_VETS[0];
      demoUser = {
        id: matchedVet.id,
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: matchedVet.name, role: 'veterinarian' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: matchedVet.email,
        phone: matchedVet.phone,
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      } as unknown as User;

      demoProfile = {
        id: matchedVet.id,
        email: matchedVet.email,
        fullName: matchedVet.name,
        avatarUrl: matchedVet.avatar,
        role: 'veterinarian',
        vetStatus: 'approved',
        licenseNumber: matchedVet.licenseNumber,
        clinicId: matchedVet.clinicId,
        clinicName: matchedVet.clinicName,
        specialization: matchedVet.specialization,
        bio: matchedVet.bio,
        phone: matchedVet.phone,
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('safepaw_active_vet_v3', JSON.stringify(matchedVet));
        localStorage.setItem('safepaw_role_v3', 'veterinarian');
      } catch {}
    } else if (role === 'pending_vet') {
      const pendingId = 'vet-pending-1';
      demoUser = {
        id: pendingId,
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Dr. Juan Dela Cruz, DVM', role: 'veterinarian' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'dr.juandelacruz@safepaw.ph',
        phone: '+639171234567',
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      } as unknown as User;

      demoProfile = {
        id: pendingId,
        email: 'dr.juandelacruz@safepaw.ph',
        fullName: 'Dr. Juan Dela Cruz, DVM',
        avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
        role: 'veterinarian',
        vetStatus: 'pending',
        licenseNumber: 'PRC-VET-0049821',
        clinicId: 'clinic-1',
        clinicName: 'Greenwood Animal Hospital & Wellness Center',
        specialization: 'Small Animal Surgery',
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('safepaw_role_v3', 'veterinarian');
      } catch {}
    } else {
      // Pet Owner
      const petOwnerId = 'owner-demo-1';
      demoUser = {
        id: petOwnerId,
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: { full_name: 'Maria Santos', role: 'pet_owner' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: 'maria.santos@gmail.ph',
        phone: '+639178889999',
        role: 'authenticated',
        updated_at: new Date().toISOString(),
      } as unknown as User;

      demoProfile = {
        id: petOwnerId,
        email: 'maria.santos@gmail.ph',
        fullName: 'Maria Santos',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        role: 'pet_owner',
        vetStatus: null,
        phone: '+639178889999',
        bio: 'Devoted pet parent to Luna and Milo.',
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('safepaw_role_v3', 'pet_owner');
      } catch {}
    }

    try {
      localStorage.setItem('safepaw_active_user_session_v5', JSON.stringify({ user: demoUser, profile: demoProfile }));
    } catch {}

    // Sync profile to Supabase profiles table if Supabase is configured
    const supabase = getSupabase();
    if (supabase) {
      Promise.resolve(
        supabase.from('profiles').upsert({
          id: demoProfile.id,
          email: demoProfile.email,
          full_name: demoProfile.fullName,
          avatar_url: demoProfile.avatarUrl || null,
          role: demoProfile.role,
          vet_status: demoProfile.vetStatus,
          license_number: demoProfile.licenseNumber || null,
          clinic_id: demoProfile.clinicId || null,
          clinic_name: demoProfile.clinicName || null,
          specialization: demoProfile.specialization || null,
          phone: demoProfile.phone || null,
          bio: demoProfile.bio || null,
          created_at: demoProfile.createdAt,
        })
      )
        .then(({ error }: any) => {
          if (error) console.warn('[SafePaw] Sync demo profile note:', error.message);
        })
        .catch((e: unknown) => console.warn('[SafePaw] Profile upsert error:', e));
    }

    setUser(demoUser);
    setProfile(demoProfile);
    setSession(null);
    setIsLoading(false);
  };

  // Instant Board Approval Simulator for Testing
  const approvePendingVet = () => {
    if (!profile) return;
    const approvedProfile: UserProfile = {
      ...profile,
      role: 'veterinarian',
      vetStatus: 'approved',
      licenseNumber: profile.licenseNumber || 'PRC-VET-0049821',
      clinicId: profile.clinicId || 'clinic-1',
      clinicName: profile.clinicName || 'Greenwood Animal Hospital & Wellness Center',
      specialization: profile.specialization || 'Clinical Veterinary Medicine',
    };

    try {
      localStorage.setItem('safepaw_role_v3', 'veterinarian');
      localStorage.setItem(
        'safepaw_active_user_session_v5',
        JSON.stringify({ user, profile: approvedProfile })
      );
    } catch {}

    setProfile(approvedProfile);
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[SafePaw] Sign out error:', err);
      }
    }

    try {
      localStorage.removeItem('safepaw_active_user_session_v5');
      localStorage.removeItem('safepaw_supabase_auth_session_v4');
      localStorage.removeItem('safepaw_active_vet_v3');
      localStorage.removeItem('safepaw_role_v3');
      sessionStorage.clear();
    } catch {}

    setUser(null);
    setSession(null);
    setProfile(null);
    setAuthError(null);
    setIsLoading(false);
  };

  // Switch Role between Pet Owner and Veterinarian
  const switchRole = async (
    newRole: 'pet_owner' | 'veterinarian',
    vetDetails?: Partial<UserProfile>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'No active profile' };

    const updatedProfile: UserProfile = {
      ...profile,
      role: newRole,
      vetStatus: newRole === 'veterinarian' ? 'approved' : null,
      licenseNumber: vetDetails?.licenseNumber || profile.licenseNumber || (newRole === 'veterinarian' ? 'PRC-VET-0049821' : ''),
      clinicId: vetDetails?.clinicId || profile.clinicId || (newRole === 'veterinarian' ? 'clinic-1' : ''),
      clinicName: vetDetails?.clinicName || profile.clinicName || (newRole === 'veterinarian' ? 'Greenwood Animal Hospital & Wellness Center' : ''),
      specialization: vetDetails?.specialization || profile.specialization || (newRole === 'veterinarian' ? 'Clinical Veterinary Medicine' : ''),
      fullName: vetDetails?.fullName || profile.fullName,
      avatarUrl: vetDetails?.avatarUrl || profile.avatarUrl,
    };

    setProfile(updatedProfile);

    try {
      localStorage.setItem('safepaw_role_v3', newRole);
      localStorage.setItem('safepaw_intended_role', newRole);
      localStorage.setItem('safepaw_role_v5_live', newRole);
      if (user) {
        localStorage.setItem(
          'safepaw_active_user_session_v5',
          JSON.stringify({ user, profile: updatedProfile })
        );
      }
    } catch {}

    const supabase = getSupabase();
    if (supabase && profile.id) {
      try {
        await supabase
          .from('profiles')
          .update({
            role: updatedProfile.role,
            vet_status: updatedProfile.vetStatus,
            license_number: updatedProfile.licenseNumber || null,
            clinic_id: updatedProfile.clinicId || null,
            clinic_name: updatedProfile.clinicName || null,
            specialization: updatedProfile.specialization || null,
            full_name: updatedProfile.fullName,
            avatar_url: updatedProfile.avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);

        await supabase.auth.updateUser({
          data: {
            role: updatedProfile.role,
            vet_status: updatedProfile.vetStatus,
            license_number: updatedProfile.licenseNumber,
          },
        });

        if (newRole === 'veterinarian') {
          try {
            await supabase.from('veterinarians').upsert({
              id: profile.id,
              user_id: profile.id,
              clinic_id: updatedProfile.clinicId || '00000000-0000-0000-0000-000000000001',
              name: updatedProfile.fullName,
              email: profile.email,
              phone: profile.phone || '+639178349210',
              title: 'Attending Clinical Veterinarian',
              license_number: updatedProfile.licenseNumber || 'PRC-VET-VERIFIED',
              specialization: updatedProfile.specialization || 'Clinical Veterinary Medicine',
              avatar_url: updatedProfile.avatarUrl || null,
              approval_status: 'approved',
              approved_at: new Date().toISOString(),
            });
          } catch {}
        }
      } catch (err) {
        console.warn('Supabase role switch note:', err);
      }
    }

    return { success: true };
  };

  // Refresh profile
  const refreshProfile = async () => {
    if (!user) return;
    const supabase = getSupabase();
    if (supabase) {
      const p = await fetchProfileFromSupabase(user.id, user.email || '');
      if (p) setProfile(p);
    }
  };

  // Update profile details
  const updateProfileDetails = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user || !profile) return { success: false, error: 'No authenticated session.' };

    const supabase = getSupabase();
    const safeUpdates = { ...updates };

    if (supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: safeUpdates.fullName ?? profile.fullName,
            avatar_url: safeUpdates.avatarUrl ?? profile.avatarUrl,
            phone: safeUpdates.phone ?? profile.phone,
            bio: safeUpdates.bio ?? profile.bio,
            license_number: safeUpdates.licenseNumber ?? profile.licenseNumber,
            clinic_id: safeUpdates.clinicId ?? profile.clinicId,
            clinic_name: safeUpdates.clinicName ?? profile.clinicName,
            specialization: safeUpdates.specialization ?? profile.specialization,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    const updatedProfile = { ...profile, ...safeUpdates };
    setProfile(updatedProfile);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        authError,
        setAuthError,
        isConfigured,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        switchRole,
        loginAsDemoUser,
        approvePendingVet,
        signOut,
        refreshProfile,
        updateProfileDetails,
        completeOAuthFromCallbackUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
