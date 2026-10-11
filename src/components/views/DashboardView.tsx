import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Shield,
  FileText,
  MessageSquare,
  AlertCircle,
  Phone,
  ArrowRight,
  Plus,
  Syringe,
  Activity,
  MapPin,
  CheckCircle,
  Radio,
  Globe,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewPetModal: () => void;
  onOpenAddRecordModal: () => void;
  onOpenReportLostPetModal: () => void;
  onOpenExportPassportModal: () => void;
  onOpenSettings: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewPetModal,
  onOpenAddRecordModal,
  onOpenReportLostPetModal,
  onOpenExportPassportModal,
  onOpenSettings,
}) => {
  const {
    pets,
    selectedPet,
    setSelectedPetId,
    appointments,
    healthRecords,
    clinics,
    setCurrentTab,
    setPreselectedClinicId,
    currentCountry,
    locationSettings,
    formatPrice,
  } = useApp();

  // Find active or upcoming appointments for the selected pet
  const petAppointments = appointments.filter((a) => a.petId === selectedPet?.id);
  const activeAppointment =
    petAppointments.find((a) => a.status === 'in_consultation' || a.status === 'checked_in') ||
    petAppointments.find((a) => a.status === 'scheduled');

  // Health alerts for current pet
  const petRecords = healthRecords.filter((r) => r.petId === selectedPet?.id);
  const dueSoonVaccines = petRecords.filter(
    (r) => r.type === 'vaccine' && (r.status === 'due_soon' || r.status === 'expired')
  );

  // Primary clinic details
  const primaryClinic = clinics.find((c) => c.id === selectedPet?.primaryClinicId) || clinics[0];

  const handleBookWithClinic = (clinicId: string) => {
    setPreselectedClinicId(clinicId);
    setCurrentTab('book');
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Active Pet Header Banner - Expanded & Wider with In-Card Details */}
      {selectedPet ? (
        <section
          aria-label="Pet overview"
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-950 via-stone-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-stone-800"
        >
          <div className="relative z-10 space-y-6">
            {/* Top Row: Avatar, Main Info & Actions */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-5 border-b border-stone-800/80">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
                <div className="relative shrink-0">
                  {selectedPet.photoUrl ? (
                    <img
                      src={selectedPet.photoUrl}
                      alt={selectedPet.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-teal-400/80 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-teal-900/60 border-2 border-teal-400/50 flex items-center justify-center text-teal-300 font-bold text-2xl">
                      {selectedPet.name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 border-2 border-stone-950 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                    ✓ Verified
                  </span>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                      {selectedPet.name}
                    </h1>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-semibold uppercase tracking-wider">
                      {selectedPet.species}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 border border-stone-700">
                      {selectedPet.gender} {selectedPet.neutered ? '· Neutered / Spayed' : '· Intact'}
                    </span>
                  </div>

                  <p className="text-stone-300 text-xs sm:text-sm mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-teal-200">{selectedPet.breed}</span>
                    <span>·</span>
                    <span>{selectedPet.ageYears} {selectedPet.ageYears === 1 ? 'Year' : 'Years'} Old</span>
                    {selectedPet.birthDate && (
                      <>
                        <span>·</span>
                        <span className="text-stone-400">Born {selectedPet.birthDate}</span>
                      </>
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2.5 text-xs text-stone-400">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/80">
                      <Shield className="w-3.5 h-3.5 text-teal-400" />
                      Microchip: {selectedPet.microchipId || 'BAI-Pending'}
                    </span>
                    <span>·</span>
                    <span>
                      Weight: <strong className="text-white font-mono">{selectedPet.weightKg} {locationSettings.weightUnit}</strong>
                    </span>
                    <span>·</span>
                    <button
                      onClick={onOpenSettings}
                      className="flex items-center gap-1 text-teal-300 hover:text-teal-200 transition underline underline-offset-2 cursor-pointer"
                    >
                      <Globe className="w-3 h-3" />
                      <span>{currentCountry.name} ({currentCountry.currencySymbol} {currentCountry.currencyCode})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions in Header */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
                <button
                  onClick={() => setCurrentTab('book')}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs transition shadow-md cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
                <button
                  onClick={onOpenExportPassportModal}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-xs transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-teal-400" />
                  <span>Digital Passport</span>
                </button>
                <button
                  onClick={onOpenAddRecordModal}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-teal-950 hover:bg-teal-900 text-teal-200 border border-teal-800 font-medium text-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Record</span>
                </button>
              </div>
            </div>

            {/* In-Card Expanded Pet Details Grid (Wider View) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Box 1: Allergies & Sensitivities */}
              <div className="bg-stone-900/80 rounded-2xl p-3.5 border border-stone-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Allergies & Alerts
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedPet.allergies && selectedPet.allergies.length > 0 ? (
                      selectedPet.allergies.map((allergy, idx) => (
                        <span key={idx} className="bg-rose-950/70 border border-rose-800/60 text-rose-300 text-[11px] px-2 py-0.5 rounded-md">
                          {allergy}
                        </span>
                      ))
                    ) : (
                      <span className="text-stone-400 text-[11px]">No known drug/food allergies</span>
                    )}
                  </div>
                </div>
                {selectedPet.chronicConditions && selectedPet.chronicConditions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-800/60 text-[11px] text-amber-300">
                    Flag: {selectedPet.chronicConditions.join(', ')}
                  </div>
                )}
              </div>

              {/* Box 2: Dietary Notes */}
              <div className="bg-stone-900/80 rounded-2xl p-3.5 border border-stone-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Diet & Nutrition
                  </span>
                  <p className="mt-2 text-stone-300 text-[11px] leading-relaxed">
                    {selectedPet.dietaryNotes || 'Standard balanced diet with fresh clean water.'}
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-stone-500 font-mono">
                  Feeding Status: Active
                </div>
              </div>

              {/* Box 3: Temperament & Handling */}
              <div className="bg-stone-900/80 rounded-2xl p-3.5 border border-stone-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Clinic Handling / Temperament
                  </span>
                  <p className="mt-2 text-stone-300 text-[11px] leading-relaxed">
                    {selectedPet.temperament || 'Calm, cooperative during clinical physical examinations.'}
                  </p>
                </div>
                <div className="mt-2 text-[10px] text-teal-400/90 font-medium">
                  Fear-Free Certified Profile
                </div>
              </div>

              {/* Box 4: Primary Clinic Affiliation */}
              <div className="bg-stone-900/80 rounded-2xl p-3.5 border border-stone-800/80 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Primary Clinic Desk
                  </span>
                  <div className="mt-2 text-white font-semibold text-xs leading-snug line-clamp-2">
                    {primaryClinic?.name || 'Vets in Practice Animal Hospital'}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    {primaryClinic?.city || 'Metro Manila, PH'}
                  </div>
                </div>
                <button
                  onClick={() => handleBookWithClinic(primaryClinic?.id || clinics[0]?.id)}
                  className="mt-2 text-[11px] text-teal-300 hover:text-teal-200 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Connect with clinic</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Bottom Row: Multi-Pet Switcher Strip inside Card */}
            <div className="pt-4 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
                  Switch Companion:
                </span>
                {pets.map((p) => {
                  const isSelected = p.id === selectedPet.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPetId(p.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition shrink-0 cursor-pointer ${
                        isSelected
                          ? 'border-teal-500 bg-teal-500/20 text-teal-200 font-bold shadow-xs'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-white hover:border-stone-700'
                      }`}
                    >
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="w-4 h-4 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-teal-900 text-[10px] flex items-center justify-center font-bold">
                          {p.name.charAt(0)}
                        </span>
                      )}
                      <span>{p.name}</span>
                      <span className="text-[10px] text-stone-500 font-normal">({p.species})</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={onOpenNewPetModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-teal-600/60 text-teal-300 hover:bg-teal-950/60 text-xs font-semibold transition shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Another Pet</span>
              </button>
            </div>
          </div>

          {/* Subtle background paw pattern */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-10 translate-y-10">
            <svg className="w-80 h-80 fill-white" viewBox="0 0 24 24">
              <path d="M12 10.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 2.5zm-5-2c1.38 0 2.5-1.12 2.5-2.5S8.38 3.5 7 3.5 4.5 4.62 4.5 6s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 3.5 17 3.5 14.5 4.62 14.5 6s1.12 2.5 2.5 2.5zm-1.8 4.2c-.7-.5-1.6-.7-2.7-.7s-2 .2-2.7.7c-2.4 1.7-4.8 5-2.8 7.3 1.2 1.4 3.4 1.5 5.5 1.5s4.3-.1 5.5-1.5c2-2.3-.4-5.6-2.8-7.3z" />
            </svg>
          </div>
        </section>
      ) : (
        /* Empty State for Fresh Production Users (Zero Pets Registered) */
        <section
          aria-label="Pet registration prompt"
          className="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-950 via-stone-900 to-teal-950 text-white p-8 sm:p-10 shadow-xl border border-stone-800"
        >
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome to SafePaw Connect Platform
            </h2>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Register your pet companion to create their official Philippine National Digital Pet Passport, track rabies and core vaccinations, and book verified appointments across accredited hospitals.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenNewPetModal}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-sm transition shadow-lg cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Register Your First Pet</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Grid: Live Appointment Tracker Card & Health Status Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column (8 cols on xl): Active Appointment & Health Passport Cards */}
        <div className="xl:col-span-8 space-y-6">
          {/* Real-time Appointment Tracking Widget */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Real-Time Appointment Tracker
                  </h3>
                  <p className="text-xs text-stone-500">
                    Live consult queue and visit status
                  </p>
                </div>
              </div>
              {activeAppointment && (
                <button
                  onClick={() => setCurrentTab('tracker')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition cursor-pointer"
                >
                  <span>Open Full Tracker</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeAppointment ? (
              <div className="mt-5 space-y-4">
                {/* Status Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-teal-50/50 rounded-xl border border-teal-100 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping"></span>
                      <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                        {activeAppointment.status === 'in_consultation'
                          ? 'In Consultation Room'
                          : activeAppointment.status === 'checked_in'
                            ? 'Checked-in · In Waiting Area'
                            : 'Scheduled Upcoming Visit'}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 mt-1">
                      {activeAppointment.serviceName}
                    </h4>
                    <p className="text-xs text-stone-600">
                      {activeAppointment.clinicName} · {activeAppointment.vetName}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-xs font-semibold text-stone-800">
                      {activeAppointment.date} · {activeAppointment.time}
                    </div>
                    <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                      Queue Position: #{activeAppointment.queuePosition || 1} (~
                      {activeAppointment.estimatedWaitMins || 5} min wait)
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">
                      Fee: {formatPrice(activeAppointment.baseCostUSD)}
                    </div>
                  </div>
                </div>

                {/* Stepper Preview */}
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[11px]">
                  <div className="p-2 rounded-lg bg-teal-100/70 text-teal-900 font-semibold border border-teal-200">
                    1. Scheduled ✓
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      activeAppointment.status !== 'scheduled'
                        ? 'bg-teal-100/70 text-teal-900 font-semibold border-teal-200'
                        : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}
                  >
                    2. Checked In
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      activeAppointment.status === 'in_consultation' ||
                      activeAppointment.status === 'prescriptions_ready' ||
                      activeAppointment.status === 'completed'
                        ? 'bg-teal-600 text-white font-semibold shadow-xs'
                        : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}
                  >
                    3. Consulting
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      activeAppointment.status === 'completed'
                        ? 'bg-teal-100/70 text-teal-900 font-semibold border-teal-200'
                        : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}
                  >
                    4. Complete
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-stone-500">
                    Need to message the clinic receptionist?
                  </span>
                  <button
                    onClick={() => setCurrentTab('messages')}
                    className="text-xs font-semibold text-stone-700 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Reception Note</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-stone-500 space-y-3">
                <Calendar className="w-10 h-10 mx-auto text-stone-400" />
                <div>
                  <p className="text-sm font-semibold text-stone-700">
                    No appointments scheduled today
                  </p>
                  <p className="text-xs text-stone-500">
                    Schedule routine wellness checks, vaccinations, or telehealth visits.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('book')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Book Next Appointment
                </button>
              </div>
            )}
          </div>

          {/* Digital Health Records Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Vaccine & Health Passport Records
                  </h3>
                  <p className="text-xs text-stone-500">
                    Encrypted digital ledger {selectedPet ? `for ${selectedPet.name}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAddRecordModal}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Record</span>
                </button>
                <button
                  onClick={() => setCurrentTab('records')}
                  className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  View All
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {petRecords.length > 0 ? (
                petRecords.slice(0, 3).map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-white hover:border-stone-200 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white border border-stone-200 text-teal-700 shrink-0">
                        {rec.type === 'vaccine' ? (
                          <Syringe className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">
                          {rec.title}
                        </h4>
                        <div className="text-[11px] text-stone-500 mt-0.5">
                          {rec.clinicName} · {rec.date}
                        </div>
                        <div className="text-[11px] text-stone-600 mt-1 line-clamp-1">
                          {rec.notes}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {rec.status === 'due_soon' ? (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Booster Due Soon
                        </span>
                      ) : rec.status === 'expired' ? (
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          Expired
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Verified Valid
                        </span>
                      )}
                      {rec.nextDueDate && (
                        <div className="text-[10px] text-stone-400 mt-1">
                          Due: {rec.nextDueDate}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-stone-500">
                  No health records logged yet. Click &quot;Log Record&quot; to add vaccine certificates, lab results, or clinical notes.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Health Alerts, Primary Clinic & Emergency 24/7 */}
        <div className="xl:col-span-4 space-y-6">
          {/* Vaccine Due Alerts Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">
                Upcoming Visit & Vaccine Reminders
              </h3>
            </div>
            {dueSoonVaccines.length > 0 ? (
              <div className="space-y-2.5">
                {dueSoonVaccines.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs"
                  >
                    <div className="font-semibold text-amber-950 flex items-center justify-between">
                      <span>{v.title}</span>
                      <span className="text-[10px] font-bold uppercase text-amber-700">
                        Action Required
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1">
                      Due date: {v.nextDueDate}. Schedule early to maintain continuous immunization immunity.
                    </p>
                    <button
                      onClick={() => handleBookWithClinic(primaryClinic.id)}
                      className="mt-2 text-[11px] font-semibold text-teal-800 hover:underline block cursor-pointer"
                    >
                      Book Vaccine Booster Visit →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {selectedPet ? `All mandatory vaccines for ${selectedPet.name} are up to date!` : 'All clinical immunization schedules are clear.'}
                </span>
              </div>
            )}
          </div>

          {/* Primary Veterinary Clinic Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <span className="text-[11px] uppercase tracking-wider font-bold text-stone-500">
              Primary Medical Provider ({currentCountry.name})
            </span>
            <div className="mt-3 flex items-start gap-3">
              <img
                src={primaryClinic.image}
                alt={primaryClinic.name}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
              />
              <div>
                <h4 className="text-sm font-bold text-stone-900 leading-tight">
                  {primaryClinic.name}
                </h4>
                <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  <span>
                    {primaryClinic.address}, {locationSettings.customCity || currentCountry.defaultCity}
                  </span>
                </div>
                <div className="text-xs font-semibold text-stone-700 mt-1">
                  Rating: ★ {primaryClinic.rating} ({primaryClinic.reviewsCount} reviews)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={() => handleBookWithClinic(primaryClinic.id)}
                className="py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold text-xs transition text-center cursor-pointer"
              >
                Book with Clinic
              </button>
              <button
                onClick={() => setCurrentTab('messages')}
                className="py-2 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition text-center cursor-pointer"
              >
                Message Clinic
              </button>
            </div>
          </div>

          {/* Emergency 24/7 Red Alert Card */}
          <div className="bg-rose-950 text-white rounded-2xl p-6 shadow-sm border border-rose-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-600">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                  24/7 Critical Emergency
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed">
              If your pet suffers acute trauma, breathing distress, sudden collapse, or toxic ingestion, contact emergency trauma services immediately.
            </p>
            <div className="mt-4 p-3 rounded-xl bg-rose-900/60 border border-rose-800/80 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-rose-300">
                  {currentCountry.emergencyHotlineLabel}
                </div>
                <strong className="text-sm font-mono text-white tracking-wide">
                  {currentCountry.emergencyHotline}
                </strong>
              </div>
              <a
                href={`tel:${currentCountry.emergencyHotline.replace(/\D/g, '')}`}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition"
              >
                Call Hotline
              </a>
            </div>
          </div>

          {/* Lost & Found Community Radar Shortcut */}
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-amber-700 animate-pulse" />
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                Community Lost & Found Radar
              </h4>
            </div>
            <p className="text-xs text-amber-900 leading-normal">
              Is a pet missing or did you spot a stray in {locationSettings.customCity || currentCountry.defaultCity}? Report now to alert local veterinary microchip scanners.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onOpenReportLostPetModal}
                className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Report Missing Pet
              </button>
              <button
                onClick={() => setCurrentTab('shelters')}
                className="py-1.5 px-3 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                View Radar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
