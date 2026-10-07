import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HealthRecordType } from '../../types';
import {
  FileText,
  Syringe,
  Pill,
  Activity,
  Stethoscope,
  Plus,
  AlertTriangle,
  CheckCircle,
  CloudOff,
  Printer,
  Copy,
  Check,
  Globe,
} from 'lucide-react';

interface HealthRecordsViewProps {
  onOpenAddRecordModal: () => void;
  onOpenExportPassportModal: () => void;
}

export const HealthRecordsView: React.FC<HealthRecordsViewProps> = ({
  onOpenAddRecordModal,
  onOpenExportPassportModal,
}) => {
  const { selectedPet, getPublicHealthRecordsForPet, isOnline, currentCountry, locationSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | HealthRecordType>('all');
  const [copiedChip, setCopiedChip] = useState(false);

  const petRecords = selectedPet ? getPublicHealthRecordsForPet(selectedPet.id) : [];
  const filteredRecords = petRecords.filter((r) => {
    if (activeTab === 'all') return true;
    return r.type === activeTab;
  });

  const vaccinesCount = petRecords.filter((r) => r.type === 'vaccine').length;
  const dueSoonCount = petRecords.filter((r) => r.status === 'due_soon' || r.status === 'expired').length;

  const handleCopyChip = () => {
    if (selectedPet?.microchipId) {
      navigator.clipboard.writeText(selectedPet.microchipId);
      setCopiedChip(true);
      setTimeout(() => setCopiedChip(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Action buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Digital Health Records & Passport
            </h1>
            {!isOnline && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold flex items-center gap-1">
                <CloudOff className="w-3 h-3" />
                Offline Storage View
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Verified immunization ledger, diagnostic lab panels, and veterinary notes for {selectedPet?.name} in {currentCountry.name}.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenExportPassportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 text-xs font-semibold shadow-xs transition"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Export Pet Passport</span>
          </button>
          <button
            onClick={onOpenAddRecordModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Health Record</span>
          </button>
        </div>
      </div>

      {/* Patient Health Summary Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:border-r border-stone-100 sm:pr-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Patient Identification
            </span>
            <div className="text-sm font-bold text-stone-900 mt-0.5">{selectedPet?.name}</div>
            <div className="text-xs text-stone-500">{selectedPet?.breed} · {selectedPet?.gender}</div>
            <button
              onClick={handleCopyChip}
              className="mt-2 flex items-center gap-1 text-[11px] font-mono text-teal-800 hover:text-teal-900 bg-teal-50 px-2 py-0.5 rounded"
            >
              <span>Chip: {selectedPet?.microchipId}</span>
              {copiedChip ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="sm:border-r border-stone-100 sm:pr-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Weight & Vitals
            </span>
            <div className="text-base font-bold text-stone-900 mt-0.5">
              {selectedPet?.weightKg} {locationSettings.weightUnit}
            </div>
            <div className="text-xs text-emerald-600 font-medium">Optimal Health Range</div>
            <div className="text-[10px] text-stone-400 mt-1">Verified via microchip</div>
          </div>
          <div className="sm:border-r border-stone-100 sm:pr-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Immunization Status
            </span>
            <div className="text-base font-bold text-stone-900 mt-0.5">{vaccinesCount} Logged</div>
            {dueSoonCount > 0 ? (
              <div className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{dueSoonCount} booster due soon</span>
              </div>
            ) : (
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>All vaccines up to date</span>
              </div>
            )}
            <div className="text-[10px] text-stone-400 mt-1">{currentCountry.name} Standard</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Allergies & Dietary
            </span>
            <div className="text-xs font-medium text-rose-700 mt-0.5">
              {selectedPet?.allergies.join(', ') || 'None reported'}
            </div>
            <div className="text-[11px] text-stone-500 mt-1 line-clamp-2">
              {selectedPet?.dietaryNotes}
            </div>
          </div>
        </div>
      </div>

      {/* Record Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'vaccine', label: 'Vaccinations & Boosters', icon: Syringe },
          { id: 'medication', label: 'Medications & Preventive', icon: Pill },
          { id: 'lab_result', label: 'Lab Tests & Diagnostic', icon: Activity },
          { id: 'checkup', label: 'Routine Physical Exams', icon: Stethoscope },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                isActive
                  ? 'bg-teal-50 text-teal-900 font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab.icon && <tab.icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-stone-400" />
            <h3 className="text-sm font-bold text-stone-900">No records found for this category</h3>
            <p className="text-xs text-stone-400">Add a record to maintain an updated health passport.</p>
            <button
              onClick={onOpenAddRecordModal}
              className="mt-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold"
            >
              Add First Record
            </button>
          </div>
        ) : (
          filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-teal-300 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                    {record.type === 'vaccine' ? (
                      <Syringe className="w-5 h-5" />
                    ) : record.type === 'medication' ? (
                      <Pill className="w-5 h-5" />
                    ) : record.type === 'lab_result' ? (
                      <Activity className="w-5 h-5" />
                    ) : (
                      <Stethoscope className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-900">{record.title}</h3>
                      {record.syncStatus === 'pending_sync' && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-mono font-medium flex items-center gap-1">
                          <CloudOff className="w-3 h-3" />
                          Queued (Offline)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Administered: <strong>{record.date}</strong> · {record.clinicName} · {record.veterinarian}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="self-start sm:self-auto text-left sm:text-right">
                  {record.status === 'due_soon' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Booster Due Soon
                    </span>
                  ) : record.status === 'expired' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      Expired
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Valid & Active
                    </span>
                  )}
                  {record.nextDueDate && (
                    <div className="text-[11px] text-stone-500 mt-1">
                      Next Due: <strong>{record.nextDueDate}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes & Batch number */}
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">Clinical Findings / Instructions</span>
                  <p className="mt-0.5 text-stone-800">{record.notes}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0 text-stone-500">
                  {record.batchNumber && (
                    <div className="text-[11px] font-mono">
                      Batch: <strong className="text-stone-700">{record.batchNumber}</strong>
                    </div>
                  )}
                  {record.attachmentName && (
                    <div className="flex items-center gap-1 text-[11px] text-teal-800 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{record.attachmentName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prescriptions if available */}
              {record.prescriptions && record.prescriptions.length > 0 && (
                <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-teal-900 uppercase block">
                    Prescribed Medications ({record.prescriptions.length})
                  </span>
                  <div className="space-y-1">
                    {record.prescriptions.map((rx, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-lg border border-teal-200">
                        <strong className="text-stone-900">{rx.medicineName}</strong> · <span>{rx.dosage}</span> ({rx.frequency} for {rx.durationDays} days)
                        <div className="text-[10px] text-stone-600 mt-0.5 italic">{rx.instructions}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner discharge notes if provided */}
              {record.ownerDischargeInstructions && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Doctor Discharge Instructions for Pet Parent
                  </span>
                  <p className="mt-0.5 text-stone-800">{record.ownerDischargeInstructions}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
