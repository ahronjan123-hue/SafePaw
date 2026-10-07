import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Clock,
  Stethoscope,
  CheckCircle,
  LogOut,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

export const ApprovalPendingView: React.FC = () => {
  const { profile, signOut, refreshProfile } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-teal-300 selection:text-stone-950 font-sans">
      {/* Top Bar */}
      <header className="border-b border-stone-800 bg-stone-900/60 backdrop-blur px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500 text-stone-950 flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight">SafePaw Clinical EMR</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-wider text-teal-400 font-mono font-semibold">
                Accreditation Board
              </span>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto px-4 py-10 flex-1 flex flex-col justify-center">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto shadow-inner">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Veterinarian Approval Pending
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Your veterinary credentials have been submitted and are currently awaiting review by the Clinical Board.
            </p>
          </div>

          {/* Submitted Doctor Details Card */}
          <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 space-y-3">
            <div className="text-[11px] uppercase tracking-wider font-bold text-stone-400 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Submitted Clinical Application</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-stone-500 block text-[11px]">Practitioner Name:</span>
                <span className="font-semibold text-stone-200">{profile?.fullName || 'Licensed Veterinarian'}</span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">PRC License Number:</span>
                <span className="font-mono font-bold text-teal-300">
                  {profile?.licenseNumber || 'PRC-VET-PENDING'}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Affiliated Clinic / Hospital:</span>
                <span className="font-medium text-stone-300">
                  {profile?.clinicName || 'Greenwood Animal Hospital'}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block text-[11px]">Specialization:</span>
                <span className="text-stone-300">
                  {profile?.specialization || 'Veterinary Clinical Medicine'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-semibold text-stone-300">Accreditation Process:</div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800 text-xs">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-stone-200">1. Google Identity Verified</div>
                  <div className="text-[11px] text-stone-500">{profile?.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-amber-200">2. Professional Regulation Board Verification</div>
                  <div className="text-[11px] text-amber-400/80">
                    Active cross-reference with National Board Registry (typically 24–48 hours)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-950/60 border border-stone-800/80 text-xs opacity-60">
                <div className="w-6 h-6 rounded-full bg-stone-800 text-stone-400 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-stone-400">3. SafePaw EMR Access Activation</div>
                  <div className="text-[11px] text-stone-600">Prescriptions, patient charts & live consult queue</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 text-stone-950 font-bold text-xs transition shadow-lg cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Checking Supabase Approval Status...' : 'Check Approval Status'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-stone-900 text-center text-stone-500 text-xs">
        <div className="flex items-center justify-center gap-2">
          <span>SafePaw Clinical Health Network · Republic of the Philippines</span>
        </div>
      </footer>
    </div>
  );
};
