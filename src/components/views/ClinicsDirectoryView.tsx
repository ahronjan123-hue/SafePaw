import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Clinic, ProviderType } from '../../types';
import {
  Search,
  MapPin,
  Clock,
  Star,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  X,
  Globe,
  Shield,
} from 'lucide-react';

export const ClinicsDirectoryView: React.FC = () => {
  const {
    clinics,
    setCurrentTab,
    setPreselectedClinicId,
    startOrGetConversationWithClinic,
    selectedPet,
    formatPrice,
    currentCountry,
    locationSettings,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ProviderType | 'all'>('all');
  const [onlyEmergency, setOnlyEmergency] = useState(false);
  const [activeModalClinic, setActiveModalClinic] = useState<Clinic | null>(null);

  const filteredClinics = useMemo(() => {
    return clinics.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.services.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = selectedType === 'all' || c.type === selectedType;
      const matchesEmergency = !onlyEmergency || c.emergencyAvailable;
      return matchesSearch && matchesType && matchesEmergency;
    });
  }, [clinics, searchQuery, selectedType, onlyEmergency]);

  const handleBookClinic = (clinicId: string) => {
    setPreselectedClinicId(clinicId);
    setCurrentTab('book');
  };

  const handleMessageClinic = (clinicId: string) => {
    if (selectedPet) {
      startOrGetConversationWithClinic(clinicId, selectedPet.id);
      setCurrentTab('messages');
    }
  };

  // Convert km distance to miles if needed
  const displayDistance = (distKm: number): string => {
    if (locationSettings.distanceUnit === 'mi') {
      const distMi = (distKm * 0.621371).toFixed(1);
      return `${distMi} mi away`;
    }
    return `${distKm} km away`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Verified Veterinary Clinics & Care Providers
            </h1>
            <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold flex items-center gap-1">
              <Globe className="w-3 h-3 text-teal-600" />
              {currentCountry.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse and compare accredited animal hospitals, 24/7 trauma centers, mobile groomers, and rescue shelters in {locationSettings.customCity || currentCountry.defaultCity}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyEmergency(!onlyEmergency)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              onlyEmergency
                ? 'bg-rose-50 border-rose-300 text-rose-800 ring-2 ring-rose-200'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>24/7 Emergency Only</span>
          </button>
        </div>
      </div>

      {/* Search & Provider Type Filters */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search clinics by name, service (e.g. Ultrasound, Spay, Booster) in ${locationSettings.customCity || currentCountry.defaultCity}...`}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-stone-200 rounded-xl focus:outline-teal-600 placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Providers' },
            { id: 'clinic', label: 'Veterinary Clinics' },
            { id: 'hospital_247', label: '24/7 Hospitals' },
            { id: 'groomer', label: 'Spa & Grooming' },
            { id: 'shelter', label: 'Shelters & Rescue' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                selectedType === tab.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredClinics.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
            <Search className="w-10 h-10 mx-auto text-stone-400 mb-2" />
            <p className="text-sm font-semibold">No veterinary clinics match your criteria</p>
            <p className="text-xs text-stone-400 mt-1">Try resetting your filters or search query.</p>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Image Cover & Badges */}
                <div className="relative h-44 w-full bg-stone-100">
                  <img
                    src={clinic.image}
                    alt={clinic.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-stone-900/60 to-transparent"></div>
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    {clinic.verified && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold backdrop-blur-xs">
                        <CheckCircle className="w-3 h-3" />
                        SafePaw Verified
                      </span>
                    )}
                    {clinic.emergencyAvailable && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-semibold backdrop-blur-xs">
                        24/7 Emergency
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base font-bold leading-tight">{clinic.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-stone-200 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        {clinic.address}, {locationSettings.customCity || currentCountry.defaultCity} ({displayDistance(clinic.distanceKm)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-4">
                  {/* Rating & Operating Hours */}
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-1.5 text-stone-900 font-semibold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      <span>{clinic.rating}</span>
                      <span className="text-stone-400 font-normal">({clinic.reviewsCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate max-w-[180px]">{clinic.hours}</span>
                    </div>
                  </div>

                  {/* About snippet */}
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {clinic.about}
                  </p>

                  {/* Services preview with localized currency */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                      Popular Services & Fees ({currentCountry.currencyCode})
                    </span>
                    <div className="space-y-1.5">
                      {clinic.services.slice(0, 3).map((srv) => (
                        <div
                          key={srv.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-stone-50"
                        >
                          <span className="text-stone-700 truncate">{srv.name}</span>
                          <span className="font-semibold text-teal-900 shrink-0 pl-2">
                            {formatPrice(srv.basePriceUSD)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attending Veterinarians Preview */}
                  {clinic.veterinarians.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                        Practitioners on Duty
                      </span>
                      <div className="flex items-center gap-2">
                        {clinic.veterinarians.map((vet) => (
                          <div key={vet.id} className="flex items-center gap-2 bg-stone-50 px-2 py-1 rounded-lg">
                            <img
                              src={vet.avatar}
                              alt={vet.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div className="text-[11px]">
                              <span className="font-semibold text-stone-800 block leading-tight">{vet.name}</span>
                              <span className="text-[9px] text-stone-400 leading-tight">{vet.specialization}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-5 pt-0 grid grid-cols-3 gap-2">
                <button
                  onClick={() => setActiveModalClinic(clinic)}
                  className="py-2 px-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-medium transition text-center"
                >
                  Full Menu
                </button>
                <button
                  onClick={() => handleMessageClinic(clinic.id)}
                  className="py-2 px-2.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/70 text-teal-900 text-xs font-semibold transition text-center flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-teal-700" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => handleBookClinic(clinic.id)}
                  className="py-2 px-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition text-center flex items-center justify-center gap-1 shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Visit</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Clinic Details Modal */}
      {activeModalClinic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={() => setActiveModalClinic(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-xl w-full max-h-[90vh] overflow-y-auto z-10">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-stone-900">{activeModalClinic.name}</h3>
              </div>
              <button
                onClick={() => setActiveModalClinic(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase text-stone-500 mb-1">Clinic Information</h4>
                <p className="text-xs text-stone-700 leading-relaxed">{activeModalClinic.about}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Location:</span>
                    <strong>{activeModalClinic.address}, {locationSettings.customCity || currentCountry.defaultCity}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Direct Hotline:</span>
                    <strong>{currentCountry.emergencyHotline}</strong>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">
                  Available Clinical Services & Rates ({currentCountry.currencyCode})
                </h4>
                <div className="space-y-2">
                  {activeModalClinic.services.map((srv) => (
                    <div
                      key={srv.id}
                      className="p-3 border border-stone-200 rounded-xl flex items-center justify-between gap-3 hover:border-teal-400 transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-900">{srv.name}</div>
                        <div className="text-[11px] text-stone-500 mt-0.5">{srv.description}</div>
                        <div className="text-[10px] text-teal-700 mt-1">Est. Duration: {srv.durationMinutes} minutes</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-stone-900">{formatPrice(srv.basePriceUSD)}</div>
                        <span className="text-[9px] text-stone-400">Guaranteed rate</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200 flex gap-3">
                <button
                  onClick={() => {
                    const cid = activeModalClinic.id;
                    setActiveModalClinic(null);
                    handleBookClinic(cid);
                  }}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-sm transition text-center"
                >
                  Book Appointment Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
