import React, { useState } from 'react';
import { ProviderServiceType, Appointment } from '../../types';
import {
  Calendar,
  Clock,
  CheckCircle,
  PlusCircle,
  Search,
  Filter,
  Activity,
  Scissors,
  Shield,
  Home,
  Check,
  ChevronRight,
  AlertTriangle,
  User,
  Phone,
} from 'lucide-react';

interface ProviderBookingsViewProps {
  providerType: ProviderServiceType;
  appointments: Appointment[];
  onShowToast: (msg: string) => void;
  formatPrice: (amountUSD: number) => string;
}

export const ProviderBookingsView: React.FC<ProviderBookingsViewProps> = ({
  providerType,
  appointments,
  onShowToast,
  formatPrice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'active' | 'completed'>('all');

  // Simulated Spa & Grooming Bookings state
  const [groomingBookings, setGroomingBookings] = useState([
    {
      id: 'gb-1',
      petName: 'Bella',
      breed: 'Shih Tzu',
      ownerName: 'Danica Tan',
      phone: '+63 917 882 1290',
      time: '09:30 AM',
      package: 'Full Spa & Asian Fusion Cut',
      stylist: 'Stylist Carlo',
      coatCondition: 'Moderate Matting / Sensitive Skin',
      priceUSD: 45,
      stage: 'In Bath',
    },
    {
      id: 'gb-2',
      petName: 'Milo',
      breed: 'Toy Poodle',
      ownerName: 'Paolo Reyes',
      phone: '+63 920 441 8932',
      time: '11:00 AM',
      package: 'De-shedding & Blueberry Facial Soak',
      stylist: 'Stylist Maricel',
      coatCondition: 'Dense Undercoat',
      priceUSD: 38,
      stage: 'Blow Drying',
    },
    {
      id: 'gb-3',
      petName: 'Kobe',
      breed: 'Pomeranian',
      ownerName: 'Erika Santos',
      phone: '+63 918 332 9901',
      time: '01:30 PM',
      package: 'Show Coat Styling & Nail Grinding',
      stylist: 'Master Stylist Arlene',
      coatCondition: 'Double Coat Grooming',
      priceUSD: 52,
      stage: 'Ready for Pickup',
    },
    {
      id: 'gb-4',
      petName: 'Chico',
      breed: 'Corgi',
      ownerName: 'Miguel Ramos',
      phone: '+63 922 771 4452',
      time: '03:00 PM',
      package: 'Bath & Tidy + Sanitary Trim',
      stylist: 'Stylist Carlo',
      coatCondition: 'Normal / Healthy',
      priceUSD: 32,
      stage: 'Scheduled',
    },
    {
      id: 'gb-5',
      petName: 'Princess',
      breed: 'Persian Cat',
      ownerName: 'Valerie Lim',
      phone: '+63 919 555 1289',
      time: '04:30 PM',
      package: 'Cat Lion Cut & Degreasing Spa',
      stylist: 'Specialist Arlene',
      coatCondition: 'High Matted Belly',
      priceUSD: 55,
      stage: 'Scheduled',
    },
  ]);

  // Simulated Shelter & Rescue Visit Bookings
  const [shelterVisits, setShelterVisits] = useState([
    {
      id: 'sv-1',
      type: 'Adoption Meet & Greet',
      applicant: 'Joshua Ramos',
      petName: 'Bramble (Aspin mix, 1.5 yrs)',
      time: '10:00 AM',
      coordinator: 'Shelter Lead Bea',
      status: 'Confirmed',
      notes: 'Family with 1 existing golden retriever coming to test compatibility in open yard.',
    },
    {
      id: 'sv-2',
      type: 'Foster Handover',
      applicant: 'Dr. Sofia Alcantara',
      petName: 'Cooper (Post-Op Trauma Puspin)',
      time: '11:30 AM',
      coordinator: 'Vet Nurse Mark',
      status: 'Paperwork Ready',
      notes: 'Handover of oral pain management medications & 2-week follow-up appointment.',
    },
    {
      id: 'sv-3',
      type: 'Rescue Intake Inspection',
      applicant: 'Barangay Kagawad Elena',
      petName: '4 Abandoned Kittens (Cubao Rescue)',
      time: '01:00 PM',
      coordinator: 'Dr. Santos',
      status: 'Awaiting Arrival',
      notes: 'Initial deworming, maternal formula weaning check & isolation nursery bed assignment.',
    },
    {
      id: 'sv-4',
      type: 'Volunteer Orientation',
      applicant: 'UST Animal Welfare Guild (6 pax)',
      petName: 'Kennel & Socialization Run',
      time: '02:30 PM',
      coordinator: 'Volunteer Head Carlo',
      status: 'Scheduled',
      notes: 'Weekend dog-walking protocols and cattery sanitation briefing.',
    },
  ]);

  // Advance grooming stage
  const handleAdvanceGroomingStage = (id: string) => {
    const stageOrder = ['Scheduled', 'In Bath', 'Blow Drying', 'Scissors Styling', 'Ready for Pickup', 'Completed'];
    setGroomingBookings((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const currentIdx = stageOrder.indexOf(g.stage);
        const nextStage = currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : 'Completed';
        onShowToast(`${g.petName}'s session progressed to "${nextStage}"!`);
        return { ...g, stage: nextStage };
      })
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-teal-400" />
            <span>
              {providerType === 'veterinary_clinic' && 'Clinical Consultations & Procedure Schedule'}
              {providerType === 'grooming_salon' && 'Spa & Grooming Session Appointments'}
              {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Shelter Visits, Intakes & Adoption Meetups'}
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            {providerType === 'veterinary_clinic' && 'Manage outpatient visits, diagnostics, pre-op checks and surgical room allocations.'}
            {providerType === 'grooming_salon' && 'Track styling bay throughput, groomer capacity, and live pet progress stages.'}
            {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Coordinate scheduled adoption interviews, surrender intakes, and volunteer runs.'}
          </p>
        </div>

        <button
          onClick={() => onShowToast('New booking intake form opened')}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>
            {providerType === 'veterinary_clinic' && 'Book Clinical Patient'}
            {providerType === 'grooming_salon' && 'Book Spa Grooming'}
            {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Schedule Intake / Meetup'}
          </span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-950 p-3 rounded-2xl border border-stone-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by pet, guardian, or package..."
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder-stone-500 text-xs focus:outline-hidden focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {(['all', 'scheduled', 'active', 'completed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === filter
                  ? 'bg-teal-500 text-stone-950'
                  : 'bg-stone-900 text-stone-400 hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. VETERINARY CLINIC BOOKINGS LIST */}
      {/* ========================================================= */}
      {providerType === 'veterinary_clinic' && (
        <div className="space-y-3">
          {appointments.length === 0 ? (
            <div className="p-8 text-center bg-stone-950 rounded-3xl border border-stone-800 text-stone-400 text-xs">
              No appointments scheduled for this filter.
            </div>
          ) : (
            appointments.map((apt) => (
              <div
                key={apt.id}
                className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-mono">{apt.time}</span>
                    <span className="text-[9px] text-stone-400">{apt.date}</span>
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white truncate">
                        {apt.petName}
                      </span>
                      <span className="text-stone-500">·</span>
                      <span className="text-xs text-stone-300 font-medium truncate">
                        {apt.serviceName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                      <span>Owner: <strong className="text-stone-200">{apt.ownerName || 'Verified Guardian'}</strong></span>
                      <span>·</span>
                      <span>Vet: <strong className="text-teal-400">{apt.vetName || 'Dr. Attending'}</strong></span>
                      <span>·</span>
                      <span>Fee: <strong className="text-stone-200">{formatPrice(apt.baseCostUSD)}</strong></span>
                    </div>

                    {apt.symptoms && (
                      <div className="text-[11px] text-amber-300/90 font-medium">
                        Chief Complaint: {apt.symptoms}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    apt.status === 'checked_in' || apt.status === 'in_consultation'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : apt.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-stone-800 text-stone-300'
                  }`}>
                    {apt.status.replace('_', ' ')}
                  </span>

                  <button
                    onClick={() => onShowToast(`Consultation EMR chart opened for ${apt.petName}`)}
                    className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500 hover:text-stone-950 text-teal-400 text-xs font-bold transition border border-teal-500/20 cursor-pointer"
                  >
                    Open Chart
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SPA & GROOMING SALON BOOKINGS LIST */}
      {/* ========================================================= */}
      {providerType === 'grooming_salon' && (
        <div className="space-y-3">
          {groomingBookings.map((b) => (
            <div
              key={b.id}
              className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold flex flex-col items-center justify-center shrink-0">
                  <Scissors className="w-5 h-5" />
                  <span className="text-[9px] text-stone-400 mt-0.5">{b.time}</span>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      {b.petName}
                    </span>
                    <span className="text-[11px] text-stone-400">({b.breed})</span>
                    <span className="text-stone-600">·</span>
                    <span className="text-xs text-teal-300 font-bold">
                      {b.package}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                    <span>Parent: <strong className="text-stone-200">{b.ownerName}</strong> ({b.phone})</span>
                    <span>·</span>
                    <span>Stylist: <strong className="text-amber-300">{b.stylist}</strong></span>
                    <span>·</span>
                    <span>Fee: <strong className="text-stone-200">{formatPrice(b.priceUSD)}</strong></span>
                  </div>

                  <div className="text-[11px] text-stone-400">
                    Coat Alert: <span className="text-stone-300 font-medium">{b.coatCondition}</span>
                  </div>
                </div>
              </div>

              {/* Progress Stage & Controls */}
              <div className="flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0">
                <div className="text-right">
                  <div className="text-[10px] text-stone-400 uppercase font-mono tracking-wider">Current Stage</div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-0.5 ${
                    b.stage === 'Ready for Pickup'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                      : b.stage === 'Completed'
                      ? 'bg-stone-800 text-stone-400'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}>
                    {b.stage}
                  </span>
                </div>

                <button
                  onClick={() => handleAdvanceGroomingStage(b.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  Advance Stage →
                </button>

                {b.stage === 'Ready for Pickup' && (
                  <button
                    onClick={() => onShowToast(`Ready for pickup SMS notification sent to ${b.ownerName}`)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Send Pickup SMS
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SHELTER & RESCUE VISITS & INTAKE LIST */}
      {/* ========================================================= */}
      {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && (
        <div className="space-y-3">
          {shelterVisits.map((v) => (
            <div
              key={v.id}
              className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 hover:border-teal-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold flex flex-col items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                  <span className="text-[9px] text-stone-400 mt-0.5">{v.time}</span>
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-teal-400 font-bold">
                      {v.type}
                    </span>
                    <span className="text-sm font-bold text-white truncate">
                      {v.applicant}
                    </span>
                  </div>

                  <div className="text-xs text-stone-300 font-medium">
                    Target Pet: <strong className="text-white">{v.petName}</strong> · Coordinator: <span className="text-stone-400">{v.coordinator}</span>
                  </div>

                  <div className="text-[11px] text-stone-400">
                    {v.notes}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300">
                  {v.status}
                </span>

                <button
                  onClick={() => onShowToast(`Visit protocol checklist opened for ${v.applicant}`)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-stone-950 text-xs font-bold transition cursor-pointer"
                >
                  Conduct Session
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
