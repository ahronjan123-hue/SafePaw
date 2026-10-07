import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppointmentStatus } from '../../types';
import {
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  Video,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export const AppointmentTrackerView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    selectedPet,
    setCurrentTab,
    startOrGetConversationWithClinic,
    formatPrice,
    currentCountry,
  } = useApp();

  const currentPetAppointments = appointments.filter((a) => a.petId === selectedPet?.id && a.status !== 'cancelled');
  const activeAppointment =
    currentPetAppointments.find(
      (a) => a.status === 'in_consultation' || a.status === 'checked_in' || a.status === 'prescriptions_ready'
    ) ||
    currentPetAppointments.find((a) => a.status === 'scheduled') ||
    currentPetAppointments[0] ||
    appointments[0];

  const getStatusStepIndex = (status: AppointmentStatus): number => {
    switch (status) {
      case 'scheduled':
        return 1;
      case 'checked_in':
        return 2;
      case 'in_consultation':
        return 3;
      case 'prescriptions_ready':
        return 4;
      case 'completed':
        return 5;
      default:
        return 1;
    }
  };

  const currentStep = activeAppointment ? getStatusStepIndex(activeAppointment.status) : 1;

  const STEPS = [
    {
      num: 1,
      id: 'scheduled',
      title: 'Appointment Scheduled',
      desc: 'Booking verified by clinic system',
    },
    {
      num: 2,
      id: 'checked_in',
      title: 'Checked-In at Reception',
      desc: 'Patient arrival confirmed; vitals taken',
    },
    {
      num: 3,
      id: 'in_consultation',
      title: 'In Consultation Room',
      desc: 'Veterinarian exam & diagnostics active',
    },
    {
      num: 4,
      id: 'prescriptions_ready',
      title: 'Prescriptions & Aftercare Ready',
      desc: 'Medications filled at clinic pharmacy',
    },
    {
      num: 5,
      id: 'completed',
      title: 'Visit Completed',
      desc: 'Records updated in Pet Health Passport',
    },
  ];

  const handleSimulateStatus = (status: AppointmentStatus) => {
    if (activeAppointment) {
      updateAppointmentStatus(activeAppointment.id, status);
    }
  };

  const handleOpenChat = () => {
    if (activeAppointment) {
      startOrGetConversationWithClinic(activeAppointment.clinicId, activeAppointment.petId);
      setCurrentTab('messages');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Real-Time Appointment Tracker
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Live queue progress, clinical status, and direct communication during visits in {currentCountry.name}.
          </p>
        </div>

        {/* Live Status indicator */}
        {activeAppointment && activeAppointment.status !== 'completed' && activeAppointment.status !== 'cancelled' && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-ping"></span>
            <span>Live Consultation Tracker Active</span>
          </div>
        )}
      </div>

      {!activeAppointment ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <Clock className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="text-sm font-bold text-stone-900">No Appointments to Track</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Book an appointment for {selectedPet?.name} to monitor live queue position, check-in status, and medical updates.
          </p>
          <button
            onClick={() => setCurrentTab('book')}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            Book New Appointment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Stepper & Current Status (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Progress Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
              {/* Top Banner inside card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-100 gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider font-bold text-stone-400">
                    Tracking Appointment for {activeAppointment.petName}
                  </div>
                  <h2 className="text-base font-bold text-stone-900 mt-0.5">
                    {activeAppointment.serviceName}
                  </h2>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {activeAppointment.clinicName} · {activeAppointment.vetName}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-stone-900">
                      {activeAppointment.date} · {activeAppointment.time}
                    </div>
                    <div className="text-[11px] text-teal-700 font-semibold mt-0.5">
                      Queue: #{activeAppointment.queuePosition || 1} (~{activeAppointment.estimatedWaitMins || 0} mins)
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Cost: {formatPrice(activeAppointment.baseCostUSD)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Simulation Bar */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Simulate Live Visit Progression
                  </span>
                  <span className="text-[10px] text-stone-500">Staff update tester</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handleSimulateStatus('checked_in')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                      activeAppointment.status === 'checked_in'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    1. Check-In
                  </button>
                  <button
                    onClick={() => handleSimulateStatus('in_consultation')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                      activeAppointment.status === 'in_consultation'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    2. In Consultation
                  </button>
                  <button
                    onClick={() => handleSimulateStatus('prescriptions_ready')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                      activeAppointment.status === 'prescriptions_ready'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    3. Meds Ready
                  </button>
                  <button
                    onClick={() => handleSimulateStatus('completed')}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition ${
                      activeAppointment.status === 'completed'
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    4. Complete
                  </button>
                </div>
              </div>

              {/* Vertical Stepper Timeline */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
                {STEPS.map((step) => {
                  const isPassed = currentStep > step.num;
                  const isCurrent = currentStep === step.num;
                  return (
                    <div key={step.id} className="relative flex items-start gap-4">
                      {/* Circle node */}
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-teal-600 text-white ring-4 ring-teal-100 shadow-xs'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-stone-100 text-stone-400 border border-stone-200'
                        }`}
                      >
                        {isPassed ? '✓' : step.num}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-xs sm:text-sm font-bold ${
                              isCurrent
                                ? 'text-teal-950 font-black'
                                : isPassed
                                ? 'text-stone-800'
                                : 'text-stone-400'
                            }`}
                          >
                            {step.title}
                          </h4>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase tracking-wide">
                              Current Phase
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-0.5 ${
                            isCurrent ? 'text-stone-700 font-medium' : 'text-stone-500'
                          }`}
                        >
                          {step.desc}
                        </p>

                        {/* Extra details depending on phase */}
                        {isCurrent && step.id === 'in_consultation' && (
                          <div className="mt-3 p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-950 space-y-1">
                            <div className="font-semibold flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse"></span>
                              Exam Room #2 · Dr. Elena Ramos with Nurse Joy
                            </div>
                            <p className="text-[11px] text-teal-900">
                              Clinical assessment of paw limp & administering Rabies booster in progress.
                            </p>
                          </div>
                        )}
                        {isCurrent && step.id === 'prescriptions_ready' && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950">
                            <strong>Pharmacy Counter Ready:</strong> Pick up pain relief anti-inflammatory oral syrup at Counter 1.
                          </div>
                        )}
                        {isPassed && step.id === 'completed' && (
                          <div className="mt-2 text-xs text-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Official records saved to pet digital passport.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Symptoms & Notes Logged */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-2">
              <h3 className="text-xs font-bold uppercase text-stone-400">Chief Symptoms Logged</h3>
              <p className="text-xs text-stone-800 font-medium">{activeAppointment.symptoms}</p>
              {activeAppointment.notes && (
                <div className="pt-2 border-t border-stone-100 text-xs text-stone-500">
                  <strong>Notes:</strong> {activeAppointment.notes}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Clinic Info & Direct Contact */}
          <div className="space-y-6">
            {/* Telehealth Call Shortcut */}
            {activeAppointment.isTelehealth && (
              <div className="bg-teal-950 text-white rounded-2xl p-6 shadow-sm border border-teal-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-teal-400" />
                    <h3 className="text-sm font-bold">Telehealth Video Session</h3>
                  </div>
                  <span className="text-[10px] bg-teal-800 text-teal-200 px-2 py-0.5 rounded font-mono">
                    HD Video Active
                  </span>
                </div>
                <p className="text-xs text-teal-200">
                  Your encrypted consultation room is ready. Have {activeAppointment.petName} nearby with good room lighting.
                </p>
                <button
                  onClick={() => alert(`Starting encrypted video consultation for ${activeAppointment.petName}...`)}
                  className="w-full py-2.5 bg-teal-400 hover:bg-teal-300 text-teal-950 font-bold text-xs rounded-xl transition shadow-xs"
                >
                  Join Video Consultation Room
                </button>
              </div>
            )}

            {/* Clinic Contact & Location Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Clinic Location & Contact
              </div>
              <div>
                <h4 className="text-sm font-bold text-stone-900">{activeAppointment.clinicName}</h4>
                <div className="flex items-start gap-1.5 text-xs text-stone-500 mt-1">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                  <span>{activeAppointment.clinicAddress}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
                <button
                  onClick={handleOpenChat}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-xs font-semibold transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                  <span>Message Vet</span>
                </button>
                <a
                  href={`tel:${currentCountry.emergencyHotline.replace(/\D/g, '')}`}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Desk</span>
                </a>
              </div>
            </div>

            {/* Other Scheduled Visits list */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase text-stone-400">All Scheduled Visits</h3>
              <div className="space-y-2">
                {appointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-3 rounded-xl border text-xs transition ${
                      apt.id === activeAppointment.id
                        ? 'border-teal-500 bg-teal-50/40'
                        : 'border-stone-100 hover:border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-900">{apt.petName}</strong>
                      <span className="text-[10px] text-stone-500">{apt.date}</span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5 truncate">{apt.serviceName}</div>
                    <div className="text-[10px] text-teal-700 mt-1 font-semibold capitalize">
                      Status: {apt.status.replace('_', ' ')} · {formatPrice(apt.baseCostUSD)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
