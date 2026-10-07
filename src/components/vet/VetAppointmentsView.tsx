import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  User,
  Phone,
  Video,
  MapPin,
  FileText,
  PlusCircle,
  Shield,
} from 'lucide-react';

interface VetAppointmentsViewProps {
  onOpenConsultationModal: (petId?: string, appointmentId?: string) => void;
  onOpenRescheduleModal: (apt: Appointment) => void;
}

export const VetAppointmentsView: React.FC<VetAppointmentsViewProps> = ({
  onOpenConsultationModal,
  onOpenRescheduleModal,
}) => {
  const {
    getVetAppointments,
    acceptAppointment,
    declineAppointment,
    updateAppointmentStatus,
    completeAppointment,
    formatPrice,
    activeVet,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [declineModalApt, setDeclineModalApt] = useState<Appointment | null>(null);
  const [declineReason, setDeclineReason] = useState('Operating theater emergency on duty.');

  const appointments = getVetAppointments();

  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.petName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.ownerName && a.ownerName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return matchesSearch && a.date === today && a.status !== 'cancelled';
    }
    return matchesSearch && a.status === filterStatus;
  });

  const handleDeclineSubmit = () => {
    if (declineModalApt) {
      declineAppointment(declineModalApt.id, declineReason);
      setDeclineModalApt(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Clinical Appointment & Queue Management
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              {activeVet?.clinicName}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Review incoming consultation requests, manage daily queue progression, and avoid scheduling conflicts.
          </p>
        </div>

        <button
          onClick={() => onOpenConsultationModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs self-start md:self-auto transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Walk-In Patient</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search appointments by pet name, service, or client..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-teal-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `All (${appointments.length})` },
            { id: 'today', label: 'Today’s Queue' },
            { id: 'scheduled', label: 'Confirmed / Scheduled' },
            { id: 'in_consultation', label: 'In Consultation Room' },
            { id: 'completed', label: 'Completed' },
            { id: 'cancelled', label: 'Cancelled / Declined' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                filterStatus === tab.id
                  ? 'bg-stone-900 text-white font-bold'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments Grid / List */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-2">
          <Calendar className="w-10 h-10 mx-auto text-stone-400" />
          <h3 className="text-sm font-bold text-stone-900">No appointments found</h3>
          <p className="text-xs text-stone-400">No visits match the current filter selection.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => {
            const isCompleted = apt.status === 'completed';
            const isCancelled = apt.status === 'cancelled';
            const isInProgress = apt.status === 'in_consultation' || apt.status === 'checked_in';

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition space-y-3 ${
                  isInProgress
                    ? 'border-teal-400 bg-teal-50/20'
                    : isCancelled
                    ? 'border-stone-200 opacity-70 bg-stone-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Top Row: Patient Info, Service, Date/Time & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0 font-bold">
                      {apt.isTelehealth ? <Video className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-stone-900">{apt.petName}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold uppercase">
                          {apt.status.replace('_', ' ')}
                        </span>
                        {apt.isTelehealth && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                            Telehealth
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">{apt.serviceName}</p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-xs shrink-0">
                    <div className="font-bold text-stone-900 font-mono">
                      {apt.date} · {apt.time}
                    </div>
                    <div className="text-[11px] text-teal-800 font-semibold mt-0.5">
                      Fee: {formatPrice(apt.baseCostUSD)} ({apt.paymentStatus.replace('_', ' ')})
                    </div>
                  </div>
                </div>

                {/* Details Grid: Owner Contact, Symptoms, Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Pet Parent</span>
                    <strong className="text-stone-800">{apt.ownerName || 'Verified Client'}</strong>
                    <div className="text-[11px] text-stone-500 font-mono">{apt.ownerPhone || '(02) 8812-9901'}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Reason for Visit</span>
                    <p className="text-stone-800 font-medium">{apt.symptoms}</p>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-semibold">Attending Doctor</span>
                    <strong className="text-stone-800">{apt.vetName}</strong>
                    {apt.rejectionReason && (
                      <div className="text-[10px] text-rose-700 mt-0.5">Declined reason: {apt.rejectionReason}</div>
                    )}
                  </div>
                </div>

                {/* Actions Toolbar */}
                {!isCompleted && !isCancelled && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    {/* Status Stepper Progression */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-stone-400 text-[11px] mr-1">Queue:</span>
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'checked_in')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                          apt.status === 'checked_in'
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
                        }`}
                      >
                        Check-In
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'in_consultation')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                          apt.status === 'in_consultation'
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
                        }`}
                      >
                        In Consult
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'prescriptions_ready')}
                        className={`px-2 py-1 rounded-md text-[11px] font-semibold border transition ${
                          apt.status === 'prescriptions_ready'
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200'
                        }`}
                      >
                        Rx Ready
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenConsultationModal(apt.petId, apt.id)}
                        className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Chart & Complete</span>
                      </button>
                      <button
                        onClick={() => onOpenRescheduleModal(apt)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium transition"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => setDeclineModalApt(apt)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Reason Modal */}
      {declineModalApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-stone-950/70" onClick={() => setDeclineModalApt(null)} />
          <div className="relative bg-white rounded-2xl p-6 max-w-md w-full z-10 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">Decline Appointment</h3>
            <p className="text-xs text-stone-600">
              Provide clinical feedback or instructions for {declineModalApt.petName}'s owner.
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
