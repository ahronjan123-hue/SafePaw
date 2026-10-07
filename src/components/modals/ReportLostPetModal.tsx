import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Species } from '../../types';
import { X, AlertCircle, Radio, MapPin, Phone } from 'lucide-react';

interface ReportLostPetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportLostPetModal: React.FC<ReportLostPetModalProps> = ({ isOpen, onClose }) => {
  const { reportLostPet, selectedPet, currentCountry, locationSettings, formatPrice } = useApp();
  const [petName, setPetName] = useState(selectedPet?.name || '');
  const [species, setSpecies] = useState<Species>(selectedPet?.species || 'Dog');
  const [breed, setBreed] = useState(selectedPet?.breed || 'Golden Retriever');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [city, setCity] = useState(locationSettings.customCity || currentCountry.defaultCity);
  const [contactPhone, setContactPhone] = useState(currentCountry.emergencyHotline);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    selectedPet?.photoUrl ||
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80'
  );
  const [microchipNumber, setMicrochipNumber] = useState(selectedPet?.microchipId || '');
  const [rewardAmountUSD, setRewardAmountUSD] = useState<string>('200');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!petName.trim() || !lastSeenLocation.trim()) return;

    reportLostPet({
      petName: petName.trim(),
      species,
      breed: breed.trim(),
      lastSeenLocation: lastSeenLocation.trim(),
      city,
      countryCode: currentCountry.code,
      status: 'lost',
      contactPhone: contactPhone.trim(),
      description: description.trim() || 'Missing pet wearing collar. Please contact owner immediately.',
      photoUrl,
      microchipNumber: microchipNumber.trim() || undefined,
      baseRewardUSD: parseFloat(rewardAmountUSD) || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full max-h-[90vh] overflow-y-auto z-10">
        <div className="p-5 border-b border-rose-100 bg-rose-50/60 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Broadcast Lost Pet Alert</h2>
              <p className="text-xs text-rose-700">
                Notifies nearby veterinary clinics & shelters in {currentCountry.name}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              Once submitted, local animal clinics and shelter intake desks receive immediate broadcast with the microchip ID and photo for instant scanner matching.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Pet Name *</label>
              <input
                type="text"
                required
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Species</label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as Species)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600 bg-white"
              >
                {['Dog', 'Cat', 'Rabbit', 'Bird', 'Reptile', 'Other'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Microchip Number</label>
              <input
                type="text"
                value={microchipNumber}
                onChange={(e) => setMicrochipNumber(e.target.value)}
                placeholder="15-digit ISO microchip"
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Last Seen Location *
            </label>
            <input
              type="text"
              required
              value={lastSeenLocation}
              onChange={(e) => setLastSeenLocation(e.target.value)}
              placeholder="e.g. Oakridge Park near Riverwalk Gate"
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">City / Municipality</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-stone-500" />
                Contact Phone *
              </label>
              <input
                type="text"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Distinct Markings & Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Red collar with SafePaw tag, white tip on tail, answers to Cookie."
              className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Photo Image URL</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Optional Reward (Base USD / Local: {formatPrice(parseFloat(rewardAmountUSD) || 0)})
              </label>
              <input
                type="number"
                value={rewardAmountUSD}
                onChange={(e) => setRewardAmountUSD(e.target.value)}
                placeholder="200"
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-rose-600"
              />
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
              className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm"
            >
              Broadcast Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
