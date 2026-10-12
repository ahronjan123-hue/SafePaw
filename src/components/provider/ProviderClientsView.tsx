import React, { useState } from 'react';
import { ProviderServiceType } from '../../types';
import {
  Users,
  Search,
  Phone,
  Mail,
  Heart,
  PlusCircle,
  Shield,
  Star,
  CheckCircle,
  Calendar,
  MessageSquare,
  AlertCircle,
  Home,
} from 'lucide-react';

interface ProviderClientsViewProps {
  providerType: ProviderServiceType;
  onShowToast: (msg: string) => void;
  formatPrice: (amountUSD: number) => string;
}

export const ProviderClientsView: React.FC<ProviderClientsViewProps> = ({
  providerType,
  onShowToast,
  formatPrice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shelterTab, setShelterTab] = useState<'adopters' | 'fosters' | 'volunteers'>('adopters');

  // 1. Clinical Pet Owners
  const [clinicClients] = useState([
    {
      id: 'cc-1',
      name: 'Jan Ahron Apilado',
      email: 'janahrqn@gmail.com',
      phone: '(02) 8812-9901',
      address: 'Plainview, Mandaluyong City',
      pets: ['Jervan (Dog, Hybrid 12.5kg)'],
      lastVisit: 'Oct 11, 2026',
      balanceDueUSD: 0,
      vaccineStatus: 'Up to Date',
      vip: true,
    },
    {
      id: 'cc-2',
      name: 'Maria Lourdes Santos',
      email: 'ml.santos@gmail.com',
      phone: '+63 917 554 1120',
      address: 'BGC, Taguig City',
      pets: ['Rocky (Golden Retriever)', 'Mimi (Persian Cat)'],
      lastVisit: 'Oct 04, 2026',
      balanceDueUSD: 35,
      vaccineStatus: 'Rabies booster due in 10 days',
      vip: true,
    },
    {
      id: 'cc-3',
      name: 'Roberto Dela Cruz',
      email: 'robert.dc@yahoo.com',
      phone: '+63 920 331 8765',
      address: 'San Antonio, Pasig City',
      pets: ['Bantay (Aspin)'],
      lastVisit: 'Sep 28, 2026',
      balanceDueUSD: 0,
      vaccineStatus: 'Up to Date',
      vip: false,
    },
  ]);

  // 2. Spa & Grooming VIP Pet Parents
  const [groomingClients] = useState([
    {
      id: 'gc-1',
      name: 'Danica Tan',
      email: 'danica.tan@gmail.com',
      phone: '+63 917 882 1290',
      pets: ['Bella (Shih Tzu)'],
      frequency: 'Every 3 Weeks',
      favoriteStylist: 'Stylist Carlo',
      preferredCut: 'Asian Fusion Teddy Bear Trim',
      notes: 'Sensitive skin. Use hypoallergenic oatmeal shampoo only. Extra treat after nail trim.',
      visitsCount: 14,
      totalSpendUSD: 620,
    },
    {
      id: 'gc-2',
      name: 'Paolo Reyes',
      email: 'paolo.reyes@gmail.com',
      phone: '+63 920 441 8932',
      pets: ['Milo (Toy Poodle)'],
      frequency: 'Monthly',
      favoriteStylist: 'Stylist Maricel',
      preferredCut: 'Lamb Cut with Rounded Ears',
      notes: 'High energy in car, loves warm blueberry facial wash.',
      visitsCount: 9,
      totalSpendUSD: 395,
    },
    {
      id: 'gc-3',
      name: 'Erika Santos',
      email: 'erika.santos@outlook.com',
      phone: '+63 918 332 9901',
      pets: ['Kobe (Pomeranian)'],
      frequency: 'Every 2 Weeks',
      favoriteStylist: 'Master Stylist Arlene',
      preferredCut: 'Show Coat Blowout & Lion Collar',
      notes: 'No high-velocity dryer near face. Hand blow-dry only.',
      visitsCount: 22,
      totalSpendUSD: 1140,
    },
  ]);

  // 3. Shelters & Rescue Community Network
  const [adopters] = useState([
    {
      id: 'adp-1',
      name: 'Joshua Ramos',
      phone: '+63 917 440 2291',
      email: 'joshua.r@gmail.com',
      address: 'Greenwoods Executive Village, Pasig',
      targetPet: 'Bramble (Aspin mix)',
      housing: 'Own single-detached house, 8ft fenced yard',
      status: 'Home Visit Approved',
      pastExperience: 'Had golden retriever for 11 years (passed away of old age)',
    },
    {
      id: 'adp-2',
      name: 'Sgt. Mateo Cruz',
      phone: '+63 928 119 5543',
      email: 'mateo.cruz@afp.mil.ph',
      address: 'Calamba, Laguna',
      targetPet: 'Lucky (Aspin)',
      housing: 'Private farmstead with daily outdoor companion',
      status: 'Background Check Clear',
      pastExperience: 'Experienced with high-energy working dogs',
    },
  ]);

  const [fosters] = useState([
    {
      id: 'fst-1',
      name: 'Bea & Mark Gomez',
      phone: '+63 917 334 9912',
      email: 'gomez.family@gmail.com',
      currentPlacement: '3 Newborn Puspins (Bottle Feeding Phase)',
      weeksRemaining: 3,
      capacity: 'Neonatal Nursery (up to 4 kittens)',
      totalSaved: 19,
    },
    {
      id: 'fst-2',
      name: 'Dr. Sofia Alcantara',
      phone: '+63 922 881 4450',
      email: 'sofia.alcantara@vetmed.edu',
      currentPlacement: 'Cooper (Post-Op Femur Recovery)',
      weeksRemaining: 2,
      capacity: 'Medical Recovery & Ortho Isolation',
      totalSaved: 8,
    },
  ]);

  const [volunteers] = useState([
    {
      id: 'vol-1',
      name: 'Carlo Mendoza',
      phone: '+63 917 990 1234',
      role: 'Emergency Rescue Driver & Trauma Transport',
      hoursThisMonth: 38,
      status: 'On Standby',
      vehicle: '4x4 Rescue Van with Cages',
    },
    {
      id: 'vol-2',
      name: 'Elena Dalisay',
      phone: '+63 920 445 7781',
      role: 'Shelter Dog Socialization & Weekend Foster Coordinator',
      hoursThisMonth: 24,
      status: 'Active',
      vehicle: 'Sedan',
    },
  ]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" />
            <span>
              {providerType === 'veterinary_clinic' && 'Patient Guardians & Clinical Client Directory'}
              {providerType === 'grooming_salon' && 'Salon VIP Pet Parents & Styling Preferences'}
              {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Community Adoption, Foster & Volunteer Network'}
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {providerType === 'veterinary_clinic' && 'View client billing ledgers, registered pets, and automated vaccination notification history.'}
            {providerType === 'grooming_salon' && 'Personalized styling notes, coat condition history, and client rebooking intervals.'}
            {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Vetted adopters, certified neonatal foster homes, and active rescue field volunteers.'}
          </p>
        </div>

        <button
          onClick={() => onShowToast('New client registration profile opened')}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Contact</span>
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
            placeholder="Search clients by name, contact phone, or pet..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-stone-500 text-xs focus:outline-hidden focus:border-teal-500"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. VETERINARY CLINIC CLIENT DIRECTORY */}
      {/* ========================================================= */}
      {providerType === 'veterinary_clinic' && (
        <div className="space-y-3">
          {clinicClients.map((client) => (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{client.name}</span>
                  {client.vip && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      VIP Client
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    {client.phone}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-stone-500" />
                    {client.email}
                  </span>
                  <span>·</span>
                  <span>{client.address}</span>
                </div>

                <div className="pt-1 text-xs">
                  <span className="text-stone-400">Registered Pets: </span>
                  <strong className="text-teal-300">{client.pets.join(', ')}</strong>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-stone-400">
                  <span>Last Visit: <strong className="text-stone-200">{client.lastVisit}</strong></span>
                  <span>·</span>
                  <span>
                    Vaccination Status:{' '}
                    <strong className={client.vaccineStatus.includes('due') ? 'text-amber-400' : 'text-emerald-400'}>
                      {client.vaccineStatus}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>Balance Due: <strong className={client.balanceDueUSD > 0 ? 'text-rose-400' : 'text-stone-300'}>{formatPrice(client.balanceDueUSD)}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                <button
                  onClick={() => onShowToast(`Vaccine booster reminder SMS sent to ${client.name}`)}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-semibold transition cursor-pointer"
                >
                  Send Reminder
                </button>
                <button
                  onClick={() => onShowToast(`Complete medical records opened for ${client.name}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  View Passport
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SPA & GROOMING SALON CLIENT DIRECTORY */}
      {/* ========================================================= */}
      {providerType === 'grooming_salon' && (
        <div className="space-y-3">
          {groomingClients.map((client) => (
            <div
              key={client.id}
              className="p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">{client.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/20 text-teal-300">
                    {client.visitsCount} Salon Visits
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    Total: {formatPrice(client.totalSpendUSD)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-stone-500" />
                    {client.phone}
                  </span>
                  <span>·</span>
                  <span>Frequency: <strong className="text-stone-200">{client.frequency}</strong></span>
                  <span>·</span>
                  <span>Favorite Stylist: <strong className="text-amber-300">{client.favoriteStylist}</strong></span>
                </div>

                <div className="text-xs">
                  <span className="text-stone-400">Pets: </span>
                  <strong className="text-white">{client.pets.join(', ')}</strong>
                  <span className="text-stone-500"> — Style: </span>
                  <span className="text-teal-300 font-medium">{client.preferredCut}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
                  <strong>Stylist Care Note:</strong> {client.notes}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                <button
                  onClick={() => onShowToast(`Next spa session pre-booking sent to ${client.name}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Rebook Next Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SHELTER & RESCUE COMMUNITY NETWORK (Adopters / Fosters / Volunteers) */}
      {/* ========================================================= */}
      {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && (
        <div className="space-y-4">
          {/* Sub-tab pills */}
          <div className="flex items-center gap-2 border-b border-stone-800 pb-3 text-xs">
            <button
              onClick={() => setShelterTab('adopters')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                shelterTab === 'adopters' ? 'bg-teal-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              Approved Adopters ({adopters.length})
            </button>
            <button
              onClick={() => setShelterTab('fosters')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                shelterTab === 'fosters' ? 'bg-teal-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              Certified Foster Homes ({fosters.length})
            </button>
            <button
              onClick={() => setShelterTab('volunteers')}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                shelterTab === 'volunteers' ? 'bg-teal-500 text-stone-950' : 'text-stone-400 hover:text-white'
              }`}
            >
              Field Volunteers ({volunteers.length})
            </button>
          </div>

          {shelterTab === 'adopters' && (
            <div className="space-y-3">
              {adopters.map((adp) => (
                <div key={adp.id} className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{adp.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      {adp.status}
                    </span>
                  </div>
                  <div className="text-xs text-stone-400">
                    Applying for: <strong className="text-white">{adp.targetPet}</strong> · Phone: {adp.phone}
                  </div>
                  <div className="text-xs text-stone-300">
                    Housing: {adp.housing} · Experience: {adp.pastExperience}
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => onShowToast(`Final adoption contract generated for ${adp.name}`)}
                      className="px-3 py-1.5 rounded-xl bg-teal-500 text-stone-950 text-xs font-bold hover:bg-teal-400 cursor-pointer"
                    >
                      Issue Adoption Agreement
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {shelterTab === 'fosters' && (
            <div className="space-y-3">
              {fosters.map((fst) => (
                <div key={fst.id} className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{fst.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300">
                      {fst.totalSaved} Pets Successfully Rehomed
                    </span>
                  </div>
                  <div className="text-xs text-stone-300">
                    Currently Hosting: <strong className="text-amber-300">{fst.currentPlacement}</strong> ({fst.weeksRemaining} wks remaining)
                  </div>
                  <div className="text-[11px] text-stone-400">
                    Specialty & Capacity: {fst.capacity} · Phone: {fst.phone}
                  </div>
                </div>
              ))}
            </div>
          )}

          {shelterTab === 'volunteers' && (
            <div className="space-y-3">
              {volunteers.map((vol) => (
                <div key={vol.id} className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{vol.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-teal-300">
                      {vol.hoursThisMonth} Hours Contributed
                    </span>
                  </div>
                  <div className="text-xs text-teal-400 font-semibold">{vol.role}</div>
                  <div className="text-[11px] text-stone-400">Vehicle: {vol.vehicle} · Phone: {vol.phone}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
