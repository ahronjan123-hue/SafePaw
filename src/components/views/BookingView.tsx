import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Shield,
  Video,
  MapPin,
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  CloudOff,
  Globe,
} from 'lucide-react';

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

export const BookingView: React.FC = () => {
  const {
    clinics,
    pets,
    selectedPetId,
    bookAppointment,
    setCurrentTab,
    preselectedClinicId,
    setPreselectedClinicId,
    isOnline,
    currentCountry,
    locationSettings,
    formatPrice,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedClinicId, setSelectedClinicId] = useState<string>(
    preselectedClinicId || clinics[0]?.id || ''
  );
  const [selectedPet, setSelectedPet] = useState<string>(selectedPetId || pets[0]?.id || '');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [isTelehealth, setIsTelehealth] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-12');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [selectedVetId, setSelectedVetId] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('Routine health exam and booster review');
  const [notes, setNotes] = useState<string>('');
  const [paymentChoice, setPaymentChoice] = useState<'pay_at_clinic' | 'deposit_paid'>('deposit_paid');

  // Confirmation result
  const [bookedAppointmentId, setBookedAppointmentId] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string>('');

  // Sync if preselected clinic changed
  useEffect(() => {
    if (preselectedClinicId) {
      setSelectedClinicId(preselectedClinicId);
    }
  }, [preselectedClinicId]);

  const currentClinic = clinics.find((c) => c.id === selectedClinicId) || clinics[0];
  const currentPet = pets.find((p) => p.id === selectedPet) || pets[0];
  const currentService = currentClinic?.services.find((s) => s.id === selectedServiceId) || currentClinic?.services[0];
  const currentVet = currentClinic?.veterinarians.find((v) => v.id === selectedVetId) || currentClinic?.veterinarians[0];

  useEffect(() => {
    if (currentClinic && !selectedServiceId) {
      setSelectedServiceId(currentClinic.services[0]?.id || '');
    }
    if (currentClinic && !selectedVetId) {
      setSelectedVetId(currentClinic.veterinarians[0]?.id || '');
    }
  }, [currentClinic]);

  const handleConfirmBooking = () => {
    if (!currentClinic || !currentPet || !currentService) return;
    setBookingError('');

    const res = bookAppointment({
      petId: currentPet.id,
      petName: currentPet.name,
      clinicId: currentClinic.id,
      clinicName: currentClinic.name,
      clinicAddress: `${currentClinic.address}, ${locationSettings.customCity || currentCountry.defaultCity}`,
      vetId: currentVet?.id,
      vetName: currentVet?.name || 'Assigned Veterinary Surgeon',
      serviceId: currentService.id,
      serviceName: currentService.name,
      date: selectedDate,
      time: selectedTime,
      isTelehealth,
      symptoms: symptoms.trim() || 'General checkup',
      notes: notes.trim() || undefined,
      baseCostUSD: currentService.basePriceUSD,
      paymentStatus: paymentChoice,
    });

    if (res.error) {
      setBookingError(res.error);
      return;
    }

    if (res.appointment) {
      setBookedAppointmentId(res.appointment.id);
      setPreselectedClinicId(null);
      setStep(5); // Success step
    }
  };

  const depositUSD = 15;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Secure Veterinary Appointment Booking
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Schedule in-clinic visits or remote video consultations in {currentCountry.name} ({currentCountry.currencyCode}).
          </p>
        </div>
        <div className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-semibold self-start sm:self-auto flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>Currency: {currentCountry.currencyCode} ({currentCountry.currencySymbol})</span>
        </div>
      </div>

      {!isOnline && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-900">
          <CloudOff className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong>Offline Mode Active:</strong> You can proceed with booking! Your appointment request will be saved locally and submitted immediately once your connection restores.
          </div>
        </div>
      )}

      {/* Stepper Header (for steps 1 to 4) */}
      {step < 5 && (
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between text-xs">
          {[
            { num: 1, label: 'Provider' },
            { num: 2, label: 'Pet & Service' },
            { num: 3, label: 'Schedule' },
            { num: 4, label: 'Review' },
          ].map((item) => (
            <div
              key={item.num}
              className={`flex items-center gap-1.5 ${
                step === item.num
                  ? 'text-teal-900 font-bold'
                  : step > item.num
                  ? 'text-teal-700 font-semibold'
                  : 'text-stone-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  step === item.num
                    ? 'bg-teal-600 text-white'
                    : step > item.num
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                {step > item.num ? '✓' : item.num}
              </div>
              <span className="hidden sm:inline">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: Select Clinic */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-stone-900">Step 1: Choose Clinic or Provider</h2>
          <div className="space-y-3">
            {clinics.map((clinic) => {
              const isSelected = clinic.id === selectedClinicId;
              return (
                <div
                  key={clinic.id}
                  onClick={() => {
                    setSelectedClinicId(clinic.id);
                    setSelectedServiceId(clinic.services[0]?.id || '');
                    setSelectedVetId(clinic.veterinarians[0]?.id || '');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-200'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={clinic.image}
                      alt={clinic.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-stone-900">{clinic.name}</h4>
                        {clinic.emergencyAvailable && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                            24/7
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {clinic.address}, {locationSettings.customCity || currentCountry.defaultCity}
                      </p>
                      <div className="text-[10px] text-stone-400 mt-1">
                        ★ {clinic.rating} ({clinic.reviewsCount} reviews) · {clinic.services.length} services available
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-teal-600 bg-teal-600 text-white' : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <span className="text-xs">✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <span>Next: Select Pet & Service</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pet & Service */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900">Step 2: Select Patient & Service</h2>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Patient Pet Select */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Patient Pet</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pets.map((p) => {
                const isSelected = p.id === selectedPet;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPet(p.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="text-xs">
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[10px] text-stone-500 font-normal">
                        {p.breed} · {p.weightKg} {locationSettings.weightUnit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clinical Service Selection with Localized Prices */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Clinical Service at {currentClinic.name} ({currentCountry.currencyCode})
            </label>
            <div className="space-y-2">
              {currentClinic.services.map((srv) => {
                const isSelected = srv.id === selectedServiceId;
                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedServiceId(srv.id);
                      if (srv.category === 'Telehealth') {
                        setIsTelehealth(true);
                      }
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-200'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">{srv.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                          {srv.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{srv.description}</p>
                      <span className="text-[10px] text-teal-700 mt-1 block">
                        Est. duration: {srv.durationMinutes} mins
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-stone-900">
                        {formatPrice(srv.basePriceUSD)}
                      </div>
                      <span className="text-[9px] text-stone-400">Fixed rate</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <span>Next: Date & Time</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Format & Schedule */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900">Step 3: Consultation Format & Slot</h2>
            <button
              onClick={() => setStep(2)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* In-Clinic vs Telehealth Toggle */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Visit Format</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsTelehealth(false)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition text-left ${
                  !isTelehealth
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-semibold shadow-xs ring-2 ring-teal-200'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">In-Clinic Visit</div>
                  <div className="text-[10px] text-stone-500 font-normal">
                    Physical exam at {currentClinic.address}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsTelehealth(true)}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition text-left ${
                  isTelehealth
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-semibold shadow-xs ring-2 ring-teal-200'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700 shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Telehealth Video</div>
                  <div className="text-[10px] text-stone-500 font-normal">
                    Secure video call from comfort of home
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Attending Veterinarian Preference */}
          {currentClinic.veterinarians.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Preferred Attending Veterinarian
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentClinic.veterinarians.map((vet) => (
                  <button
                    key={vet.id}
                    type="button"
                    onClick={() => setSelectedVetId(vet.id)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition text-left ${
                      selectedVetId === vet.id
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <img
                      src={vet.avatar}
                      alt={vet.name}
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                    />
                    <div className="text-xs">
                      <div>{vet.name}</div>
                      <div className="text-[10px] text-stone-500 font-normal">{vet.specialization}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Appointment Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Available Time Slots
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition ${
                    selectedTime === slot
                      ? 'border-teal-600 bg-teal-600 text-white font-semibold shadow-xs'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <span>Next: Medical Notes & Review</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Symptoms, Payment choice & Review */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-sm font-bold text-stone-900">Step 4: Symptoms & Secure Confirmation</h2>
            <button
              onClick={() => setStep(3)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {/* Symptoms Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Reason for Visit / Symptoms *
            </label>
            <input
              type="text"
              required
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. Annual booster, limping on front leg, itchy ears"
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Special Handling Instructions for Clinical Team
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Known allergies: ${currentPet.allergies.join(', ') || 'None'}. Temperament: ${currentPet.temperament}`}
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Booking Summary Box */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5 text-xs">
            <div className="font-bold text-stone-900 uppercase tracking-wider text-[11px] pb-2 border-b border-stone-200">
              Appointment Itinerary ({currentCountry.name})
            </div>
            <div className="grid grid-cols-2 gap-2 text-stone-700">
              <div>
                <span className="text-stone-400 block text-[10px]">Patient:</span>
                <strong>{currentPet.name} ({currentPet.breed})</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Clinic:</span>
                <strong>{currentClinic.name}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Service:</span>
                <strong>{currentService?.name}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Date & Time:</span>
                <strong>{selectedDate} at {selectedTime}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Format:</span>
                <strong>{isTelehealth ? 'Remote Video Telehealth' : 'In-Person Hospital Visit'}</strong>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Veterinarian:</span>
                <strong>{currentVet?.name}</strong>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-900">
              <span className="font-medium">Total Fee ({currentCountry.currencyCode}):</span>
              <span className="text-base font-bold text-teal-900">
                {formatPrice(currentService?.basePriceUSD || 0)}
              </span>
            </div>
          </div>

          {/* Payment Terms with Converted Currency */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Payment Preference</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentChoice('deposit_paid')}
                className={`p-3 rounded-xl border text-left transition ${
                  paymentChoice === 'deposit_paid'
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-semibold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-xs font-bold">Lock Slot with Deposit ({formatPrice(depositUSD)})</div>
                <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                  Balance paid at clinic after consultation
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentChoice('pay_at_clinic')}
                className={`p-3 rounded-xl border text-left transition ${
                  paymentChoice === 'pay_at_clinic'
                    ? 'border-teal-600 bg-teal-50 text-teal-950 font-semibold'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="text-xs font-bold">Pay in Full at Reception</div>
                <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                  Cash or Card upon physical check-in
                </div>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
            <button
              onClick={handleConfirmBooking}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Confirm & Lock Appointment</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Success Confirmation Screen */}
      {step === 5 && (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">Appointment Confirmed!</h2>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Your visit has been registered with {currentClinic.name}. We sent a calendar reminder and push notification.
            </p>
          </div>
          <div className="max-w-md mx-auto p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-stone-500">Booking Reference:</span>
              <strong className="font-mono text-teal-800">SP-APT-{bookedAppointmentId?.slice(-6).toUpperCase()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Scheduled For:</span>
              <strong>{selectedDate} at {selectedTime}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Attending Vet:</span>
              <strong>{currentVet?.name}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total Price:</span>
              <strong className="text-teal-900 font-bold">{formatPrice(currentService?.basePriceUSD || 0)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Status:</span>
              <span className="font-semibold text-emerald-700">Scheduled · Live Tracker Active</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              onClick={() => setCurrentTab('tracker')}
              className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Open Live Appointment Tracker
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
