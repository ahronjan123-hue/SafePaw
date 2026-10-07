import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Pet, HealthRecord } from '../../types';
import {
  Users,
  Search,
  PlusCircle,
  FileText,
  Activity,
  Syringe,
  Pill,
  Shield,
  Phone,
  Lock,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
} from 'lucide-react';

interface VetPatientsViewProps {
  onOpenConsultationModal: (petId?: string) => void;
}

export const VetPatientsView: React.FC<VetPatientsViewProps> = ({
  onOpenConsultationModal,
}) => {
  const {
    getAuthorizedPatientsForVet,
    getAllHealthRecordsForVet,
    activeVet,
    locationSettings,
  } = useApp();

  const patients = getAuthorizedPatientsForVet();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.microchipId.includes(searchQuery)
  );

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientRecords = selectedPatient
    ? getAllHealthRecordsForVet(selectedPatient.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Electronic Medical Records (EMR)
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              Authorized Patients ({patients.length})
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Clinical charting, diagnostic laboratory results, prescription registries, and internal confidential notes.
          </p>
        </div>

        <button
          onClick={() => onOpenConsultationModal(selectedPatient?.id)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs self-start md:self-auto transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New SOAP Consultation Chart</span>
        </button>
      </div>

      {/* Main EMR Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column (4 cols): Patient Master Index */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-stone-600">Patient Directory</span>
              <span className="text-[10px] text-stone-400 font-mono">EMR v2.4</span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, breed, microchip..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-200 rounded-xl focus:outline-teal-600 bg-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredPatients.map((pet) => {
              const isSelected = pet.id === selectedPatient?.id;
              return (
                <div
                  key={pet.id}
                  onClick={() => setSelectedPatientId(pet.id)}
                  className={`p-3.5 cursor-pointer transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-50/80 border-l-4 border-l-teal-600'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-stone-900 truncate">{pet.name}</h4>
                        <span className="text-[10px] text-stone-500">({pet.species})</span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{pet.breed}</p>
                      <div className="text-[10px] font-mono text-teal-800 truncate">
                        ID: {pet.microchipId}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-stone-800">
                      {pet.weightKg} {locationSettings.weightUnit}
                    </span>
                    <div className="text-[9px] text-stone-400">{pet.ageYears}y old</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (8 cols): Comprehensive Patient Medical Chart */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Identity & Biological Summary Header */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedPatient.photoUrl}
                      alt={selectedPatient.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-teal-500 shadow-xs shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-stone-900">{selectedPatient.name}</h2>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
                          {selectedPatient.species} · {selectedPatient.gender} ({selectedPatient.neutered ? 'Neutered' : 'Intact'})
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        {selectedPatient.breed} · Born {selectedPatient.birthDate} ({selectedPatient.ageYears} Years Old)
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500 font-mono">
                        <span className="text-teal-800 font-semibold">Microchip: {selectedPatient.microchipId}</span>
                        <span>·</span>
                        <span>Weight: {selectedPatient.weightKg} {locationSettings.weightUnit}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenConsultationModal(selectedPatient.id)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add SOAP Chart</span>
                  </button>
                </div>

                {/* Medical Alerts Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-900 uppercase block mb-0.5">
                      Known Hypersensitivities & Allergies
                    </span>
                    <strong className="text-rose-700">
                      {selectedPatient.allergies.join(', ') || 'None reported'}
                    </strong>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <span className="text-[10px] font-bold text-stone-700 uppercase block mb-0.5">
                      Temperament & Clinical Behavior
                    </span>
                    <p className="text-stone-800">{selectedPatient.temperament}</p>
                  </div>
                </div>
              </div>

              {/* Historical Clinical Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <h3 className="text-sm font-bold text-stone-900">
                      Clinical Records & Consultations ({patientRecords.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-stone-500">Chronological Medical Ledger</span>
                </div>

                {patientRecords.length === 0 ? (
                  <div className="py-8 text-center text-stone-500 text-xs space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-stone-400" />
                    <p>No historical medical charts logged for this patient yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className={`p-5 rounded-2xl border transition space-y-3 ${
                          rec.isPrivateVetNote
                            ? 'border-amber-300 bg-amber-50/30'
                            : 'border-stone-200 bg-white'
                        }`}
                      >
                        {/* Header: Title, Category, Author attribution */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0 font-bold">
                              {rec.type === 'vaccine' ? (
                                <Syringe className="w-4 h-4" />
                              ) : rec.type === 'medication' ? (
                                <Pill className="w-4 h-4" />
                              ) : (
                                <Activity className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                                  {rec.title}
                                </h4>
                                {rec.isPrivateVetNote && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 border border-amber-300">
                                    <Lock className="w-3 h-3" /> Private Doctor Chart
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-500">
                                Signed by: <strong>{rec.veterinarian}</strong> ({rec.vetLicenseNumber || 'PRC-VERIFIED'}) · {rec.clinicName}
                              </p>
                            </div>
                          </div>

                          <div className="text-right text-xs font-mono text-stone-600">
                            <strong>{rec.date}</strong>
                            {rec.nextDueDate && (
                              <div className="text-[10px] text-teal-700">Next due: {rec.nextDueDate}</div>
                            )}
                          </div>
                        </div>

                        {/* Vitals Summary Strip if recorded */}
                        {rec.vitals && (
                          <div className="grid grid-cols-4 gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-xs">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">Weight</span>
                              <strong>{rec.vitals.weightKg} kg</strong>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">Temp</span>
                              <strong>{rec.vitals.tempC ? `${rec.vitals.tempC}°C` : 'N/A'}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">Heart Rate</span>
                              <strong>{rec.vitals.heartRateBpm ? `${rec.vitals.heartRateBpm} bpm` : 'N/A'}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-bold text-stone-400 block">Resp Rate</span>
                              <strong>{rec.vitals.respiratoryRateBpm ? `${rec.vitals.respiratoryRateBpm} /min` : 'N/A'}</strong>
                            </div>
                          </div>
                        )}

                        {/* Diagnosis & Findings */}
                        {rec.diagnosis && (
                          <div className="text-xs bg-teal-50/60 p-3 rounded-xl border border-teal-100 text-teal-950">
                            <span className="font-bold uppercase text-[10px] text-teal-800 block">Definitive Diagnosis</span>
                            <p className="font-semibold text-xs mt-0.5">{rec.diagnosis}</p>
                          </div>
                        )}

                        <div className="text-xs text-stone-700">
                          <span className="font-bold text-stone-500 uppercase text-[10px] block">Clinical Notes</span>
                          <p className="mt-0.5">{rec.notes}</p>
                        </div>

                        {/* Prescriptions issued */}
                        {rec.prescriptions && rec.prescriptions.length > 0 && (
                          <div className="pt-2 border-t border-stone-100 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-stone-500 flex items-center gap-1">
                              <Pill className="w-3 h-3 text-teal-600" />
                              Prescribed Medications ({rec.prescriptions.length})
                            </span>
                            <div className="space-y-1">
                              {rec.prescriptions.map((rx, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 bg-stone-50 rounded-lg border border-stone-200 text-xs flex justify-between items-center"
                                >
                                  <div>
                                    <strong className="text-stone-900">{rx.medicineName}</strong> ·{' '}
                                    <span className="text-stone-600">{rx.dosage}</span> ({rx.frequency} for {rx.durationDays}d)
                                    <div className="text-[10px] text-stone-500 italic">{rx.instructions}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Discharge instructions vs Private vet notes */}
                        {rec.ownerDischargeInstructions && (
                          <div className="pt-2 border-t border-stone-100 text-xs text-stone-800">
                            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                              Client Discharge Instructions
                            </span>
                            <p className="text-stone-700 mt-0.5">{rec.ownerDischargeInstructions}</p>
                          </div>
                        )}

                        {rec.privateVetNotes && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950">
                            <span className="text-[10px] font-bold text-amber-800 uppercase block flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Internal Doctor Assessment (Confidential)
                            </span>
                            <p className="mt-0.5 text-amber-900">{rec.privateVetNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-500">
              Select a patient from the directory on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
