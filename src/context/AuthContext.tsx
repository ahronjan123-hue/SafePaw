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

    // Check if there was an intended role (e.g. from Google OAuth or Veterinarian portal redirect)
    let intendedRole: 'pet_owner' | 'veterinarian' | null = null;
    let intendedMeta: any = null;
    if (typeof window !== 'undefined') {
      try {
        const storedRole = sessionStorage.getItem('safepaw_intended_role') as any;
        if (storedRole === 'veterinarian' || storedRole === 'pet_owner') {
          intendedRole = storedRole;
        }
        const storedMeta = sessionStorage.getItem('safepaw_intended_metadata');
        if (storedMeta) {
          intendedMeta = JSON.parse(storedMeta);
        }
        sessionStorage.removeItem('safepaw_intended_role');
        sessionStorage.removeItem('safepaw_intended_metadata');
      } catch {}
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('[SafePaw] Profile query warning:', error.message);
      }

      if (data) {
        const effectiveRole = intendedRole || data.role || 'pet_owner';
        const effectiveVetStatus = effectiveRole === 'veterinarian' ? 'approved' : (data.vet_status || null);
        const effectiveLicense = intendedMeta?.licenseNumber || data.license_number || (effectiveRole === 'veterinarian' ? 'PRC-VET-0049821' : '');
        const effectiveClinicId = intendedMeta?.clinicId || data.clinic_id || (effectiveRole === 'veterinarian' ? 'clinic-1' : '');
        const effectiveClinicName = intendedMeta?.clinicName || data.clinic_name || (effectiveRole === 'veterinarian' ? 'Greenwood Animal Hospital & Wellness Center' : '');
        const effectiveSpec = intendedMeta?.specialization || data.specialization || (effectiveRole === 'veterinarian' ? 'Clinical Veterinary Medicine' : '');
        const effectiveFullName = intendedMeta?.fullName || data.full_name || 'SafePaw User';

        if (intendedRole && (intendedRole !== data.role || data.vet_status !== 'approved')) {
          // Persist the veterinarian role update to Supabase
          await supabase.from('profiles').update({
            role: effectiveRole,
            vet_status: effectiveVetStatus,
            license_number: effectiveLicense || null,
            clinic_id: effectiveClinicId || null,
            clinic_name: effectiveClinicName || null,
            specialization: effectiveSpec || null,
            full_name: effectiveFullName,
            updated_at: new Date().toISOString(),
          }).eq('id', userId);
        }

        return {
          id: data.id,
          email: data.email || userEmail,
          fullName: effectiveFullName,
          avatarUrl: data.avatar_url || '',
          role: effectiveRole,
          vetStatus: effectiveVetStatus,
          licenseNumber: effectiveLicense,
          clinicId: effectiveClinicId,
          clinicName: effectiveClinicName,
          specialization: effectiveSpec,
          bio: data.bio || '',
          phone: data.phone || '',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at,
        };
      }

      // If user profile is not yet in public.profiles table, create it from auth metadata
      const sessionUser = (await supabase.auth.getUser()).data.user;
      const metadata = sessionUser?.user_metadata || {};
      const finalRole = intendedRole || metadata.role || 'pet_owner';
      const finalVetStatus = finalRole === 'veterinarian' ? 'approved' : null;

      const newProfile: UserProfile = {
        id: userId,
        email: userEmail,
        fullName: intendedMeta?.fullName || metadata.full_name || metadata.name || userEmail.split('@')[0],
        avatarUrl: metadata.avatar_url || metadata.picture || '',
        role: finalRole,
        vetStatus: finalVetStatus,
        licenseNumber: intendedMeta?.licenseNumber || metadata.license_number || (finalRole === 'veterinarian' ? 'PRC-VET-0049821' : ''),
        clinicId: intendedMeta?.clinicId || metadata.clinic_id || (finalRole === 'veterinarian' ? 'clinic-1' : ''),
        clinicName: intendedMeta?.clinicName || metadata.clinic_name || (finalRole === 'veterinarian' ? 'Greenwood Animal Hospital & Wellness Center' : ''),
        specialization: intendedMeta?.specialization || metadata.specialization || (finalRole === 'veterinarian' ? 'Clinical Veterinary Medicine' : ''),
        createdAt: new Date().toISOString(),
      };

      await supabase.from('profiles').upsert({
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.fullName,
        avatar_url: newProfile.avatarUrl,
        role: newProfile.role,
        vet_status: newProfile.vetStatus,
        license_number: newProfile.licenseNumber || null,
        clinic_id: newProfile.clinicId || null,
        clinic_name: newProfile.clinicName || null,
        specialization: newProfile.specialization || null,
      });

      return newProfile;
    } catch (err) {
      console.error('[SafePaw] Profile fetch error:', err);
      return null;
    }
  }, []);

  // Initialize and restore Supabase session or saved demo session on page load
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoading(true);

      // Check for OAuth redirect errors in URL hash/query
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

      // Check for saved demo/test session in localStorage
      try {
        const savedDemo = localStorage.getItem('safepaw_active_user_session_v5');
        if (savedDemo && isMounted) {
          const parsed = JSON.parse(savedDemo);
          if (parsed?.user && parsed?.profile) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            setIsLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn('Error reading saved demo auth:', e);
      }

      if (isMounted) {
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsLoading(false);
      }
    };

    initializeAuth();

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
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, [fetchProfileFromSupabase]);

  // Sign In with Google OAuth (Real Supabase Auth Only)
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
    setIsLoading(true);

    const supabase = getSupabase();

    if (!supabase) {
      setIsLoading(false);
      const msg = 'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment environment variables.';
      setAuthError(msg);
      return { success: false, error: msg };
    }

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('safepaw_intended_role', role);
        if (extraData) {
          sessionStorage.setItem('safepaw_intended_metadata', JSON.stringify(extraData));
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent select_account',
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      const msg = err.message || 'Error initializing Google OAuth flow.';
      setAuthError(msg);
      setIsLoading(false);
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
      if (intendedRole) {
        sessionStorage.setItem('safepaw_intended_role', intendedRole);
        if (extraData) {
          sessionStorage.setItem('safepaw_intended_metadata', JSON.stringify(extraData));
        }
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
