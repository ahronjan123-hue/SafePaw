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
      {/* Welcome & Active Pet Header Banner */}
      <section aria-label="Pet overview" className="relative overflow-hidden rounded-2xl bg-linear-to-r from-stone-900 via-stone-800 to-teal-950 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative">
              <img
                src={selectedPet?.photoUrl}
                alt={selectedPet?.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-400/80 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-stone-900 flex items-center justify-center text-[10px]">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{selectedPet?.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-medium">
                  {selectedPet?.species}
                </span>
              </div>
              <p className="text-stone-300 text-xs sm:text-sm mt-0.5">
                {selectedPet?.breed} · {selectedPet?.ageYears} Years Old · {selectedPet?.gender} ({selectedPet?.neutered ? 'Neutered' : 'Intact'})
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-400">
                <span className="flex items-center gap-1 font-mono text-[11px] text-teal-300">
                  <Shield className="w-3.5 h-3.5" />
                  Microchip: {selectedPet?.microchipId}
                </span>
                <span>·</span>
                <span>
                  Weight: <strong className="text-white">{selectedPet?.weightKg} {locationSettings.weightUnit}</strong>
                </span>
                <span>·</span>
                <button
                  onClick={onOpenSettings}
                  className="flex items-center gap-1 text-teal-300 hover:text-teal-200 transition underline underline-offset-2"
                >
                  <Globe className="w-3 h-3" />
                  <span>{currentCountry.name} ({currentCountry.currencySymbol} {currentCountry.currencyCode})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setCurrentTab('book')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-semibold text-xs transition shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={onOpenExportPassportModal}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-xs transition"
            >
              <FileText className="w-4 h-4 text-teal-400" />
              <span>Digital Passport</span>
            </button>
          </div>
        </div>

        {/* Subtle background paw pattern */}
        <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-10 translate-y-10">
          <svg className="w-72 h-72 fill-white" viewBox="0 0 24 24">
            <path d="M12 10.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-5-2c1.38 0 2.5-1.12 2.5-2.5S8.38 3.5 7 3.5 4.5 4.62 4.5 6s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 3.5 17 3.5 14.5 4.62 14.5 6s1.12 2.5 2.5 2.5zm-1.8 4.2c-.7-.5-1.6-.7-2.7-.7s-2 .2-2.7.7c-2.4 1.7-4.8 5-2.8 7.3 1.2 1.4 3.4 1.5 5.5 1.5s4.3-.1 5.5-1.5c2-2.3-.4-5.6-2.8-7.3z"/>
          </svg>
        </div>
      </section>

      {/* Multi-Pet Quick Selector Strip */}
      <section aria-label="Pets list" className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
        <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider pl-1 shrink-0">
          Switch Pet:
        </span>
        {pets.map((p) => {
          const isSelected = p.id === selectedPet?.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPetId(p.id)}
              className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs transition shrink-0 ${
                isSelected
                  ? 'border-teal-600 bg-teal-50/70 text-teal-900 font-semibold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
              }`}
            >
              <img
                src={p.photoUrl}
                alt={p.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span>{p.name}</span>
              <span className="text-[10px] text-stone-500 font-normal">({p.species})</span>
            </button>
          );
        })}
        <button
          onClick={onOpenNewPetModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-stone-300 text-stone-600 hover:text-teal-700 hover:border-teal-400 bg-stone-50/50 text-xs font-medium transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Pet</span>
        </button>
      </section>

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
                  <h3 className="text-sm font-bold text-stone-900">Real-Time Appointment Tracker</h3>
                  <p className="text-xs text-stone-500">Live consult queue and visit status</p>
                </div>
              </div>
              {activeAppointment && (
                <button
                  onClick={() => setCurrentTab('tracker')}
                  className="flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 transition"
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
                      Queue Position: #{activeAppointment.queuePosition || 1} (~{activeAppointment.estimatedWaitMins || 5} min wait)
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
                  <div className={`p-2 rounded-lg border ${
                    activeAppointment.status !== 'scheduled'
                      ? 'bg-teal-100/70 text-teal-900 font-semibold border-teal-200'
                      : 'bg-stone-50 text-stone-400 border-stone-200'
                  }`}>
                    2. Checked In
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    activeAppointment.status === 'in_consultation' || activeAppointment.status === 'prescriptions_ready' || activeAppointment.status === 'completed'
                      ? 'bg-teal-600 text-white font-semibold shadow-xs'
                      : 'bg-stone-50 text-stone-400 border-stone-200'
                  }`}>
                    3. Consulting
                  </div>
                  <div className={`p-2 rounded-lg border ${
                    activeAppointment.status === 'completed'
                      ? 'bg-teal-100/70 text-teal-900 font-semibold border-teal-200'
                      : 'bg-stone-50 text-stone-400 border-stone-200'
                  }`}>
                    4. Complete
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-stone-500">
                    Need to message the clinic receptionist?
                  </span>
                  <button
                    onClick={() => setCurrentTab('messages')}
                    className="text-xs font-semibold text-stone-700 hover:text-teal-700 flex items-center gap-1"
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
                  <p className="text-sm font-semibold text-stone-700">No appointments scheduled today</p>
                  <p className="text-xs text-stone-500">Schedule routine wellness checks, vaccinations, or telehealth visits.</p>
                </div>
                <button
                  onClick={() => setCurrentTab('book')}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition"
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
                  <h3 className="text-sm font-bold text-stone-900">Vaccine & Health Passport Records</h3>
                  <p className="text-xs text-stone-500">Encrypted digital ledger for {selectedPet?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAddRecordModal}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Record</span>
                </button>
                <button
                  onClick={() => setCurrentTab('records')}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  View All
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {petRecords.slice(0, 3).map((rec) => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-stone-100 bg-stone-50/50 hover:bg-white hover:border-stone-200 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white border border-stone-200 text-teal-700 shrink-0">
                      {rec.type === 'vaccine' ? <Syringe className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">{rec.title}</h4>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {rec.clinicName} · {rec.date}
                      </div>
                      <div className="text-[11px] text-stone-600 mt-1 line-clamp-1">{rec.notes}</div>
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
                      <div className="text-[10px] text-stone-400 mt-1">Due: {rec.nextDueDate}</div>
                    )}
                  </div>
                </div>
              ))}
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
              <h3 className="text-sm font-bold text-stone-900">Upcoming Visit & Vaccine Reminders</h3>
            </div>
            {dueSoonVaccines.length > 0 ? (
              <div className="space-y-2.5">
                {dueSoonVaccines.map((v) => (
                  <div key={v.id} className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
                    <div className="font-semibold text-amber-950 flex items-center justify-between">
                      <span>{v.title}</span>
                      <span className="text-[10px] font-bold uppercase text-amber-700">Action Required</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-1">
                      Due date: {v.nextDueDate}. Schedule early to maintain continuous immunization immunity.
                    </p>
                    <button
                      onClick={() => handleBookWithClinic(primaryClinic.id)}
                      className="mt-2 text-[11px] font-semibold text-teal-800 hover:underline block"
                    >
                      Book Vaccine Booster Visit →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All mandatory vaccines for {selectedPet?.name} are up to date!</span>
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
                  <span>{primaryClinic.address}, {locationSettings.customCity || currentCountry.defaultCity}</span>
                </div>
                <div className="text-xs font-semibold text-stone-700 mt-1">
                  Rating: ★ {primaryClinic.rating} ({primaryClinic.reviewsCount} reviews)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100">
              <button
                onClick={() => handleBookWithClinic(primaryClinic.id)}
                className="py-2 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 font-semibold text-xs transition text-center"
              >
                Book with Clinic
              </button>
              <button
                onClick={() => setCurrentTab('messages')}
                className="py-2 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs transition text-center"
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
                <div className="text-[11px] text-rose-300">{currentCountry.emergencyHotlineLabel}</div>
                <strong className="text-sm font-mono text-white tracking-wide">{currentCountry.emergencyHotline}</strong>
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
                className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Report Missing Pet
              </button>
              <button
                onClick={() => setCurrentTab('shelters')}
                className="py-1.5 px-3 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-medium transition"
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
