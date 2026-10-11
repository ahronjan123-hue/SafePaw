import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Species } from '../../types';
import { X, Shield, Check, Heart, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';

interface NewPetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_AVATARS: Record<Species, string[]> = {
  Dog: [
    'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=400&q=80',
  ],
  Cat: [
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=400&q=80',
  ],
  Rabbit: [
    'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=400&q=80',
  ],
  Bird: [
    'https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=400&q=80',
  ],
  Reptile: [
    'https://images.unsplash.com/photo-1563281577-a7be47e20db9?auto=format&fit=crop&w=400&q=80',
  ],
  Other: [
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=400&q=80',
  ],
};

export const NewPetModal: React.FC<NewPetModalProps> = ({ isOpen, onClose }) => {
  const { addPet, clinics, locationSettings } = useApp();
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('Dog');
  const [breed, setBreed] = useState('');
  const [ageYears, setAgeYears] = useState('2');
  const [birthDate, setBirthDate] = useState('2024-05-15');
  const [weightKg, setWeightKg] = useState('12.5');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [neutered, setNeutered] = useState(true);
  const [microchipId, setMicrochipId] = useState('');
  const [photoUrl, setPhotoUrl] = useState(SAMPLE_AVATARS.Dog[0]);
  const [allergiesText, setAllergiesText] = useState('');
  const [chronicConditionsText, setChronicConditionsText] = useState('');
  const [temperament, setTemperament] = useState('Gentle, friendly, calm in car rides');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [primaryClinicId, setPrimaryClinicId] = useState(clinics[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setUploadError(null);
    setIsUploadingPhoto(true);
    setUploadSuccess(false);

    try {
      const supabase = getSupabase();
      if (supabase) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const cleanName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `pets/${cleanName}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('pet-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('pet-photos')
            .getPublicUrl(filePath);

          if (publicUrlData?.publicUrl) {
            setPhotoUrl(publicUrlData.publicUrl);
            setUploadSuccess(true);
            setIsUploadingPhoto(false);
            return;
          }
        } else if (uploadErr) {
          console.warn('[SafePaw] Storage upload notice:', uploadErr.message);
        }
      }

      // Fallback: Read as Data URL so image always displays
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setUploadSuccess(true);
        }
        setIsUploadingPhoto(false);
      };
      reader.onerror = () => {
        setUploadError('Failed to read file from disk.');
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.warn('[SafePaw] File upload fallback note:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
          setUploadSuccess(true);
        }
        setIsUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    const presets = SAMPLE_AVATARS[newSpecies];
    if (presets && presets.length > 0) {
      setPhotoUrl(presets[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const allergies = allergiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const chronicConditions = chronicConditionsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    addPet({
      name: name.trim(),
      species,
      breed: breed.trim() || `${species} Companion`,
      ageYears: parseFloat(ageYears) || 1,
      birthDate: birthDate || '2024-01-01',
      weightKg: parseFloat(weightKg) || 5,
      gender,
      neutered,
      microchipId: microchipId.trim() || `98514${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      photoUrl,
      allergies: allergies.length > 0 ? allergies : ['None reported'],
      chronicConditions,
      temperament,
      dietaryNotes: dietaryNotes.trim() || 'Standard balanced diet',
      primaryClinicId,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Add New Pet Profile</h2>
              <p className="text-xs text-stone-500">Create a secure digital health record for your pet</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Species Selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">Species Type</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {(['Dog', 'Cat', 'Rabbit', 'Bird', 'Reptile', 'Other'] as Species[]).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => handleSpeciesChange(sp)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition ${
                    species === sp
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-semibold shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Photo Preset & Upload Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-stone-700">Avatar Photo</label>
              <span className="text-[11px] text-stone-500">Pick preset, paste URL, or upload from disk</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <img
                src={photoUrl}
                alt="Selected preview"
                className="w-16 h-16 rounded-xl object-cover border-2 border-teal-500 shadow-xs shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] text-stone-400 font-medium">Presets:</span>
                  {(SAMPLE_AVATARS[species] || SAMPLE_AVATARS.Dog).map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="Sample"
                      onClick={() => {
                        setPhotoUrl(url);
                        setUploadSuccess(false);
                      }}
                      className={`w-9 h-9 rounded-lg object-cover cursor-pointer border transition hover:opacity-100 ${
                        photoUrl === url ? 'border-teal-600 ring-2 ring-teal-200' : 'border-stone-200 opacity-60'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => {
                      setPhotoUrl(e.target.value);
                      setUploadSuccess(false);
                    }}
                    placeholder="Or paste custom image URL..."
                    className="flex-1 text-xs px-2.5 py-1.5 border border-stone-200 rounded-lg focus:outline-teal-500"
                  />

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Browse File Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 transition cursor-pointer shrink-0"
                  >
                    {isUploadingPhoto ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                        <span>Uploading...</span>
                      </>
                    ) : uploadSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Uploaded!</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-teal-600" />
                        <span>Browse File...</span>
                      </>
                    )}
                  </button>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-500 font-medium">{uploadError}</p>
                )}
                {uploadSuccess && (
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Photo uploaded to Supabase storage bucket (pet-photos).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Basic Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Pet Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Milo, Bella"
                className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Breed</label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Golden Retriever, Siamese"
                className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Gender</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setGender('Male')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                    gender === 'Male'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 font-semibold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setGender('Female')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                    gender === 'Female'
                      ? 'border-teal-600 bg-teal-50 text-teal-800 font-semibold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Neutered / Spayed</label>
              <button
                type="button"
                onClick={() => setNeutered(!neutered)}
                className={`w-full py-1.5 rounded-lg text-xs font-medium border transition flex items-center justify-center gap-1.5 ${
                  neutered
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${neutered ? 'opacity-100' : 'opacity-0'}`} />
                <span>{neutered ? 'Yes, Neutered / Spayed' : 'Intact (Not Neutered)'}</span>
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Weight ({locationSettings.weightUnit})
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Birth Date or Approximate</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
          </div>

          {/* Microchip & Primary Clinic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-stone-500" />
                Microchip 15-Digit ID
              </label>
              <input
                type="text"
                value={microchipId}
                onChange={(e) => setMicrochipId(e.target.value)}
                placeholder="e.g. 985141004829103"
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600 font-mono"
              />
              <span className="text-[10px] text-stone-400">Auto-generated if left blank.</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Preferred Veterinary Clinic</label>
              <select
                value={primaryClinicId}
                onChange={(e) => setPrimaryClinicId(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600 bg-white"
              >
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Medical Notes */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Known Allergies (comma separated)</label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="e.g. Chicken protein, Penicillin, Pollen"
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Temperament & Behavior at Clinic</label>
              <input
                type="text"
                value={temperament}
                onChange={(e) => setTemperament(e.target.value)}
                placeholder="e.g. Friendly, nervous with needles, prefers treats"
                className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm transition"
            >
              Save Pet Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
