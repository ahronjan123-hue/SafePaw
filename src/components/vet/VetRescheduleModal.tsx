import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import { X, Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface VetRescheduleModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  '08:30 AM',
  '09:15 AM',
  '10:00 AM',
  '10:45 AM',
  '11:30 AM',
  '01:30 PM',
  '02:15 PM',
  '03:00 PM',
  '03:45 PM',
  '04:30 PM',
  '05:15 PM',
];

export const VetRescheduleModal: React.FC<VetRescheduleModalProps> = ({
  appointment,
  isOpen,
  onClose,
}) => {
  const { rescheduleAppointment } = useApp();

  const [newDate, setNewDate] = useState(
    appointment?.date || new Date().toISOString().split('T')[0]
  );
  const [newTime, setNewTime] = useState(appointment?.time || '10:00 AM');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const res = rescheduleAppointment(appointment.id, newDate, newTime);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Failed to reschedule appointment.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-md w-full p-6 z-10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-stone-900">Reschedule Consultation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 space-y-1">
          <div>
            Patient: <strong className="text-stone-900">{appointment.petName}</strong> ({appointment.serviceName})
          </div>
          <div className="text-stone-500">
            Currently: {appointment.date} at {appointment.time}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">New Date</label>
            <input
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Available Time Slot
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setNewTime(slot)}
                  className={`py-1.5 px-1 text-xs rounded-lg border text-center transition font-medium ${
                    newTime === slot
                      ? 'bg-teal-600 text-white border-teal-600 font-bold'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition"
            >
              {success ? 'Saved & Synced!' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
