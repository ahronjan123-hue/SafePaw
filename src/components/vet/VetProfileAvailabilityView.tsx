import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  Clock,
  Building,
  Shield,
  Phone,
  Mail,
  Save,
  Check,
  DollarSign,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const STANDARD_SLOTS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
];

export const VetProfileAvailabilityView: React.FC = () => {
  const { activeVet, updateVetProfile, formatPrice, currentCountry } = useApp();

  const [name, setName] = useState(activeVet?.name || '');
  const [title, setTitle] = useState(activeVet?.title || 'Attending Physician');
  const [specialization, setSpecialization] = useState(activeVet?.specialization || '');
  const [licenseNumber, setLicenseNumber] = useState(activeVet?.licenseNumber || '');
  const [phone, setPhone] = useState(activeVet?.phone || '');
  const [bio, setBio] = useState(activeVet?.bio || '');
  const [feeUSD, setFeeUSD] = useState(activeVet?.consultationFeeUSD?.toString() || '12');

  const [availableDays, setAvailableDays] = useState<string[]>(
    activeVet?.availableDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>(
    activeVet?.availableTimeSlots || [
      '08:30 AM',
      '09:15 AM',
      '10:00 AM',
      '10:45 AM',
      '11:30 AM',
      '01:30 PM',
      '02:15 PM',
      '03:00 PM',
      '03:45 PM',
    ]
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDay = (day: string) => {
    setAvailableDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleSlot = (slot: string) => {
    setAvailableSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateVetProfile({
      name: name.trim(),
      title: title.trim(),
      specialization: specialization.trim(),
      licenseNumber: licenseNumber.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      consultationFeeUSD: parseFloat(feeUSD) || 12,
      availableDays,
      availableTimeSlots: availableSlots,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
          Veterinarian Profile & Availability Schedule
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage clinical accreditation credentials, consult fees in {currentCountry.currencyCode} ({currentCountry.currencySymbol}), and weekly working shifts.
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Doctor Credentials */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-stone-900">Doctor Professional Details</h2>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={activeVet?.avatar}
              alt={activeVet?.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-xs"
            />
            <div>
              <span className="text-xs font-bold text-stone-900 block">{activeVet?.name}</span>
              <span className="text-[11px] text-teal-700 block font-semibold">{activeVet?.specialization}</span>
              <span className="text-[10px] text-stone-400 font-mono block mt-0.5">
                License: {activeVet?.licenseNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Full Doctor Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Title / Position</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                PRC / Board License ID *
              </label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600 font-mono text-teal-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Clinical Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Standard Consultation Fee (Base USD / Display: {formatPrice(parseFloat(feeUSD) || 0)})
              </label>
              <input
                type="number"
                step="0.5"
                value={feeUSD}
                onChange={(e) => setFeeUSD(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600 font-bold text-teal-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Direct Clinic Extension Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Professional Bio & Experience</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full text-xs p-3 border border-stone-200 rounded-lg focus:outline-teal-600"
            />
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
            <strong>Assigned Practice Facility:</strong> {activeVet?.clinicName}
          </div>
        </div>

        {/* Right Column (6 cols): Weekly Working Hours & Consultation Slots */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
            <Clock className="w-5 h-5 text-teal-600" />
            <h2 className="text-sm font-bold text-stone-900">Clinic Working Days & Available Slots</h2>
          </div>

          {/* Active Days */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
              Weekly Practice Days
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((day) => {
                const isActive = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 text-xs font-bold rounded-xl border transition text-center ${
                      isActive
                        ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                        : 'border-stone-200 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Available Booking Time Slots ({availableSlots.length} Active)
              </label>
              <button
                type="button"
                onClick={() => setAvailableSlots(STANDARD_SLOTS)}
                className="text-[11px] text-teal-700 hover:underline font-medium"
              >
                Select All Standard
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-1 border border-stone-100 rounded-xl bg-stone-50/50">
              {STANDARD_SLOTS.map((slot) => {
                const isSelected = availableSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`py-2 px-1 text-xs rounded-lg border text-center transition font-mono font-medium ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 font-bold shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
            <Check className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <div>
              When patients book appointments, only selected active time slots on your designated working days will be available.
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Profile & Schedule Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Clinical Profile</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
