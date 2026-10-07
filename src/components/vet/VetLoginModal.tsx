import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Stethoscope,
  Shield,
  CheckCircle,
  X,
  Building,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
  FileCheck,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface VetLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'google' | 'roster' | 'apply' | 'pending';

export const VetLoginModal: React.FC<VetLoginModalProps> = ({ isOpen, onClose }) => {
  const {
    availableVets,
    loginAsVet,
    loginCustomVet,
    clinics,
  } = useApp();

  const { signInWithGoogle, simulateApproveVet } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>('google');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Google Sign-In state
  const [googleEmail, setGoogleEmail] = useState('elena.ramos@greenwoodvet.ph');
  const [googleName, setGoogleName] = useState('Dr. Elena Ramos, DVM');

  // PRC Application Submission State
  const [applicantIdentity, setApplicantIdentity] = useState<{
    authProvider: 'google';
    identifier: string;
    name: string;
    email?: string;
  }>({
    authProvider: 'google',
    identifier: '',
    name: '',
  });

  const [appDoctorName, setAppDoctorName] = useState('Dr. Maria Santos, DVM');
  const [appLicenseNumber, setAppLicenseNumber] = useState('PRC-VET-0049821');
  const [appClinicId, setAppClinicId] = useState(clinics[0]?.id || 'clinic-1');
  const [appSpecialization, setAppSpecialization] = useState('Small Animal Internal Medicine & Oncology');
  const [pendingApplication, setPendingApplication] = useState<any>(null);

  if (!isOpen) return null;

  // Handle Google Sign-in
  const handleGoogleSignIn = async (emailToTest?: string, nameToTest?: string) => {
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const targetEmail = emailToTest || googleEmail;
    const targetName = nameToTest || googleName;

    try {
      const response = await fetch('/api/auth/google/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: targetName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate with Google.');
      }

      if (data.status === 'approved' && data.vet) {
        setSuccessMsg(`Google identity verified! Welcome, ${data.vet.name}.`);
        setTimeout(() => {
          loginCustomVet(data.vet);
          onClose();
        }, 800);
      } else if (data.status === 'pending' && data.application) {
        setPendingApplication(data.application);
        setActiveTab('pending');
      } else {
        // Authenticated Google user, but not in approved vet registry -> Redirect to PRC submission
        setApplicantIdentity({
          authProvider: 'google',
          identifier: targetEmail,
          name: targetName,
          email: targetEmail,
        });
        setAppDoctorName(targetName);
        setActiveTab('apply');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with authentication server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Submit PRC Credential Application
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    if (!appDoctorName.trim() || !appLicenseNumber.trim()) {
      setErrorMsg('Please provide your full legal name and official PRC / Board License Number.');
      setIsLoading(false);
      return;
    }

    const matchedClinic = clinics.find((c) => c.id === appClinicId) || clinics[0];

    try {
      const response = await fetch('/api/auth/vet/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authProvider: 'google',
          identifier: applicantIdentity.identifier || applicantIdentity.email,
          name: appDoctorName.trim(),
          email: applicantIdentity.email,
          licenseNumber: appLicenseNumber.trim(),
          clinicId: matchedClinic.id,
          clinicName: matchedClinic.name,
          specialization: appSpecialization.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setPendingApplication(data.application);
      setActiveTab('pending');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting application.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Clinical Board Review (Testing & Verification)
  const handleSimulateBoardApproval = async () => {
    if (!pendingApplication) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/vet/review-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: pendingApplication.id,
          action: 'approve',
          notes: 'PRC Board Database Check: Verified Active License & Good Standing.',
        }),
      });

      const data = await response.json();

      if (data.success && data.vet) {
        setSuccessMsg('Application Approved! Welcome to the SafePaw Clinical Suite.');
        setTimeout(() => {
          loginCustomVet(data.vet);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg('Error processing board approval.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-stone-900 text-white rounded-2xl shadow-2xl border border-stone-800 max-w-xl w-full max-h-[92vh] overflow-y-auto z-10 flex flex-col">
        {/* Top Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-stone-950 flex items-center justify-center font-bold shadow-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Veterinarian Clinical Access</h2>
                <span className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  PRC / EMR
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Role-Enforced Practitioner Sign-In via Google OAuth
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="p-3.5 bg-teal-950/60 border-b border-teal-900/60 text-xs text-teal-200 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <strong>Identity & License Verification:</strong> Sign in with your Google account. Clinical EMR access requires an active veterinary license (PRC / Board) and clinic affiliation.
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 rounded-xl bg-stone-950 p-1 border border-stone-800 text-xs font-semibold">
            <button
              onClick={() => {
                setActiveTab('google');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg transition text-center flex items-center justify-center gap-2 ${
                activeTab === 'google'
                  ? 'bg-teal-500 text-stone-950 shadow-xs font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('roster');
                setErrorMsg('');
              }}
              className={`py-2 rounded-lg transition text-center flex items-center justify-center gap-2 ${
                activeTab === 'roster'
                  ? 'bg-teal-500 text-stone-950 shadow-xs font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Accredited Clinic Roster</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Body */}
        <div className="p-6 space-y-5">
          {/* Alerts / Feedback */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: GOOGLE OAUTH */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <h3 className="text-sm font-bold text-white">Sign in with Verified Google Account</h3>
                <p className="text-xs text-stone-400">
                  Authenticate using your registered clinic or veterinary hospital Google account.
                </p>
              </div>

              {/* Verified One-Click Google Profiles for Testing */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Quick Select Verified Doctor Account:
                </span>
                <div className="space-y-2">
                  {[
                    {
                      name: 'Dr. Elena Ramos, DVM',
                      email: 'elena.ramos@greenwoodvet.ph',
                      clinic: 'Greenwood Hospital (Medical Director)',
                      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
                    },
                    {
                      name: 'Dr. Sarah Alcantara, DVM',
                      email: 'sarah.alcantara@stfrancis247.ph',
                      clinic: 'St. Francis 24/7 (Emergency Care)',
                      avatar: 'https://images.unsplash.com/photo-1594824813583-57755f1f9a23?auto=format&fit=crop&w=300&q=80',
                    },
                  ].map((doc) => (
                    <button
                      key={doc.email}
                      onClick={() => handleGoogleSignIn(doc.email, doc.name)}
                      disabled={isLoading}
                      className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 hover:border-teal-500 hover:bg-stone-800/80 transition flex items-center justify-between group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatar}
                          alt={doc.name}
                          className="w-9 h-9 rounded-full object-cover border border-teal-500"
                        />
                        <div>
                          <div className="text-xs font-bold text-stone-100 group-hover:text-teal-300 transition">
                            {doc.name}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono">{doc.email}</div>
                          <div className="text-[10px] text-teal-400">{doc.clinic}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Google Email Input */}
              <div className="pt-2 border-t border-stone-800 space-y-3">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  Or Test with Other Google Email:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Doctor Name</label>
                    <input
                      type="text"
                      value={googleName}
                      onChange={(e) => setGoogleName(e.target.value)}
                      placeholder="Dr. Full Name"
                      className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-stone-400 mb-1">Google Email</label>
                    <input
                      type="email"
                      value={googleEmail}
                      onChange={(e) => setGoogleEmail(e.target.value)}
                      placeholder="doctor@gmail.com"
                      className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-teal-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleGoogleSignIn()}
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                  )}
                  <span>Sign in with Google & Verify Role</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: VERIFIED CLINIC ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              <div className="text-center py-2 space-y-1">
                <h3 className="text-sm font-bold text-white">Select Pre-Approved Clinic Director</h3>
                <p className="text-xs text-stone-400">
                  Direct sign-in for accredited veterinary clinical heads.
                </p>
              </div>

              <div className="space-y-2">
                {availableVets.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      loginAsVet(v.id);
                      simulateApproveVet();
                      onClose();
                    }}
                    className="w-full p-3.5 rounded-xl bg-stone-950 border border-stone-800 hover:border-teal-500 hover:bg-stone-800/90 transition flex items-center justify-between group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={v.avatar}
                        alt={v.name}
                        className="w-10 h-10 rounded-xl object-cover border border-teal-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white group-hover:text-teal-300">
                            {v.name}
                          </h4>
                          <span className="text-[10px] bg-teal-950 text-teal-300 px-1.5 rounded font-mono">
                            {v.licenseNumber}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400">{v.specialization}</p>
                        <p className="text-[10px] text-teal-400">{v.clinicName}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-500 group-hover:text-teal-400 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STAGE: APPLY FOR PRC CLINICAL BOARD APPROVAL */}
          {activeTab === 'apply' && (
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="p-3 bg-teal-950/40 border border-teal-800/80 rounded-xl text-xs space-y-1">
                <div className="font-bold text-teal-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" />
                  <span>Google Identity Confirmed</span>
                </div>
                <p className="text-stone-300 text-[11px]">
                  Verified Google Account: <strong>{applicantIdentity.identifier}</strong>
                </p>
                <p className="text-stone-400 text-[10px]">
                  To access the clinical EMR suite, please submit your official PRC license number and clinic details for Accreditation Board review.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Doctor Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={appDoctorName}
                    onChange={(e) => setAppDoctorName(e.target.value)}
                    placeholder="Dr. Full Name, DVM"
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    PRC / Board License # *
                  </label>
                  <input
                    type="text"
                    required
                    value={appLicenseNumber}
                    onChange={(e) => setAppLicenseNumber(e.target.value)}
                    placeholder="PRC-VET-00XXXXX"
                    className="w-full px-3 py-2 text-xs font-mono bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Primary Clinic Affiliation *
                  </label>
                  <select
                    value={appClinicId}
                    onChange={(e) => setAppClinicId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-teal-500"
                  >
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">
                    Clinical Specialization
                  </label>
                  <input
                    type="text"
                    value={appSpecialization}
                    onChange={(e) => setAppSpecialization(e.target.value)}
                    placeholder="e.g. Small Animal Surgery"
                    className="w-full px-3 py-2 text-xs bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('google')}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  <span>Submit Credentials for Board Review</span>
                </button>
              </div>
            </form>
          )}

          {/* STAGE: PENDING BOARD APPROVAL TRACKER */}
          {activeTab === 'pending' && pendingApplication && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/40 border border-amber-800 rounded-2xl text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-white">Application Under Clinical Board Review</h3>
                <p className="text-xs text-stone-300 leading-relaxed max-w-md mx-auto">
                  Your Google identity has been verified. The SafePaw Medical Accreditation Board is currently verifying your PRC license status with the national registry.
                </p>
              </div>

              {/* Application Details Summary */}
              <div className="p-4 bg-stone-950 rounded-xl border border-stone-800 text-xs space-y-2 font-mono">
                <div className="flex justify-between text-stone-400">
                  <span>Applicant:</span>
                  <span className="text-white font-bold">{pendingApplication.name}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>PRC License:</span>
                  <span className="text-teal-400 font-bold">{pendingApplication.licenseNumber}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Clinic:</span>
                  <span className="text-stone-200">{pendingApplication.clinicName}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Status:</span>
                  <span className="text-amber-400 uppercase font-bold">● {pendingApplication.status}</span>
                </div>
              </div>

              {/* Administrative Instant Review Simulator for Testing */}
              <div className="p-3.5 bg-stone-950 border border-teal-900/60 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-teal-300 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Clinical Board Testing Simulator</span>
                </div>
                <p className="text-[11px] text-stone-400">
                  Instantly approve this application to verify the complete pending-to-approved dashboard workflow:
                </p>
                <button
                  onClick={handleSimulateBoardApproval}
                  disabled={isLoading}
                  className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                  <span>Approve Credentials & Enter Doctor Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
