import React from 'react';
import { ProviderServiceType } from '../../types';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Scissors,
  Home,
  Shield,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface ProviderReportsViewProps {
  providerType: ProviderServiceType;
  onShowToast: (msg: string) => void;
  formatPrice: (amountUSD: number) => string;
}

export const ProviderReportsView: React.FC<ProviderReportsViewProps> = ({
  providerType,
  onShowToast,
  formatPrice,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <span>
              {providerType === 'veterinary_clinic' && 'Clinical Operational & Financial Performance'}
              {providerType === 'grooming_salon' && 'Salon Revenue, Stylist Productivity & Service Mix'}
              {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Rescue Inflow, Adoption Rates & Welfare Funding'}
            </span>
          </h2>
          <p className="text-xs text-stone-400 mt-0.5">
            Real-time monthly summaries, service volume breakdowns, and patient retention analytics.
          </p>
        </div>

        <button
          onClick={() => onShowToast('Executive monthly audit report exported as PDF')}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <Download className="w-4 h-4 text-teal-400" />
          <span>Export Monthly Statement</span>
        </button>
      </div>

      {/* Top 3 Analytical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {providerType === 'veterinary_clinic' && (
          <>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Monthly Clinical Revenue</div>
              <div className="text-3xl font-extrabold text-white">{formatPrice(8450)}</div>
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last month
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Consultations & Surgeries</div>
              <div className="text-3xl font-extrabold text-white">186 procedures</div>
              <div className="text-xs text-teal-300">Average ticket: {formatPrice(45.4)}</div>
            </div>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Patient Revisit Rate</div>
              <div className="text-3xl font-extrabold text-white">88.4%</div>
              <div className="text-xs text-emerald-400">Vaccine booster compliance: 94%</div>
            </div>
          </>
        )}

        {providerType === 'grooming_salon' && (
          <>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Monthly Salon Revenue</div>
              <div className="text-3xl font-extrabold text-white">{formatPrice(6200)}</div>
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> +8.6% vs last month
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Completed Grooming Sessions</div>
              <div className="text-3xl font-extrabold text-white">142 pets styled</div>
              <div className="text-xs text-teal-300">Average service fee: {formatPrice(43.6)}</div>
            </div>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Client Retention Interval</div>
              <div className="text-3xl font-extrabold text-white">2.8 weeks</div>
              <div className="text-xs text-emerald-400">76% rebooked next appointment on pickup</div>
            </div>
          </>
        )}

        {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && (
          <>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Community & Grant Subsidies</div>
              <div className="text-3xl font-extrabold text-white">{formatPrice(4100)}</div>
              <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> 100% allocated to veterinary trauma
              </div>
            </div>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Successful Rehomings This Month</div>
              <div className="text-3xl font-extrabold text-white">28 Animals</div>
              <div className="text-xs text-teal-300">Average shelter stay: 22 days</div>
            </div>
            <div className="p-5 rounded-3xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="text-xs text-stone-400 font-bold uppercase">Live Rescue Inflow</div>
              <div className="text-3xl font-extrabold text-white">34 Rescues</div>
              <div className="text-xs text-emerald-400">Zero-euthanasia rate maintained (100%)</div>
            </div>
          </>
        )}
      </div>

      {/* Detailed Service / Category Distribution Breakdown */}
      <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-white">
          {providerType === 'veterinary_clinic' && 'Clinical Service Distribution & Utilization'}
          {providerType === 'grooming_salon' && 'Popular Package Breakdown & Stylist Allocations'}
          {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && 'Intake Source & Adoption Channel Distribution'}
        </h3>

        {providerType === 'veterinary_clinic' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">General Consultation & Routine Wellness Exams</span>
                <strong className="text-white">42% (78 cases)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Emergency Trauma & Inpatient Critical Care</span>
                <strong className="text-white">25% (46 cases)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400 rounded-full" style={{ width: '25%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Soft Tissue & Orthopedic Surgery</span>
                <strong className="text-white">18% (34 cases)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Core Vaccinations & Parasite Prevention</span>
                <strong className="text-white">15% (28 cases)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        )}

        {providerType === 'grooming_salon' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Full Spa Package (Bath, Blowdry, Haircut, Sanitary & Nails)</span>
                <strong className="text-white">54% (77 sessions)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: '54%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Medicated Flea & Oatmeal Skin Treatment Baths</span>
                <strong className="text-white">26% (37 sessions)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '26%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">De-shedding Furminator & Double Coat Treatment</span>
                <strong className="text-white">20% (28 sessions)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>
        )}

        {(providerType === 'rescue_shelter' || providerType === 'animal_shelter') && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Permanent Adoptions to Screened Family Homes</span>
                <strong className="text-white">62% (28 pets)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Foster Placements for Neonatal & Medical Rehab</span>
                <strong className="text-white">24% (11 pets)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300">Currently in Quarantine / Sanctuary Care</span>
                <strong className="text-white">14% (6 pets)</strong>
              </div>
              <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: '14%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
