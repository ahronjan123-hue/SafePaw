import React, { useState } from 'react';
import { ProviderServiceType } from '../../types';
import {
  Settings,
  Building,
  Clock,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Save,
  CheckCircle,
  Shield,
  Activity,
  Scissors,
  Home,
} from 'lucide-react';

interface ProviderSettingsViewProps {
  providerType: ProviderServiceType;
  businessName: string;
  onShowToast: (msg: string) => void;
  formatPrice: (amountUSD: number) => string;
}

export const ProviderSettingsView: React.FC<ProviderSettingsViewProps> = ({
  providerType,
  businessName: initialBusinessName,
  onShowToast,
  formatPrice,
}) => {
  const [facilityName, setFacilityName] = useState(initialBusinessName);
  const [phone, setPhone] = useState(
    providerType === 'veterinary_clinic' ? '(02) 8531-1581' : providerType === 'grooming_salon' ? '+63 917 889 0012' : '+63 918 223 9011'
  );
  const [address, setAddress] = useState(
    providerType === 'veterinary_clinic'
      ? '63 Maysilo Circle, Plainview, Mandaluyong City, Metro Manila'
      : providerType === 'grooming_salon'
      ? 'Level 2, Bonifacio High Street, BGC, Taguig City'
      : 'Barangay Loyola Heights, Quezon City, Metro Manila'
  );
  const [hours, setHours] = useState('Mon - Sun: 08:00 AM - 08:00 PM (24/7 Trauma Service)');
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);

  // Editable service catalog
  const [services, setServices] = useState(
    providerType === 'veterinary_clinic'
      ? [
          { name: 'Comprehensive Health & Wellness Examination', priceUSD: 25, active: true },
          { name: 'Core DHPPi + Rabies Vaccination & Passport Seal', priceUSD: 30, active: true },
          { name: 'Emergency Trauma Triage & Resuscitation', priceUSD: 65, active: true },
          { name: 'Routine Spay / Neuter Surgical Procedure', priceUSD: 90, active: true },
          { name: 'Digital Radiography (2-View X-Ray Series)', priceUSD: 45, active: true },
        ]
      : providerType === 'grooming_salon'
      ? [
          { name: 'Full Luxury Spa Grooming (Haircut, Bath, Nails)', priceUSD: 45, active: true },
          { name: 'Medicated Flea, Tick & Oatmeal Skin Treatment Bath', priceUSD: 35, active: true },
          { name: 'Furminator De-shedding & Undercoat Blast', priceUSD: 38, active: true },
          { name: 'Hygienic Sanitary Trim & Paw Pad Shave', priceUSD: 20, active: true },
          { name: 'Teeth Brushing & Refreshing Breath Foam', priceUSD: 12, active: true },
        ]
      : [
          { name: 'Adoption Processing, Microchipping & Health Certificate', priceUSD: 35, active: true },
          { name: 'Emergency Stray Rescue & Ambulance Dispatch', priceUSD: 0, active: true },
          { name: 'Post-Adoption Rabies Booster & Wellness Review', priceUSD: 15, active: true },
          { name: 'Foster Starter Kit (Formula, Carrier & Blankets)', priceUSD: 0, active: true },
        ]
  );

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Provider facility configuration successfully updated in Supabase');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-stone-800 pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-400" />
          <span>
            {providerType === 'veterinary_clinic' && 'Veterinary Clinic Facility Profile & Service Catalog'}
            {providerType === 'grooming_salon' && 'Spa & Grooming Salon Settings & Operating Hours'}
            {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Rescue Organization Profile & Adoption Fee Structure'}
          </span>
        </h2>
        <p className="text-xs text-stone-400 mt-0.5">
          Configure public directory listing, operating schedule, emergency hotline, and bookable service prices.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Basic Facility Information */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-400" />
            <span>Facility Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-stone-400 mb-1 font-semibold">Business / Facility Name:</label>
              <input
                type="text"
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-semibold">Contact Phone / Hotline:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-400 mb-1 font-semibold">Physical Location / Address:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-400 mb-1 font-semibold">Operating Hours & Coverage:</label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-stone-900">
            <div>
              <div className="text-xs font-bold text-white">24/7 Emergency Triage & Hotline Available</div>
              <div className="text-[11px] text-stone-400">Accept urgent trauma calls and emergency patient arrivals after regular hours</div>
            </div>
            <button
              type="button"
              onClick={() => setEmergencyAvailable(!emergencyAvailable)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                emergencyAvailable ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}
            >
              {emergencyAvailable ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Services & Pricing Catalog */}
        <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-teal-400" />
              <span>Service Catalog & Base Pricing</span>
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">Rates synced with client bookings</span>
          </div>

          <div className="space-y-3">
            {services.map((svc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0" />
                  <span className="font-medium text-white truncate">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-stone-200 font-bold">{formatPrice(svc.priceUSD)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...services];
                      updated[idx].active = !updated[idx].active;
                      setServices(updated);
                      onShowToast(`Updated availability for "${svc.name}"`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                      svc.active ? 'bg-teal-500/20 text-teal-300' : 'bg-stone-800 text-stone-500'
                    }`}
                  >
                    {svc.active ? 'Offered' : 'Paused'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Provider Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
