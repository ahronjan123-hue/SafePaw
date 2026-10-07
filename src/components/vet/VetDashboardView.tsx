import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Activity,
  PlusCircle,
  Stethoscope,
  ChevronRight,
  Pill,
  Shield,
  Phone,
  FileText,
  Sparkles,
} from 'lucide-react';

interface VetDashboardViewProps {
  onOpenConsultationModal: (petId?: string, appointmentId?: string) => void;
  onOpenRescheduleModal: (apt: Appointment) => void;
}

export const VetDashboardView: React.FC<VetDashboardViewProps> = ({
  onOpenConsultationModal,
  onOpenRescheduleModal,
}) => {
  const {
    activeVet,
    getVetAppointments,
    getAuthorizedPatientsForVet,
    updateAppointmentStatus,
    acceptAppointment,
    declineAppointment,
    setVetTab,
    formatPrice,
    healthRecords,
  } = useApp();

  const [declineModalApt, setDeclineModalApt] = useState<Appointment | null>(null);
  const [declineReason, setDeclineReason] = useState('Doctor is scheduled for urgent surgical intervention.');

  const vetAppointments = getVetAppointments();
  const patients = getAuthorizedPatientsForVet();

  const todayStr = new Date().toISOString().split('T')[0];

  // Appointment categorization
  const todayAppointments = vetAppointments.filter(
    (a) => a.date === todayStr && a.status !== 'cancelled'
  );

  const activeInConsultation = todayAppointments.find(
    (a) => a.status === 'in_consultation' || a.status === 'checked_in'
  );

  const pendingRequests = vetAppointments.filter(
    (a) => a.status === 'scheduled'
  );

  const completedToday = todayAppointments.filter((a) => a.status === 'completed');

  const recentRecords = healthRecords
    .filter((r) => r.createdByVetId === activeVet?.id || r.clinicName === activeVet?.clinicName)
    .slice(0, 4);

  const handleDeclineSubmit = () => {
    if (declineModalApt) {
      declineAppointment(declineModalApt.id, declineReason);
      setDeclineModalApt(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner: Doctor Overview & Clinic Shift */}
      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-stone-900 via-stone-850 to-teal-950 text-white p-6 sm:p-8 lg:p-10 shadow-sm border border-stone-800">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <img
              src={activeVet?.avatar}
              alt={activeVet?.name}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-teal-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{activeVet?.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-medium">
                  {activeVet?.title}
                </span>
              </div>
              <p className="text-stone-300 text-xs sm:text-sm mt-0.5">
                {activeVet?.specialization} · {activeVet?.clinicName}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-stone-400 font-mono">
                <span className="text-teal-300">PRC License: {activeVet?.licenseNumber}</span>
                <span>·</span>
                <span>Room: Consult #2</span>
                <span>·</span>
                <span>Fee: {formatPrice(activeVet?.consultationFeeUSD || 12)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onOpenConsultationModal()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New SOAP Chart</span>
            </button>
            <button
              onClick={() => setVetTab('appointments')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-xs transition"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Full Schedule ({vetAppointments.length})</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
            Today's Consultations
          </span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            {todayAppointments.length}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            {completedToday.length} completed · {todayAppointments.length - completedToday.length} in queue
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
            Pending Visit Requests
          </span>
          <div className="text-2xl font-black text-teal-900 mt-1">
            {pendingRequests.length}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            Requires vet confirmation
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
            Authorized Patients
          </span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            {patients.length}
          </div>
          <div className="text-xs text-stone-600 mt-1">
            Clinic active ledger
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600 block">
            Rx & Health Logs
          </span>
          <div className="text-2xl font-black text-stone-900 mt-1">
            {healthRecords.length}
          </div>
          <div className="text-xs text-emerald-800 font-medium mt-1">
            Signed by verified staff
          </div>
        </div>
      </div>

      {/* Grid: Live Consultation Room & Pending Requests */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left 8 Cols: Active Patient Chamber & Today's Schedule Queue */}
        <div className="xl:col-span-8 space-y-6">
          {/* Active Consultation Chamber Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-800">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Active Patient in Chamber</h3>
                  <p className="text-xs text-stone-600">Current exam room queue and vitals status</p>
                </div>
              </div>

              {activeInConsultation && (
                <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold animate-pulse">
                  {activeInConsultation.status === 'in_consultation' ? '● In Consultation Room' : '● Checked-In (Waiting)'}
                </span>
              )}
            </div>

            {activeInConsultation ? (
              <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-stone-900">{activeInConsultation.petName}</h4>
                    <p className="text-xs text-stone-600">{activeInConsultation.serviceName}</p>
                    <div className="text-xs text-stone-600 mt-1">
                      <strong>Symptoms:</strong> {activeInConsultation.symptoms}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-stone-900">
                      {activeInConsultation.time}
                    </span>
                    <div className="text-[11px] text-teal-800 font-semibold">
                      Fee: {formatPrice(activeInConsultation.baseCostUSD)}
                    </div>
                  </div>
                </div>

                {/* Queue status stepper controls */}
                <div className="pt-2 border-t border-teal-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <button
                    onClick={() => updateAppointmentStatus(activeInConsultation.id, 'checked_in')}
                    className={`py-1.5 px-2 rounded-lg font-semibold transition ${
                      activeInConsultation.status === 'checked_in'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    1. Checked-In
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(activeInConsultation.id, 'in_consultation')}
                    className={`py-1.5 px-2 rounded-lg font-semibold transition ${
                      activeInConsultation.status === 'in_consultation'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    2. In Consultation
                  </button>
                  <button
                    onClick={() => updateAppointmentStatus(activeInConsultation.id, 'prescriptions_ready')}
                    className={`py-1.5 px-2 rounded-lg font-semibold transition ${
                      activeInConsultation.status === 'prescriptions_ready'
                        ? 'bg-teal-700 text-white'
                        : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                    }`}
                  >
                    3. Prescriptions Ready
                  </button>
                  <button
                    onClick={() => onOpenConsultationModal(activeInConsultation.petId, activeInConsultation.id)}
                    className="py-1.5 px-2 rounded-lg font-bold bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
                  >
                    4. Complete & Chart →
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-stone-600 space-y-2">
                <Activity className="w-8 h-8 mx-auto text-stone-400" />
                <p className="text-xs font-semibold">No patient currently in consultation room</p>
                <p className="text-[11px] text-stone-600">Select an appointment from the queue to call in the next pet.</p>
              </div>
            )}
          </div>

          {/* Today's Full Patient Schedule */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-stone-900">Today's Appointment Schedule ({todayAppointments.length})</h3>
              </div>
              <button
                onClick={() => setVetTab('appointments')}
                className="text-xs text-teal-800 font-semibold hover:underline"
              >
                View Full Calendar →
              </button>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="py-6 text-center text-stone-600 text-xs">
                No visits scheduled for today yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-3.5 rounded-xl border border-stone-200 hover:border-teal-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-stone-900">{apt.petName}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-mono capitalize">
                          {apt.status.replace('_', ' ')}
                        </span>
                        {apt.isTelehealth && (
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-semibold">
                            Telehealth
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{apt.serviceName}</p>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Symptoms: <em>{apt.symptoms}</em>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-2 text-xs">
                        <strong className="text-stone-900 font-mono">{apt.time}</strong>
                      </div>

                      {apt.status !== 'completed' && (
                        <>
                          <button
                            onClick={() => onOpenConsultationModal(apt.petId, apt.id)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                          >
                            Chart SOAP
                          </button>
                          <button
                            onClick={() => onOpenRescheduleModal(apt)}
                            className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-medium"
                          >
                            Reschedule
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Pending Requests & Recent EMR Activity */}
        <div className="xl:col-span-4 space-y-6">
          {/* Pending Appointment Requests Box */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-stone-900">Pending Requests ({pendingRequests.length})</h3>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="py-4 text-center text-xs text-stone-600">
                No pending appointment requests.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((apt) => (
                  <div key={apt.id} className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-900">{apt.petName}</strong>
                      <span className="font-mono text-[11px] text-teal-800 font-semibold">{apt.date} · {apt.time}</span>
                    </div>
                    <div className="text-[11px] text-stone-600">{apt.serviceName}</div>
                    <div className="text-[11px] text-stone-600">Note: {apt.symptoms}</div>

                    <div className="flex gap-2 pt-1 border-t border-teal-200/60">
                      <button
                        onClick={() => acceptAppointment(apt.id)}
                        className="flex-1 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold text-[11px]"
                      >
                        Accept Visit
                      </button>
                      <button
                        onClick={() => onOpenRescheduleModal(apt)}
                        className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-[11px]"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setDeclineModalApt(apt)}
                        className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-[11px]"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent EMR Notes Logged by Vet */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <FileText className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-stone-900">Recent Medical Charts</h3>
            </div>

            <div className="space-y-2">
              {recentRecords.map((rec) => (
                <div key={rec.id} className="p-2.5 rounded-xl border border-stone-100 bg-stone-50 text-xs">
                  <div className="flex justify-between items-start">
                    <strong className="text-stone-900">{rec.title}</strong>
                    <span className="text-[10px] text-stone-600 font-mono">{rec.date}</span>
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5 line-clamp-2">{rec.notes}</div>
                  {rec.diagnosis && (
                    <div className="text-[10px] text-teal-800 mt-1 font-semibold">
                      Dx: {rec.diagnosis}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decline Reason Modal */}
      {declineModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/70" onClick={() => setDeclineModalApt(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full z-10 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">Decline Appointment Request</h3>
            <p className="text-xs text-stone-600">
              State a clear clinical reason for declining {declineModalApt.petName}'s booking request.
            </p>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full text-xs p-3 border border-stone-200 rounded-xl focus:outline-teal-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeclineModalApt(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
