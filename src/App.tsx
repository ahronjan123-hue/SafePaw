/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './components/auth/AuthPage';
import { AuthLoadingScreen } from './components/auth/AuthLoadingScreen';
import { ApprovalPendingView } from './components/auth/ApprovalPendingView';

import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { NotificationDrawer } from './components/NotificationDrawer';
import { SettingsModal } from './components/SettingsModal';
import { DashboardView } from './components/views/DashboardView';
import { ClinicsDirectoryView } from './components/views/ClinicsDirectoryView';
import { BookingView } from './components/views/BookingView';
import { AppointmentTrackerView } from './components/views/AppointmentTrackerView';
import { HealthRecordsView } from './components/views/HealthRecordsView';
import { MessagingView } from './components/views/MessagingView';
import { SheltersLostPetsView } from './components/views/SheltersLostPetsView';
import { PetsManagementView } from './components/views/PetsManagementView';
import { NewPetModal } from './components/modals/NewPetModal';
import { AddHealthRecordModal } from './components/modals/AddHealthRecordModal';
import { ReportLostPetModal } from './components/modals/ReportLostPetModal';
import { ExportPassportModal } from './components/modals/ExportPassportModal';

// Veterinarian Clinical Suite Components
import { VetHeader } from './components/vet/VetHeader';
import { VetLoginModal } from './components/vet/VetLoginModal';
import { VetDashboardView } from './components/vet/VetDashboardView';
import { VetAppointmentsView } from './components/vet/VetAppointmentsView';
import { VetPatientsView } from './components/vet/VetPatientsView';
import { VetProfileAvailabilityView } from './components/vet/VetProfileAvailabilityView';
import { VetConsultationModal } from './components/vet/VetConsultationModal';
import { VetRescheduleModal } from './components/vet/VetRescheduleModal';
import { Appointment } from './types';

import { Shield, Globe, Settings, WifiOff, Stethoscope, LogOut, Lock, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { user, profile, isLoading, signOut } = useAuth();

  const {
    currentRole,
    setCurrentRole,
    currentTab,
    setCurrentTab,
    vetTab,
    setVetTab,
    activeVet,
    availableVets,
    loginAsVet,
    loginCustomVet,
    currentCountry,
    locationSettings,
    isOnline,
  } = useApp();

  // Modals state for Pet Owner
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newPetModalOpen, setNewPetModalOpen] = useState(false);
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [reportLostPetOpen, setReportLostPetOpen] = useState(false);
  const [exportPassportOpen, setExportPassportOpen] = useState(false);
  const [vetLoginModalOpen, setVetLoginModalOpen] = useState(false);

  // Modals state for Veterinarian
  const [vetConsultationOpen, setVetConsultationOpen] = useState(false);
  const [consultationPrefill, setConsultationPrefill] = useState<{ petId?: string; appointmentId?: string }>({});
  const [rescheduleAppointment, setRescheduleAppointment] = useState<Appointment | null>(null);

  // Sync role and active doctor based on authenticated user's profile
  useEffect(() => {
    if (!profile) return;

    if (profile.role === 'veterinarian') {
      const matched = availableVets.find(
        (v) =>
          v.licenseNumber === profile.licenseNumber ||
          v.email?.toLowerCase() === profile.email?.toLowerCase() ||
          v.id === profile.id
      );
      if (matched) {
        if (!activeVet || activeVet.id !== matched.id || currentRole !== 'veterinarian') {
          loginAsVet(matched.id);
        }
      } else if (!activeVet || activeVet.id !== profile.id || currentRole !== 'veterinarian') {
        loginCustomVet({
          id: profile.id,
          name: profile.fullName || 'Dr. Attending Practitioner, DVM',
          email: profile.email,
          phone: profile.phone || '+639178349210',
          title: 'Attending Clinical Veterinarian',
          licenseNumber: profile.licenseNumber || 'PRC-VET-VERIFIED',
          clinicId: profile.clinicId || 'clinic-1',
          clinicName: profile.clinicName || 'Greenwood Animal Hospital & Wellness Center',
          specialization: profile.specialization || 'Clinical Veterinary Medicine',
          avatar: profile.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
          consultationFeeUSD: 14,
          availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          availableTimeSlots: ['08:30 AM', '09:15 AM', '10:00 AM', '11:00 AM', '01:30 PM', '02:30 PM'],
          bio: profile.bio || 'Accredited veterinary clinician.',
          approvalStatus: 'approved',
          approvedAt: new Date().toISOString(),
          createdAt: profile.createdAt || new Date().toISOString(),
        });
      }
      if (currentRole !== 'veterinarian') {
        setCurrentRole('veterinarian');
      }
    }
  }, [profile?.id, profile?.role, profile?.vetStatus]);

  const handleOpenConsultationModal = (petId?: string, appointmentId?: string) => {
    setConsultationPrefill({ petId, appointmentId });
    setVetConsultationOpen(true);
  };

  const handleOpenRescheduleModal = (apt: Appointment) => {
    setRescheduleAppointment(apt);
  };

  // 1. Loading state on page load / session restoration
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // 2. Unauthenticated user: Show SafePaw Authentication Entry
  if (!user || !profile) {
    return <AuthPage />;
  }

  // 3. Veterinarian with Pending Approval: Show Approval Pending View
  if (profile.role === 'veterinarian' && profile.vetStatus === 'pending') {
    return <ApprovalPendingView />;
  }

  // 4. Veterinarian with Rejected Status: Show status notification
  if (profile.role === 'veterinarian' && profile.vetStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Application Not Approved</h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            Your clinical credentials could not be verified by the Board at this time. Please check your submitted PRC license details or contact clinical support.
          </p>
          <button
            onClick={() => signOut()}
            className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Sign Out to Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render Pet Owner Views
  const renderPetOwnerTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenNewPetModal={() => setNewPetModalOpen(true)}
            onOpenAddRecordModal={() => setAddRecordModalOpen(true)}
            onOpenReportLostPetModal={() => setReportLostPetOpen(true)}
            onOpenExportPassportModal={() => setExportPassportOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        );
      case 'clinics':
        return <ClinicsDirectoryView />;
      case 'book':
        return <BookingView />;
      case 'tracker':
        return <AppointmentTrackerView />;
      case 'records':
        return (
          <HealthRecordsView
            onOpenAddRecordModal={() => setAddRecordModalOpen(true)}
            onOpenExportPassportModal={() => setExportPassportOpen(true)}
          />
        );
      case 'messages':
        return <MessagingView />;
      case 'shelters':
        return (
          <SheltersLostPetsView
            onOpenReportLostPetModal={() => setReportLostPetOpen(true)}
          />
        );
      case 'pets':
        return (
          <PetsManagementView
            onOpenNewPetModal={() => setNewPetModalOpen(true)}
            onOpenExportPassportModal={() => setExportPassportOpen(true)}
          />
        );
      default:
        return (
          <DashboardView
            onOpenNewPetModal={() => setNewPetModalOpen(true)}
            onOpenAddRecordModal={() => setAddRecordModalOpen(true)}
            onOpenReportLostPetModal={() => setReportLostPetOpen(true)}
            onOpenExportPassportModal={() => setExportPassportOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        );
    }
  };

  // Render Veterinarian Clinical Views
  const renderVeterinarianTab = () => {
    switch (vetTab) {
      case 'dashboard':
        return (
          <VetDashboardView
            onOpenConsultationModal={handleOpenConsultationModal}
            onOpenRescheduleModal={handleOpenRescheduleModal}
          />
        );
      case 'appointments':
        return (
          <VetAppointmentsView
            onOpenConsultationModal={handleOpenConsultationModal}
            onOpenRescheduleModal={handleOpenRescheduleModal}
          />
        );
      case 'patients':
        return (
          <VetPatientsView
            onOpenConsultationModal={handleOpenConsultationModal}
          />
        );
      case 'availability':
      case 'profile':
        return <VetProfileAvailabilityView />;
      default:
        return (
          <VetDashboardView
            onOpenConsultationModal={handleOpenConsultationModal}
            onOpenRescheduleModal={handleOpenRescheduleModal}
          />
        );
    }
  };

  // 5. APPROVED VETERINARIAN PORTAL INTERFACE
  if ((profile.role === 'veterinarian' && profile.vetStatus === 'approved') || currentRole === 'veterinarian') {
    return (
      <div className="min-h-screen bg-stone-100/80 text-stone-900 flex flex-col font-sans selection:bg-teal-200 selection:text-teal-950">
        {/* Dedicated Veterinarian Clinical Header */}
        <VetHeader
          onOpenConsultationModal={() => handleOpenConsultationModal()}
          onOpenNotifications={() => setNotificationsOpen(true)}
        />

        {/* Offline Sync Banner */}
        <OfflineBanner />

        {/* Main Clinical Content View */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          {renderVeterinarianTab()}
        </main>

        {/* Modals for Veterinarian Suite */}
        <VetConsultationModal
          isOpen={vetConsultationOpen}
          onClose={() => {
            setVetConsultationOpen(false);
            setConsultationPrefill({});
          }}
          prefillPetId={consultationPrefill.petId}
          prefillAppointmentId={consultationPrefill.appointmentId}
        />

        <VetRescheduleModal
          isOpen={!!rescheduleAppointment}
          onClose={() => setRescheduleAppointment(null)}
          appointment={rescheduleAppointment}
        />

        <NotificationDrawer
          isOpen={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
        />

        {/* Clinical Footer */}
        <footer className="bg-stone-950 text-stone-400 text-xs border-t border-stone-800 mt-12">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-teal-500 text-stone-950 flex items-center justify-center font-black text-xs">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <span className="text-white font-bold text-xs">
                  SafePaw Clinical Suite (EMR v2.4)
                </span>
                <span className="text-stone-600">|</span>
                <span className="text-stone-400">
                  Practitioner: <strong>{profile.fullName || activeVet?.name}</strong> ({profile.licenseNumber || activeVet?.licenseNumber})
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <button
                  onClick={() => signOut()}
                  className="text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // 6. PET OWNER INTERFACE
  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Sticky Header with Navigation, Pet Switcher, Settings & Vet Portal link */}
      <Header
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenNewPetModal={() => setNewPetModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenVetPortal={() => setVetLoginModalOpen(true)}
      />

      {/* Offline Storage Status & Sync Banner */}
      <OfflineBanner />

      {/* Main App Content View */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {renderPetOwnerTab()}
      </main>

      {/* Modals & Overlays */}
      <VetLoginModal
        isOpen={vetLoginModalOpen}
        onClose={() => setVetLoginModalOpen(false)}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <NewPetModal
        isOpen={newPetModalOpen}
        onClose={() => setNewPetModalOpen(false)}
      />

      <AddHealthRecordModal
        isOpen={addRecordModalOpen}
        onClose={() => setAddRecordModalOpen(false)}
      />

      <ReportLostPetModal
        isOpen={reportLostPetOpen}
        onClose={() => setReportLostPetOpen(false)}
      />

      <ExportPassportModal
        isOpen={exportPassportOpen}
        onClose={() => setExportPassportOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs border-t border-stone-800 mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <div className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center font-bold text-white text-xs">
                  SP
                </div>
                <span className="font-bold text-base tracking-tight">SafePaw Connect</span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed">
                Connecting pet owners, veterinary hospitals, grooming specialists, and animal rescue shelters on a unified secure health infrastructure in {currentCountry.name}.
              </p>
              <div className="flex items-center gap-1.5 text-teal-400 text-[11px] font-medium">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Veterinary Health Network</span>
              </div>
            </div>

            <div>
              <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px] mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => setCurrentTab('dashboard')} className="hover:text-white transition">
                    Dashboard Overview
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('clinics')} className="hover:text-white transition">
                    Veterinary Directory
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('book')} className="hover:text-white transition">
                    Book Appointment
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('tracker')} className="hover:text-white transition">
                    Live Queue Tracker
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px] mb-3">
                Professional & Regional
              </h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setVetLoginModalOpen(true)}
                    className="hover:text-teal-300 text-teal-400 font-semibold transition flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Veterinarian Portal (EMR)</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setSettingsOpen(true)}
                    className="hover:text-white transition flex items-center gap-1 text-stone-300"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Region: {currentCountry.name} ({currentCountry.currencySymbol} {currentCountry.currencyCode})</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => setSettingsOpen(true)} className="hover:text-white transition">
                    Override Location & Units
                  </button>
                </li>
                <li>
                  <button onClick={() => setCurrentTab('records')} className="hover:text-white transition">
                    Digital Health Passport
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-stone-200 font-bold uppercase tracking-wider text-[11px] mb-3">
                Emergency 24/7 Hotline
              </h4>
              <p className="text-stone-400 text-xs mb-1">
                {currentCountry.emergencyHotlineLabel}:
              </p>
              <div className="font-mono text-sm font-bold text-white mb-2">
                {currentCountry.emergencyHotline}
              </div>
              <div className="text-[11px] text-stone-400 flex items-center gap-1">
                {!isOnline ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <WifiOff className="w-3 h-3" /> Offline persistence enabled
                  </span>
                ) : (
                  <span>Offline cache automatically active in browser</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-stone-400 text-[11px] gap-2">
            <div>© {new Date().getFullYear()} SafePaw Connect Platform. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <button onClick={() => signOut()} className="hover:text-rose-300 text-rose-400 font-medium flex items-center gap-1">
                <LogOut className="w-3 h-3" />
                <span>Sign Out ({user.email})</span>
              </button>
              <span>·</span>
              <button onClick={() => setSettingsOpen(true)} className="hover:text-stone-200">
                Country & Currency Settings
              </button>
              <span>·</span>
              <button onClick={() => setSettingsOpen(true)} className="hover:text-stone-200">
                Offline Mode Controls
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}
