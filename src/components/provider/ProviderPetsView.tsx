import React, { useState } from 'react';
import { ProviderServiceType, Pet } from '../../types';
import {
  Heart,
  Search,
  PlusCircle,
  Activity,
  Scissors,
  Home,
  Shield,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Sparkles,
  Camera,
} from 'lucide-react';

interface ProviderPetsViewProps {
  providerType: ProviderServiceType;
  pets: Pet[];
  onShowToast: (msg: string) => void;
}

export const ProviderPetsView: React.FC<ProviderPetsViewProps> = ({
  providerType,
  pets,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Spa & Grooming Pet Profiles
  const [groomingPets] = useState([
    {
      id: 'gp-1',
      name: 'Bella',
      breed: 'Shih Tzu',
      coatType: 'Long Hair / Prone to Matting',
      ownerName: 'Danica Tan',
      dryerTolerance: 'Moderate (Low heat required)',
      temperament: 'Calm during bath, restless during paw clipping',
      favoriteCut: 'Asian Fusion Teddy Bear Trim',
      photo: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
      lastGroomed: 'Oct 08, 2026',
    },
    {
      id: 'gp-2',
      name: 'Milo',
      breed: 'Toy Poodle',
      coatType: 'Dense Curly Wool',
      ownerName: 'Paolo Reyes',
      dryerTolerance: 'High (Loves high velocity blow)',
      temperament: 'Playful, loves gentle ear massages',
      favoriteCut: 'Modern Lamb Cut with Fluffy Tail',
      photo: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=400&q=80',
      lastGroomed: 'Oct 02, 2026',
    },
    {
      id: 'gp-3',
      name: 'Kobe',
      breed: 'Pomeranian',
      coatType: 'Double Coat (No shaving permitted)',
      ownerName: 'Erika Santos',
      dryerTolerance: 'Sensitive ears',
      temperament: 'Alert, responsive to treats',
      favoriteCut: 'Show Coat Blowout & Lion Collar',
      photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
      lastGroomed: 'Sep 29, 2026',
    },
  ]);

  // 2. Shelter Resident Rescued Animals
  const [shelterAnimals] = useState([
    {
      id: 'sa-1',
      name: 'Bramble',
      species: 'Canine',
      breed: 'Aspin (Philippine Native Dog)',
      age: '1.5 years',
      weightKg: 14.2,
      intakeDate: 'Aug 14, 2026',
      intakeLocation: 'Rescued from roadside canal in Pasig',
      kennelBed: 'Canine Unit A-14',
      status: 'Adoption Screening Active',
      medicalNotes: 'Fully vaccinated, neutered, dewormed, heartworm negative.',
      photo: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'sa-2',
      name: 'Cleo',
      species: 'Feline',
      breed: 'Calico Puspin',
      age: '8 months',
      weightKg: 3.1,
      intakeDate: 'Sep 02, 2026',
      intakeLocation: 'Found wet under market stall in Mandaluyong',
      kennelBed: 'Cattery Playroom C-08',
      status: 'Available for Immediate Adoption',
      medicalNotes: 'Spayed, FVRCP completed, litter-box trained, microchipped.',
      photo: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'sa-3',
      name: 'Cooper',
      species: 'Canine',
      breed: 'Aspin / Terrier Cross',
      age: '2 years',
      weightKg: 11.0,
      intakeDate: 'Sep 18, 2026',
      intakeLocation: 'Hit & run survivor on Commonwealth Ave',
      kennelBed: 'Medical Recovery Isolation M-02',
      status: 'In Foster Care Rehab',
      medicalNotes: 'Femur pinning healed. Daily physical therapy with Dr. Alcantara.',
      photo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=400&q=80',
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Heart className="w-5 h-5 text-teal-400" />
            <span>
              {providerType === 'veterinary_clinic' && 'Clinical Patient Roster & Medical Profiles'}
              {providerType === 'grooming_salon' && 'Pet Coat Profiles & Grooming Tolerance Records'}
              {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Shelter Resident Animals & Rehoming Profiles'}
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {providerType === 'veterinary_clinic' && 'Patient clinical history, allergy contraindications, electronic health passports, and microchip IDs.'}
            {providerType === 'grooming_salon' && 'Coat texture guidelines, blowdryer temperament, sensitive areas, and styling preferences.'}
            {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Resident intakes, kennel/cattery allocations, veterinary clearance status, and public adoption listings.'}
          </p>
        </div>

        <button
          onClick={() => onShowToast('New pet profile intake opened')}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>
            {providerType === 'veterinary_clinic' && 'Register New Patient'}
            {providerType === 'grooming_salon' && 'Register Salon Pet'}
            {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Intake New Animal'}
          </span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pet name, microchip ID, breed, or owner..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-stone-500 text-xs focus:outline-hidden focus:border-teal-500"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. VETERINARY CLINIC PATIENT ROSTER */}
      {/* ========================================================= */}
      {providerType === 'veterinary_clinic' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={pet.photoUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80'}
                    alt={pet.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-extrabold text-white truncate">{pet.name}</h3>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 font-mono">
                        {pet.species}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400 truncate">{pet.breed}</div>
                    <div className="text-[11px] text-stone-500 font-mono mt-0.5 truncate">
                      Chip: {pet.microchipId || '985147247029846'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs pt-1 border-t border-stone-900">
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Guardian:</span>
                    <strong className="text-stone-200">{pet.ownerName || 'Verified Guardian'}</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Weight & Age:</span>
                    <strong className="text-stone-200">{pet.weightKg} kg · {pet.ageYears} yrs</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-400">
                    <span>Sterilized / Neutered:</span>
                    <strong className="text-emerald-400">{pet.neutered ? 'Yes (Sterilized)' : 'Intact'}</strong>
                  </div>

                  {pet.allergies && pet.allergies.length > 0 && (
                    <div className="p-2 rounded-xl bg-rose-950/40 border border-rose-900/60 text-[11px] text-rose-300 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>Allergy Alert: {pet.allergies.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onShowToast(`Digital pet health passport opened for ${pet.name}`)}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  View Medical Passport
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SPA & GROOMING SALON PET PROFILES */}
      {/* ========================================================= */}
      {providerType === 'grooming_salon' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groomingPets.map((gp) => (
            <div
              key={gp.id}
              className="p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={gp.photo}
                    alt={gp.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-stone-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-white">{gp.name}</h3>
                    <div className="text-xs text-stone-400">{gp.breed}</div>
                    <div className="text-[11px] text-teal-300 font-semibold mt-0.5">
                      Parent: {gp.ownerName}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs pt-1 border-t border-stone-900">
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <div className="text-stone-400 text-[10px] uppercase font-mono">Coat Texture</div>
                    <div className="text-white font-semibold">{gp.coatType}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 space-y-1">
                    <div className="text-stone-400 text-[10px] uppercase font-mono">Preferred Cut & Styling</div>
                    <div className="text-amber-300 font-semibold">{gp.favoriteCut}</div>
                  </div>

                  <div className="text-[11px] text-stone-400">
                    <strong>Temperament:</strong> {gp.temperament}
                  </div>
                  <div className="text-[11px] text-stone-400">
                    <strong>Dryer Tolerance:</strong> {gp.dryerTolerance}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onShowToast(`Booked upcoming styling session for ${gp.name}`)}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Book Grooming Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SHELTER & RESCUE RESIDENT ANIMALS */}
      {/* ========================================================= */}
      {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {shelterAnimals.map((sa) => (
            <div
              key={sa.id}
              className="p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={sa.photo}
                    alt={sa.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-stone-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-extrabold text-white">{sa.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                        {sa.status}
                      </span>
                    </div>
                    <div className="text-xs text-stone-400">{sa.breed} ({sa.species})</div>
                    <div className="text-[11px] text-teal-400 font-mono mt-0.5">
                      Bed: {sa.kennelBed}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs pt-1 border-t border-stone-900">
                  <div className="text-[11px] text-stone-400">
                    <strong>Rescue Origin:</strong> {sa.intakeLocation} ({sa.intakeDate})
                  </div>
                  <div className="text-[11px] text-stone-400">
                    <strong>Age & Weight:</strong> {sa.age} · {sa.weightKg} kg
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
                    <strong>Medical Clearance:</strong> {sa.medicalNotes}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center gap-2">
                <button
                  onClick={() => onShowToast(`Public adoption poster created for ${sa.name}`)}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Feature on Adoption Wall
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
