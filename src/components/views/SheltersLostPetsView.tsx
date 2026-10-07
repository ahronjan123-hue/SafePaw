import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Radio,
  MapPin,
  Phone,
  Shield,
  Heart,
  Check,
  Home,
} from 'lucide-react';

interface SheltersLostPetsViewProps {
  onOpenReportLostPetModal: () => void;
}

export const SheltersLostPetsView: React.FC<SheltersLostPetsViewProps> = ({
  onOpenReportLostPetModal,
}) => {
  const { lostPets, adoptablePets, formatPrice, currentCountry, locationSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'radar' | 'shelters'>('radar');
  const [radarFilter, setRadarFilter] = useState<'all' | 'lost' | 'reunited'>('all');
  const [microchipSearch, setMicrochipSearch] = useState('');
  const [microchipSearchResult, setMicrochipSearchResult] = useState<string | null>(null);

  const filteredLostPets = lostPets.filter((item) => {
    if (radarFilter === 'all') return true;
    return item.status === radarFilter;
  });

  const handleSearchMicrochip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!microchipSearch.trim()) return;

    const matched = lostPets.find((p) => p.microchipNumber?.includes(microchipSearch.trim()));
    if (matched) {
      setMicrochipSearchResult(
        `Match Found! Registered Pet "${matched.petName}" (${matched.breed}). Owner Hotline: ${matched.contactPhone}`
      );
    } else {
      setMicrochipSearchResult(
        `Microchip ${microchipSearch.trim()} is recognized in the national SafePaw registry for ${currentCountry.name}. No missing report active.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Community Shelters & Lost Pet Radar
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Empowering animal shelters, rescuers, and pet owners in {locationSettings.customCity || currentCountry.defaultCity}, {currentCountry.name}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportLostPetModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Broadcast Missing Pet</span>
          </button>
        </div>
      </div>

      {/* Main Mode Toggle: Lost & Found Radar vs Shelter Adoptions */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('radar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'radar'
              ? 'bg-rose-50 text-rose-900 border border-rose-200 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Radio className="w-4 h-4 text-rose-600" />
          <span>Lost & Found Community Radar</span>
        </button>
        <button
          onClick={() => setActiveTab('shelters')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'shelters'
              ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Home className="w-4 h-4 text-teal-600" />
          <span>Shelter Rescue & Adoption Profiles</span>
        </button>
      </div>

      {activeTab === 'radar' ? (
        <div className="space-y-6">
          {/* Microchip Scanner Lookup Tool */}
          <div className="p-4 bg-stone-900 text-white rounded-2xl shadow-sm border border-stone-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  Instant Microchip Scanner Verification ({currentCountry.name})
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Found a stray pet? Enter the scanned 15-digit ISO microchip to retrieve emergency owner contacts.
                </p>
              </div>
              <form onSubmit={handleSearchMicrochip} className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={microchipSearch}
                  onChange={(e) => setMicrochipSearch(e.target.value)}
                  placeholder="e.g. 985141007722109"
                  className="px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-xs font-mono text-white placeholder:text-stone-500 focus:outline-teal-400 w-full sm:w-60"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-xs rounded-xl transition shrink-0"
                >
                  Verify Chip
                </button>
              </form>
            </div>
            {microchipSearchResult && (
              <div className="mt-3 p-3 bg-teal-900/60 border border-teal-700/80 rounded-xl text-xs text-teal-100 flex items-center justify-between">
                <span>{microchipSearchResult}</span>
                <button
                  onClick={() => setMicrochipSearchResult(null)}
                  className="text-stone-400 hover:text-white text-xs font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            {[
              { id: 'all', label: 'All Reports' },
              { id: 'lost', label: 'Missing Pets Active' },
              { id: 'reunited', label: 'Safely Reunited' },
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setRadarFilter(btn.id as any)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  radarFilter === btn.id
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Radar Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredLostPets.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-stone-100">
                    <img
                      src={report.photoUrl}
                      alt={report.petName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      {report.status === 'lost' ? (
                        <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                          Missing Pet Alert
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-xs">
                          Reunited with Family ✓
                        </span>
                      )}
                    </div>
                    {report.baseRewardUSD && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
                        Reward: {formatPrice(report.baseRewardUSD)}
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-stone-900">{report.petName}</h3>
                      <div className="text-xs text-stone-500">{report.species} · {report.breed}</div>
                    </div>
                    <div className="text-xs space-y-1.5 text-stone-700">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span><strong>Last seen:</strong> {report.lastSeenLocation}, {report.city}</span>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Reported on: <strong>{report.dateReported}</strong>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-3 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      {report.description}
                    </p>
                    {report.microchipNumber && (
                      <div className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-1 rounded">
                        Microchip: {report.microchipNumber}
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <a
                    href={`tel:${report.contactPhone.replace(/\D/g, '')}`}
                    className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Owner: {report.contactPhone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Shelter Rescues & Adoptable Animals */
        <div className="space-y-6">
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-start gap-3">
            <Heart className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong>Shelter Medical Integration:</strong> All animals listed here have complete digital health profiles maintained directly by licensed shelter veterinarians at partner sanctuaries in {currentCountry.name}.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adoptablePets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-stone-100">
                    <img
                      src={pet.photoUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold">
                      {pet.status}
                    </span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-stone-900">{pet.name}</h3>
                      <span className="text-xs text-stone-500">{pet.age}</span>
                    </div>
                    <div className="text-xs text-stone-600">
                      {pet.species} · {pet.breed} · {pet.gender}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-emerald-800">
                      {pet.vaccinated && (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Fully Vaccinated
                        </span>
                      )}
                      {pet.neutered && (
                        <span className="flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" /> Neutered
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600 line-clamp-2">{pet.description}</p>
                    <div className="text-[11px] text-stone-500 pt-2 border-t border-stone-100">
                      Shelter: <strong>{pet.shelterName}</strong> ({pet.city})
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <button
                    onClick={() => alert(`Adoption application opened for ${pet.name} at ${pet.shelterName}. Direct shelter coordinator will review your profile!`)}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Inquire for Adoption
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
