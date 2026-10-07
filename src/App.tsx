/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
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

import { Shield, Globe, Settings, WifiOff, Stethoscope, LogOut, Lock } from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    currentTab,
    setCurrentTab,
    vetTab,
    setVetTab,
    activeVet,
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

  // Handle URL hash or path simulation for /vet
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/vet')) {
        setCurrentRole('veterinarian');
      }
    }
  }, [setCurrentRole]);

  const handleOpenConsultationModal = (petId?: string, appointmentId?: string) => {
    setConsultationPrefill({ petId, appointmentId });
    setVetConsultationOpen(true);
  };

  const handleOpenRescheduleModal = (apt: Appointment) => {
    setRescheduleAppointment(apt);
  };

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

  // VETERINARIAN PORTAL INTERFACE
  if (currentRole === 'veterinarian') {
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
                  Practitioner: <strong>{activeVet?.name}</strong> ({activeVet?.licenseNumber})
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <button
                  onClick={() => setCurrentRole('pet_owner')}
                  className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-2 flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Exit to Pet Owner Interface</span>
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // PET OWNER INTERFACE
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
                <span>Zero-Trust Medical Encryption</span>
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
              <button onClick={() => setVetLoginModalOpen(true)} className="hover:text-teal-300 text-teal-400 font-medium">
                Doctor Login
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
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
