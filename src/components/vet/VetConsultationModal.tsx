import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PrescriptionItem, HealthRecordType } from '../../types';
import {
  X,
  Stethoscope,
  Syringe,
  Pill,
  FileText,
  Activity,
  Plus,
  Trash2,
  Lock,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface VetConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillPetId?: string;
  prefillAppointmentId?: string;
}

export const VetConsultationModal: React.FC<VetConsultationModalProps> = ({
  isOpen,
  onClose,
  prefillPetId,
  prefillAppointmentId,
}) => {
  const {
    pets,
    activeVet,
    getAuthorizedPatientsForVet,
    getVetAppointments,
    addClinicalConsultationNote,
    locationSettings,
  } = useApp();

  const authorizedPets = getAuthorizedPatientsForVet();
  const [selectedPetId, setSelectedPetId] = useState<string>(
    prefillPetId || authorizedPets[0]?.id || pets[0]?.id || ''
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    prefillAppointmentId || ''
  );

  // Sync when prefill changes
  useEffect(() => {
    if (prefillPetId) setSelectedPetId(prefillPetId);
    if (prefillAppointmentId) setSelectedAppointmentId(prefillAppointmentId);
  }, [prefillPetId, prefillAppointmentId]);

  // Clinical Consultation Chart Fields
  const [chartTitle, setChartTitle] = useState('Comprehensive Clinical Exam & Consultation');
  const [diagnosis, setDiagnosis] = useState('Acute Gastrointestinal Distress (Mild) - Diet Induced');
  const [subjectiveNotes, setSubjectiveNotes] = useState(
    'Patient presented with mild limp on right hind leg and lethargy after vigorous park activity. Appetite normal.'
  );

  // Vitals
  const [weightKg, setWeightKg] = useState('28.5');
  const [tempC, setTempC] = useState('38.6');
  const [heartRate, setHeartRate] = useState('110');
  const [respRate, setRespRate] = useState('24');

  // Prescriptions List
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    {
      medicineName: 'Meloxicam Oral Suspension (0.5mg/mL)',
      dosage: '0.1mg/kg (2.8mL)',
      frequency: 'Once daily with food',
      durationDays: 5,
      instructions: 'Administer orally directly or mix with wet food. Discontinue if vomiting occurs.',
    },
  ]);

  // Vaccine administered in this visit
  const [includeVaccine, setIncludeVaccine] = useState(false);
  const [vaccineName, setVaccineName] = useState('Rabies 3-Year Inactivated Booster');
  const [batchNumber, setBatchNumber] = useState('RAB-2026-PH88');
  const [vaccineDueDate, setVaccineDueDate] = useState('2029-10-07');

  // Privacy & Discharge Instructions
  const [isPrivateVetNote, setIsPrivateVetNote] = useState(false);
  const [privateVetNotes, setPrivateVetNotes] = useState(
    'Differential diagnosis: Rule out patellar luxation vs soft tissue strain. If limping persists past 7 days, schedule orthopedic digital X-ray series.'
  );
  const [ownerDischargeInstructions, setOwnerDischargeInstructions] = useState(
    'Strict leash walks only for 5 days. Avoid stairs and high jumps. Administer prescribed anti-inflammatory once daily after breakfast.'
  );
  const [markComplete, setMarkComplete] = useState(true);

  if (!isOpen) return null;

  const currentPatient = pets.find((p) => p.id === selectedPetId) || pets[0];
  const patientAppointments = getVetAppointments().filter(
    (a) => a.petId === selectedPetId && a.status !== 'completed' && a.status !== 'cancelled'
  );

  const handleAddPrescription = () => {
    setPrescriptions((prev) => [
      ...prev,
      {
        medicineName: '',
        dosage: '',
        frequency: 'Twice daily after meals',
        durationDays: 7,
        instructions: 'Take as directed.',
      },
    ]);
  };

  const handleRemovePrescription = (index: number) => {
    setPrescriptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdatePrescription = (index: number, updates: Partial<PrescriptionItem>) => {
    setPrescriptions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...updates } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId || !chartTitle.trim()) return;

    addClinicalConsultationNote({
      petId: selectedPetId,
      appointmentId: selectedAppointmentId || undefined,
      title: chartTitle.trim(),
      diagnosis: diagnosis.trim() || 'Routine Clinical Examination',
      notes: subjectiveNotes.trim() || 'Clinical evaluation performed.',
      vitals: {
        weightKg: parseFloat(weightKg) || undefined,
        tempC: parseFloat(tempC) || undefined,
        heartRateBpm: parseInt(heartRate) || undefined,
        respiratoryRateBpm: parseInt(respRate) || undefined,
      },
      prescriptions: prescriptions.filter((p) => p.medicineName.trim()),
      vaccineAdministered: includeVaccine
        ? {
            name: vaccineName,
            batchNumber,
            nextDueDate: vaccineDueDate,
          }
        : undefined,
      isPrivateVetNote,
      privateVetNotes: privateVetNotes.trim() || undefined,
      ownerDischargeInstructions: ownerDischargeInstructions.trim(),
      markAppointmentComplete: markComplete,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[92vh] overflow-y-auto z-10 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900">Clinical Consultation Chart (EMR)</h2>
                <span className="text-[10px] bg-stone-100 text-stone-700 font-mono px-1.5 py-0.2 rounded border border-stone-300">
                  By {activeVet?.name || 'Attending Vet'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Log SOAP assessment, vitals, official prescriptions & health passport entries
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection Banner */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Select Patient *</label>
              <select
                value={selectedPetId}
                onChange={(e) => {
                  setSelectedPetId(e.target.value);
                  const pet = pets.find((p) => p.id === e.target.value);
                  if (pet) setWeightKg(pet.weightKg.toString());
                }}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-teal-600"
              >
                {pets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species} · {p.breed})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Linked Active Appointment
              </label>
              <select
                value={selectedAppointmentId}
                onChange={(e) => setSelectedAppointmentId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg bg-white focus:outline-teal-600"
              >
                <option value="">-- Standalone Consultation / Walk-in --</option>
                {patientAppointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.date} ({a.time}) - {a.serviceName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Patient Microchip</label>
              <div className="font-mono text-xs bg-white px-3 py-2 border border-stone-200 rounded-lg text-teal-800 font-semibold">
                {currentPatient?.microchipId || 'N/A'}
              </div>
            </div>
          </div>

          {/* Section 1: Subjective & Clinical Vitals */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>1. Vitals & Subjective History</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Weight ({locationSettings.weightUnit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempC}
                  onChange={(e) => setTempC(e.target.value)}
                  placeholder="38.5"
                  className="w-full text-xs px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="100"
                  className="w-full text-xs px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Resp. Rate (RR)
                </label>
                <input
                  type="number"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  placeholder="24"
                  className="w-full text-xs px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-teal-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Subjective History & Chief Complaint
              </label>
              <textarea
                rows={2}
                value={subjectiveNotes}
                onChange={(e) => setSubjectiveNotes(e.target.value)}
                placeholder="Reason for visit, duration of symptoms, appetite and behavior..."
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
          </div>

          {/* Section 2: Assessment & Clinical Diagnosis */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>2. Assessment & Definitive Diagnosis</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Chart / Visit Title *
                </label>
                <input
                  type="text"
                  required
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Definitive / Clinical Diagnosis *
                </label>
                <input
                  type="text"
                  required
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Acute Allergic Dermatitis, Canine Parvovirus..."
                  className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600 font-medium text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Prescriptions Builder */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" />
                <span>3. Rx Digital Prescriptions ({prescriptions.length})</span>
              </h3>
              <button
                type="button"
                onClick={handleAddPrescription}
                className="px-2.5 py-1 text-xs bg-teal-50 text-teal-800 hover:bg-teal-100 rounded-lg font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Medication</span>
              </button>
            </div>

            {prescriptions.map((rx, idx) => (
              <div
                key={idx}
                className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700">Rx #{idx + 1}</span>
                  {prescriptions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemovePrescription(idx)}
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Medication Name (e.g. Amoxicillin)"
                      value={rx.medicineName}
                      onChange={(e) =>
                        handleUpdatePrescription(idx, { medicineName: e.target.value })
                      }
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 250mg, 1 tablet)"
                      value={rx.dosage}
                      onChange={(e) => handleUpdatePrescription(idx, { dosage: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 2x daily for 7 days)"
                      value={rx.frequency}
                      onChange={(e) => handleUpdatePrescription(idx, { frequency: e.target.value })}
                      className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Special instructions for pet owner..."
                  value={rx.instructions}
                  onChange={(e) => handleUpdatePrescription(idx, { instructions: e.target.value })}
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg"
                />
              </div>
            ))}
          </div>

          {/* Section 4: Vaccine Administration Toggle */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVaccine}
                  onChange={(e) => setIncludeVaccine(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Syringe className="w-3.5 h-3.5 text-teal-600" />
                  Administer & Log Vaccination in Passport
                </span>
              </label>
            </div>

            {includeVaccine && (
              <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Vaccine Antigen</label>
                  <input
                    type="text"
                    value={vaccineName}
                    onChange={(e) => setVaccineName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Batch / Lot Number</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Next Booster Due</label>
                  <input
                    type="date"
                    value={vaccineDueDate}
                    onChange={(e) => setVaccineDueDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Private Internal Notes vs Public Discharge Instructions */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Public Pet Owner Discharge & Aftercare Instructions</span>
                </label>
                <span className="text-[10px] text-stone-400">Visible in Pet Passport</span>
              </div>
              <textarea
                rows={2}
                value={ownerDischargeInstructions}
                onChange={(e) => setOwnerDischargeInstructions(e.target.value)}
                placeholder="Care instructions provided to client..."
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>

            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Confidential Internal Veterinarian Notes (Clinical Eyes Only)</span>
                </label>
                <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-1.5 py-0.2 rounded">
                  Hidden from Pet Owner
                </span>
              </div>
              <textarea
                rows={2}
                value={privateVetNotes}
                onChange={(e) => setPrivateVetNotes(e.target.value)}
                placeholder="Differential diagnostic considerations, surgical prognosis, clinic staff notes..."
                className="w-full text-xs px-3 py-2 bg-white border border-amber-300 rounded-lg focus:outline-amber-600"
              />
            </div>
          </div>

          {/* Completion Action */}
          {selectedAppointmentId && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={markComplete}
                  onChange={(e) => setMarkComplete(e.target.checked)}
                  className="rounded text-teal-600"
                />
                <span>Mark linked appointment as "Completed" and notify owner</span>
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Finalize & Sign Clinical Chart</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
