import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  getSupabase,
  isSupabaseConfigured,
  UserProfile,
  getStoredDemoSession,
  saveStoredDemoSession,
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
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileDetails: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  simulateApproveVet: (vetId?: string) => Promise<void>;
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

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('[SafePaw] Error loading profile from Supabase:', error.message);
      }

      if (data) {
        return {
          id: data.id,
          email: data.email || userEmail,
          fullName: data.full_name || 'SafePaw User',
          avatarUrl: data.avatar_url || '',
          role: data.role || 'pet_owner',
          vetStatus: data.vet_status || (data.role === 'veterinarian' ? 'pending' : null),
          licenseNumber: data.license_number || '',
          clinicId: data.clinic_id || '',
          clinicName: data.clinic_name || '',
          specialization: data.specialization || '',
          bio: data.bio || '',
          phone: data.phone || '',
          createdAt: data.created_at || new Date().toISOString(),
          updatedAt: data.updated_at,
        };
      }

      // Check if email matches a pre-approved doctor roster
      const matchedDoctor = INITIAL_VETS.find((v) => v.email.toLowerCase() === userEmail.toLowerCase());
      const isDoctor = !!matchedDoctor;

      // Create initial profile if missing
      const newProfile: UserProfile = {
        id: userId,
        email: userEmail,
        fullName: matchedDoctor ? matchedDoctor.name : userEmail.split('@')[0],
        avatarUrl: matchedDoctor ? matchedDoctor.avatar : '',
        role: isDoctor ? 'veterinarian' : 'pet_owner',
        vetStatus: isDoctor ? 'approved' : null,
        licenseNumber: matchedDoctor?.licenseNumber || '',
        clinicId: matchedDoctor?.clinicId || '',
        clinicName: matchedDoctor?.clinicName || '',
        specialization: matchedDoctor?.specialization || '',
        bio: matchedDoctor?.bio || '',
        phone: matchedDoctor?.phone || '',
        createdAt: new Date().toISOString(),
      };

      await supabase.from('profiles').upsert({
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.fullName,
        avatar_url: newProfile.avatarUrl,
        role: newProfile.role,
        vet_status: newProfile.vetStatus,
        license_number: newProfile.licenseNumber,
        clinic_id: newProfile.clinicId,
        clinic_name: newProfile.clinicName,
        specialization: newProfile.specialization,
        bio: newProfile.bio,
        phone: newProfile.phone,
      });

      return newProfile;
    } catch (err) {
      console.error('[SafePaw] Profile fetch error:', err);
      return null;
    }
  }, []);

  // Initialize and restore session on page load
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      setIsLoading(true);
      const supabase = getSupabase();

      if (supabase) {
        try {
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            console.warn('[SafePaw] Supabase session fetch warning:', sessionError.message);
          }

          if (sessionData?.session?.user && isMounted) {
            const currentSession = sessionData.session;
            const currentUser = currentSession.user;
            setSession(currentSession);
            setUser(currentUser);

            const userProfile = await fetchProfileFromSupabase(currentUser.id, currentUser.email || '');
            if (isMounted && userProfile) {
              setProfile(userProfile);
            }
          } else {
            // Check if there was any pending OAuth callback
            const hash = window.location.hash;
            if (!hash.includes('access_token')) {
              // No Supabase session
              setUser(null);
              setSession(null);
              setProfile(null);
            }
          }
        } catch (err) {
          console.error('[SafePaw] Auth initialization error:', err);
        }
      } else {
        // Fallback: Check local authenticated session cache
        const stored = getStoredDemoSession();
        if (stored && isMounted) {
          setUser(stored.user);
          setSession(stored.session);
          setProfile(stored.profile);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      }

      if (isMounted) {
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
          saveStoredDemoSession(null);
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

  // Sign In with Google OAuth
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

    if (supabase) {
      try {
        // Save intended role and metadata in sessionStorage so callback creates correct role
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
              prompt: 'consent',
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
        const msg = err.message || 'Error redirecting to Google OAuth.';
        setAuthError(msg);
        setIsLoading(false);
        return { success: false, error: msg };
      }
    } else {
      // Local preview / Instant Verification Handler
      try {
        const demoEmail = extraData?.fullName
          ? `${extraData.fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`
          : role === 'veterinarian'
          ? 'elena.ramos@greenwoodvet.ph'
          : 'petparent@gmail.com';

        const matchedDoc = INITIAL_VETS.find((v) => v.email.toLowerCase() === demoEmail.toLowerCase());
        const isVet = role === 'veterinarian';

        // Check if pre-approved or pending
        const isApproved = isVet && (matchedDoc || extraData?.licenseNumber?.startsWith('PRC-VET-0038912') || extraData?.licenseNumber?.startsWith('PRC-VET-0041289'));

        const mockUser: any = {
          id: `usr-${Date.now()}`,
          email: demoEmail,
          user_metadata: {
            full_name: extraData?.fullName || (isVet ? (matchedDoc?.name || 'Dr. Registered Practitioner, DVM') : 'Verified Pet Parent'),
            avatar_url: isVet ? (matchedDoc?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80') : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          },
          app_metadata: { provider: 'google' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        };

        const mockProfile: UserProfile = {
          id: mockUser.id,
          email: demoEmail,
          fullName: mockUser.user_metadata.full_name,
          avatarUrl: mockUser.user_metadata.avatar_url,
          role: isVet ? 'veterinarian' : 'pet_owner',
          vetStatus: isVet ? (isApproved ? 'approved' : 'pending') : null,
          licenseNumber: extraData?.licenseNumber || (isVet ? (matchedDoc?.licenseNumber || 'PRC-VET-0098412') : undefined),
          clinicId: extraData?.clinicId || (isVet ? (matchedDoc?.clinicId || 'clinic-1') : undefined),
          clinicName: extraData?.clinicName || (isVet ? (matchedDoc?.clinicName || 'Greenwood Animal Hospital') : undefined),
          specialization: extraData?.specialization || (isVet ? (matchedDoc?.specialization || 'General Clinical Medicine') : undefined),
          bio: matchedDoc?.bio || 'Dedicated animal care practitioner.',
          phone: matchedDoc?.phone || '+63 917 834 9210',
          createdAt: new Date().toISOString(),
        };

        const mockSession: any = {
          access_token: `token-${Date.now()}`,
          token_type: 'bearer',
          expires_in: 3600,
          user: mockUser,
        };

        setUser(mockUser);
        setSession(mockSession);
        setProfile(mockProfile);
        saveStoredDemoSession({ user: mockUser, profile: mockProfile, session: mockSession });
        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        setAuthError(err.message || 'Authentication error.');
        return { success: false, error: err.message };
      }
    }
  };

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setAuthError(null);
    setIsLoading(true);

    const supabase = getSupabase();
    if (supabase) {
      try {
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
          setProfile(prof);
        }
        setIsLoading(false);
        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        const msg = err.message || 'Failed to sign in with email.';
        setAuthError(msg);
        return { success: false, error: msg };
      }
    } else {
      // Local fallback
      const isElena = email.toLowerCase().includes('elena') || email.toLowerCase().includes('ramos');
      const mockUser: any = {
        id: `usr-email-${Date.now()}`,
        email: email.trim(),
        user_metadata: {
          full_name: isElena ? 'Dr. Elena Ramos, DVM' : email.split('@')[0],
        },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      const mockProfile: UserProfile = {
        id: mockUser.id,
        email: email.trim(),
        fullName: isElena ? 'Dr. Elena Ramos, DVM' : email.split('@')[0],
        role: isElena ? 'veterinarian' : 'pet_owner',
        vetStatus: isElena ? 'approved' : null,
        licenseNumber: isElena ? 'PRC-VET-0038912' : undefined,
        clinicId: isElena ? 'clinic-1' : undefined,
        clinicName: isElena ? 'Greenwood Animal Hospital' : undefined,
        specialization: isElena ? 'Canine & Feline Internal Medicine' : undefined,
        createdAt: new Date().toISOString(),
      };

      const mockSession: any = {
        access_token: `token-email-${Date.now()}`,
        user: mockUser,
      };

      setUser(mockUser);
      setSession(mockSession);
      setProfile(mockProfile);
      saveStoredDemoSession({ user: mockUser, profile: mockProfile, session: mockSession });
      setIsLoading(false);
      return { success: true };
    }
  };

  // Sign Up with Email & Password
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
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: {
              full_name: extraData?.fullName || email.split('@')[0],
              role,
              vet_status: role === 'veterinarian' ? 'pending' : null,
              license_number: extraData?.licenseNumber || null,
              clinic_id: extraData?.clinicId || null,
              clinic_name: extraData?.clinicName || null,
              specialization: extraData?.specialization || null,
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

          // Save profile record
          const prof: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: extraData?.fullName || email.split('@')[0],
            role,
            vetStatus: role === 'veterinarian' ? 'pending' : null,
            licenseNumber: extraData?.licenseNumber,
            clinicId: extraData?.clinicId,
            clinicName: extraData?.clinicName,
            specialization: extraData?.specialization,
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
    } else {
      // Local fallback
      const mockUser: any = {
        id: `usr-new-${Date.now()}`,
        email: email.trim(),
        user_metadata: { full_name: extraData?.fullName || email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };

      const mockProfile: UserProfile = {
        id: mockUser.id,
        email: email.trim(),
        fullName: extraData?.fullName || email.split('@')[0],
        role,
        vetStatus: role === 'veterinarian' ? 'pending' : null,
        licenseNumber: extraData?.licenseNumber,
        clinicId: extraData?.clinicId,
        clinicName: extraData?.clinicName,
        specialization: extraData?.specialization,
        createdAt: new Date().toISOString(),
      };

      const mockSession: any = {
        access_token: `token-signup-${Date.now()}`,
        user: mockUser,
      };

      setUser(mockUser);
      setSession(mockSession);
      setProfile(mockProfile);
      saveStoredDemoSession({ user: mockUser, profile: mockProfile, session: mockSession });
      setIsLoading(false);
      return { success: true };
    }
  };

  // Sign Out
  const signOut = async () => {
    setIsLoading(true);
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[SafePaw] Sign out warning:', err);
      }
    }

    saveStoredDemoSession(null);
    setUser(null);
    setSession(null);
    setProfile(null);
    setAuthError(null);
    setIsLoading(false);
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
    // Enforce safety: do not allow frontend user to change role or vetStatus arbitrarily
    const safeUpdates = { ...updates };
    delete safeUpdates.role;
    delete safeUpdates.vetStatus;

    if (supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: safeUpdates.fullName,
            avatar_url: safeUpdates.avatarUrl,
            phone: safeUpdates.phone,
            bio: safeUpdates.bio,
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
    if (!supabase) {
      saveStoredDemoSession({ user, profile: updatedProfile, session });
    }
    return { success: true };
  };

  // Developer / Admin simulation for testing vet approval
  const simulateApproveVet = async () => {
    if (!profile || profile.role !== 'veterinarian') return;
    const updated: UserProfile = {
      ...profile,
      vetStatus: 'approved',
    };
    setProfile(updated);

    const supabase = getSupabase();
    if (supabase && user) {
      try {
        await supabase
          .from('profiles')
          .update({ vet_status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', user.id);
      } catch (e) {
        console.warn('[SafePaw] Supabase vet approval sync note:', e);
      }
    } else {
      saveStoredDemoSession({ user, profile: updated, session });
    }
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
        signOut,
        refreshProfile,
        updateProfileDetails,
        simulateApproveVet,
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
