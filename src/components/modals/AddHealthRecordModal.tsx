import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HealthRecordType } from '../../types';
import { X, Syringe, FileText, Pill, Stethoscope, CloudOff } from 'lucide-react';

interface AddHealthRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPetId?: string;
}

export const AddHealthRecordModal: React.FC<AddHealthRecordModalProps> = ({
  isOpen,
  onClose,
  defaultPetId,
}) => {
  const { pets, selectedPetId, addHealthRecord, isOnline, currentCountry } = useApp();
  const [petId, setPetId] = useState(defaultPetId || selectedPetId || pets[0]?.id || '');
  const [type, setType] = useState<HealthRecordType>('vaccine');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextDueDate, setNextDueDate] = useState('');
  const [veterinarian, setVeterinarian] = useState('Dr. Elena Ramos, DVM');
  const [clinicName, setClinicName] = useState('Greenwood Animal Hospital & Wellness');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let status: 'valid' | 'due_soon' | 'expired' | 'completed' = 'valid';
    if (nextDueDate) {
      const today = new Date().toISOString().split('T')[0];
      if (nextDueDate < today) {
        status = 'expired';
      } else {
        const diffDays = Math.ceil((new Date(nextDueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 14) {
          status = 'due_soon';
        } else {
          status = 'valid';
        }
      }
    } else {
      status = 'completed';
    }

    addHealthRecord({
      petId,
      type,
      title: title.trim(),
      date,
      nextDueDate: nextDueDate || undefined,
      veterinarian: veterinarian.trim() || 'Attending Veterinarian',
      clinicName: clinicName.trim() || 'Veterinary Clinic',
      batchNumber: batchNumber.trim() || undefined,
      notes: notes.trim() || 'Routine health log entry.',
      status,
      attachmentName: attachmentName.trim() || undefined,
    });

    onClose();
  };

  const handleTypeSelect = (selectedType: HealthRecordType) => {
    setType(selectedType);
    if (selectedType === 'vaccine') {
      setTitle('Core Rabies & DHPP Booster');
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setNextDueDate(nextYear.toISOString().split('T')[0]);
    } else if (selectedType === 'medication') {
      setTitle('NexGard Spectra Chewable Tablet');
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setNextDueDate(nextMonth.toISOString().split('T')[0]);
    } else if (selectedType === 'lab_result') {
      setTitle('Complete Blood Count & Liver Panel');
      setNextDueDate('');
    } else {
      setTitle('Bi-Annual Comprehensive Physical');
      setNextDueDate('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Syringe className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Add Health Record</h2>
              <p className="text-xs text-stone-500">Log vaccine, medication, or diagnostic entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isOnline && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900">
            <CloudOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Offline Storage Mode:</strong> Record will be cached locally and synced automatically once online.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Pet Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Select Pet</label>
            <select
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600 bg-white"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species} - {p.breed})
                </option>
              ))}
            </select>
          </div>

          {/* Record Category Tabs */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Record Category</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'vaccine', label: 'Vaccine', icon: Syringe },
                { id: 'medication', label: 'Medication', icon: Pill },
                { id: 'lab_result', label: 'Lab Test', icon: FileText },
                { id: 'checkup', label: 'Checkup', icon: Stethoscope },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTypeSelect(item.id as HealthRecordType)}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border flex flex-col items-center gap-1 transition ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold shadow-xs'
                        : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Record Title / Vaccine Name *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rabies 3-Year Inactivated Booster"
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Date Administered</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Next Due / Booster Date</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
          </div>

          {/* Veterinarian & Clinic */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Administering Vet</label>
              <input
                type="text"
                value={veterinarian}
                onChange={(e) => setVeterinarian(e.target.value)}
                placeholder="Dr. Elena Ramos, DVM"
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Batch / Lot Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. RAB-2026-99"
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600 font-mono"
              />
            </div>
          </div>

          {/* Clinic Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Clinic Name</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Clinical Notes & Observations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Administered subcutaneously. No adverse reaction observed."
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
            />
          </div>

          {/* Attachment simulation */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Attach Certificate or Lab PDF</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="e.g. rabies_certificate_mochi.pdf"
                className="flex-1 text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
              <button
                type="button"
                onClick={() => setAttachmentName('official_veterinary_record.pdf')}
                className="px-3 py-1.5 text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium"
              >
                Simulate Scan
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm"
            >
              Save to Health Passport
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
