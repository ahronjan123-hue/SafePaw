import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Heart,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Shield,
  Calendar,
  Activity,
} from 'lucide-react';
import { INITIAL_CLINICS } from '../../data/initialData';

export const AuthPage: React.FC = () => {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    loginAsDemoUser,
    authError,
    setAuthError,
    isConfigured,
  } = useAuth();

  // Default to Pet Owner (User) as the starting point
  const [portalMode, setPortalMode] = useState<'pet_owner' | 'veterinarian'>('pet_owner');
  const [authMethod, setAuthMethod] = useState<'google' | 'email'>('google');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Vet registration specific fields
  const [vetLicense, setVetLicense] = useState('');
  const [selectedClinicId, setSelectedClinicId] = useState(INITIAL_CLINICS[0].id);
  const [vetSpecialization, setVetSpecialization] = useState('Small Animal Medicine');

  // Handle Continue with Google
  const handleGoogleAuth = async (overrideEmail?: string, overrideName?: string, overrideLicense?: string) => {
    setAuthError(null);
    setIsSubmitting(true);

    const clinic = INITIAL_CLINICS.find((c) => c.id === selectedClinicId) || INITIAL_CLINICS[0];

    try {
      if (!isConfigured) {
        // Smooth fallback if Supabase client keys are not set
        if (portalMode === 'veterinarian') {
          loginAsDemoUser('veterinarian');
        } else {
          loginAsDemoUser('pet_owner');
        }
        setIsSubmitting(false);
        return;
      }

      const result = await signInWithGoogle(portalMode, {
        fullName: overrideName || (portalMode === 'veterinarian' ? (fullName || 'Dr. Licensed Practitioner, DVM') : (fullName || 'Pet Parent')),
        licenseNumber: overrideLicense || (portalMode === 'veterinarian' ? vetLicense : undefined),
        clinicId: portalMode === 'veterinarian' ? clinic.id : undefined,
        clinicName: portalMode === 'veterinarian' ? clinic.name : undefined,
        specialization: portalMode === 'veterinarian' ? vetSpecialization : undefined,
      });

      if (!result.success && result.error) {
        setAuthError(result.error);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Email Auth
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setAuthError('Please provide both email and password.');
      return;
    }

    setAuthError(null);
    setIsSubmitting(true);
    const clinic = INITIAL_CLINICS.find((c) => c.id === selectedClinicId) || INITIAL_CLINICS[0];

    try {
      if (!isConfigured) {
        if (portalMode === 'veterinarian') {
          loginAsDemoUser('veterinarian');
        } else {
          loginAsDemoUser('pet_owner');
        }
        setIsSubmitting(false);
        return;
      }

      if (isSigningUp) {
        const res = await signUpWithEmail(email, password, portalMode, {
          fullName: fullName.trim() || (portalMode === 'veterinarian' ? 'Dr. Practicing Veterinarian' : 'Pet Parent'),
          licenseNumber: portalMode === 'veterinarian' ? vetLicense.trim() : undefined,
          clinicId: portalMode === 'veterinarian' ? clinic.id : undefined,
          clinicName: portalMode === 'veterinarian' ? clinic.name : undefined,
          specialization: portalMode === 'veterinarian' ? vetSpecialization.trim() : undefined,
        });
        if (!res.success && res.error) {
          setAuthError(res.error);
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (!res.success && res.error) {
          setAuthError(res.error);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate with email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between font-sans selection:bg-teal-300 selection:text-stone-950">
      {/* Top Navbar */}
      <header className="border-b border-stone-800 bg-stone-900/50 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-white shadow-md shadow-teal-900/40">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 10.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 2.5zm-5-2c1.38 0 2.5-1.12 2.5-2.5S8.38 3.5 7 3.5 4.5 4.62 4.5 6s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 3.5 17 3.5 14.5 4.62 14.5 6s1.12 2.5 2.5 2.5zm-1.8 4.2c-.7-.5-1.6-.7-2.7-.7s-2 .2-2.7.7c-2.4 1.7-4.8 5-2.8 7.3 1.2 1.4 3.4 1.5 5.5 1.5s4.3-.1 5.5-1.5c2-2.3-.4-5.6-2.8-7.3z"/>
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">SafePaw Connect</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-teal-400 uppercase tracking-widest font-mono font-bold bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/80">
                PH National Veterinary Health
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Pitch */}
          <div className="lg:col-span-5 space-y-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Unified Veterinary Care & Pet Records
            </h1>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              Connect with accredited veterinary hospitals in the Philippines. Access digital pet passports, schedule appointments, and coordinate emergency health care.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3 text-xs text-stone-300">
                <div className="w-6 h-6 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-100">Board-Accredited Veterinary Network</div>
                  <div className="text-[11px] text-stone-400">Verified PRC practitioners and 24/7 animal trauma centers.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-stone-300">
                <div className="w-6 h-6 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-100">Digital Health Passport & Vaccines</div>
                  <div className="text-[11px] text-stone-400">Portable medical histories, vaccination schedules, and prescriptions.</div>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs text-stone-300">
                <div className="w-6 h-6 rounded-lg bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-100">Live Booking & Consultation Tracking</div>
                  <div className="text-[11px] text-stone-400">Real-time status updates from check-in to discharge.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Form Card */}
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Role Selection Tabs */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Sign in to your account:
              </label>
              <div className="grid grid-cols-2 p-1 bg-stone-950 rounded-2xl border border-stone-800 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('pet_owner');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    portalMode === 'pet_owner'
                      ? 'bg-teal-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>Pet Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPortalMode('veterinarian');
                    setAuthError(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                    portalMode === 'veterinarian'
                      ? 'bg-teal-500 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Veterinarian</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Authentication Notice</div>
                  <div className="text-[11px] text-rose-300/90">{authError}</div>
                </div>
              </div>
            )}

            {/* If Veterinarian Mode: Credential Details */}
            {portalMode === 'veterinarian' && (
              <div className="bg-stone-950/80 rounded-2xl p-4 border border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-teal-400 tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    PRC License Credentials
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">Republic of the Philippines</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">
                      Professional Regulation Commission (PRC) License Number:
                    </label>
                    <input
                      type="text"
                      value={vetLicense}
                      onChange={(e) => setVetLicense(e.target.value)}
                      placeholder="e.g. PRC-VET-0038912"
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-hidden focus:border-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Clinic / Hospital:</label>
                      <select
                        value={selectedClinicId}
                        onChange={(e) => setSelectedClinicId(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-2.5 py-2 text-stone-100 text-xs focus:outline-hidden focus:border-teal-500"
                      >
                        {INITIAL_CLINICS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-stone-400 mb-1">Specialization:</label>
                      <input
                        type="text"
                        value={vetSpecialization}
                        onChange={(e) => setVetSpecialization(e.target.value)}
                        placeholder="Internal Medicine, Surgery, etc."
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-hidden focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Action: Continue with Google */}
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => handleGoogleAuth()}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-white hover:bg-stone-100 text-stone-900 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-teal-700" />
                    <span>Connecting to Google OAuth...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google 'G' Logo */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-800"></div>
                <button
                  type="button"
                  onClick={() => setAuthMethod(authMethod === 'google' ? 'email' : 'google')}
                  className="text-[11px] text-stone-500 hover:text-stone-300 font-medium transition cursor-pointer"
                >
                  {authMethod === 'google' ? 'Or use Email & Password' : 'Or use Google One-Click'}
                </button>
                <div className="flex-1 h-px bg-stone-800"></div>
              </div>
            </div>

            {/* Collapsible Email & Password Section */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailAuth} className="space-y-3 pt-1 animate-fadeIn">
                {isSigningUp && (
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Full Name:</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={portalMode === 'veterinarian' ? 'Dr. Juan Dela Cruz, DVM' : 'Juan Dela Cruz'}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-hidden focus:border-teal-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Email Address:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={portalMode === 'veterinarian' ? 'doctor@greenwoodvet.ph' : 'petparent@example.ph'}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-stone-400 mb-1">Password:</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-hidden focus:border-teal-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSigningUp ? (
                    'Create Account'
                  ) : (
                    'Sign In with Password'
                  )}
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSigningUp(!isSigningUp)}
                    className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                  >
                    {isSigningUp ? 'Already have an account? Sign in' : 'Need a new account? Register here'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950 px-4 py-6 text-center text-stone-500 text-xs space-y-2">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>© {new Date().getFullYear()} SafePaw Connect Platform · Republic of the Philippines</div>
          <div className="text-stone-500 text-[11px]">
            National Veterinary Healthcare Network
          </div>
        </div>
      </footer>
    </div>
  );
};
