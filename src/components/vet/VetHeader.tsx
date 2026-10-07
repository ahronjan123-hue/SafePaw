import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Stethoscope,
  Calendar,
  Users,
  Clock,
  UserCheck,
  LogOut,
  Bell,
  Wifi,
  WifiOff,
  Menu,
  X,
  ChevronDown,
  Building,
  Activity,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

interface VetHeaderProps {
  onOpenConsultationModal: () => void;
  onOpenNotifications: () => void;
}

export const VetHeader: React.FC<VetHeaderProps> = ({
  onOpenConsultationModal,
  onOpenNotifications,
}) => {
  const {
    vetTab,
    setVetTab,
    activeVet,
    logoutVet,
    availableVets,
    loginAsVet,
    isOnline,
    toggleSimulatedOffline,
    notifications,
    currentCountry,
    formatPrice,
    getVetAppointments,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [vetDropdownOpen, setVetDropdownOpen] = useState(false);

  const pendingCount = getVetAppointments().filter((a) => a.status === 'scheduled' && a.date >= new Date().toISOString().split('T')[0]).length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Clinical Dashboard', icon: Activity },
    { id: 'appointments', label: 'Appointments & Queue', icon: Calendar, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'patients', label: 'Patient EMR Records', icon: Users },
    { id: 'availability', label: 'Schedule & Availability', icon: Clock },
    { id: 'profile', label: 'Doctor Profile', icon: UserCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-white border-b border-stone-800 shadow-md">
      {/* Top Clinical Accreditation Bar */}
      <div className="bg-stone-950 text-stone-400 text-xs px-4 py-1.5 flex items-center justify-between border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-teal-400 font-semibold text-[11px] tracking-wide">
            <Stethoscope className="w-3.5 h-3.5" />
            SafePaw Clinical Portal · Electronic Medical Records (EMR)
          </span>
          <span className="hidden md:inline text-stone-600">|</span>
          <span className="hidden md:inline text-stone-300 text-[11px] font-mono">
            {activeVet?.licenseNumber || 'PRC-VET-VERIFIED'}
          </span>
          <span className="hidden lg:inline text-stone-500 text-[11px]">
            · {activeVet?.clinicName}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Online/Offline Status */}
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">EMR Cloud Synced</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 text-[11px]">
                <WifiOff className="w-3 h-3" />
                <span>Offline Cache Active</span>
              </span>
            )}
            <button
              onClick={toggleSimulatedOffline}
              className="px-2 py-0.5 rounded text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition"
            >
              {isOnline ? 'Simulate Offline' : 'Go Online'}
            </button>
          </div>

          {/* Switch to Pet Owner Mode button */}
          <button
            onClick={logoutVet}
            className="flex items-center gap-1.5 text-stone-300 hover:text-white bg-teal-900/60 hover:bg-teal-800/80 px-2.5 py-0.5 rounded text-[11px] border border-teal-700/50 transition font-medium"
            title="Switch to Pet Owner Client Interface"
          >
            <LogOut className="w-3 h-3 text-teal-300" />
            <span>Switch to Pet Owner App</span>
          </button>
        </div>
      </div>

      {/* Main Vet Top Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinical Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVetTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-500 text-stone-950 flex items-center justify-center font-black shadow-sm group-hover:bg-teal-400 transition">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-white group-hover:text-teal-300 transition">
                    SafePaw <span className="text-teal-400">Clinical</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800 px-1.5 py-0.2 rounded font-mono font-bold">
                    VET EMR
                  </span>
                </div>
                <span className="block text-[10px] text-stone-400 truncate max-w-[200px] sm:max-w-none">
                  {activeVet?.clinicName}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = vetTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setVetTab(item.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors relative ${
                    isActive
                      ? 'bg-teal-950/80 text-teal-300 font-semibold border border-teal-800/80'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-teal-500 text-stone-950 font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Quick Chart button, Vet Switcher & Alerts */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Quick Consultation Chart CTA */}
            <button
              onClick={onOpenConsultationModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-stone-950 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Log Consultation</span>
            </button>

            {/* Vet Practitioner Switcher */}
            <div className="relative">
              <button
                onClick={() => setVetDropdownOpen(!vetDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-left transition"
              >
                <img
                  src={activeVet?.avatar}
                  alt={activeVet?.name}
                  className="w-7 h-7 rounded-full object-cover border border-teal-500"
                />
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-stone-100 leading-tight">
                    {activeVet?.name}
                  </div>
                  <div className="text-[10px] text-teal-400 leading-tight">
                    {activeVet?.specialization}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {vetDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl py-1.5 z-50 text-stone-200">
                  <div className="px-3 py-1.5 border-b border-stone-800 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                    Switch Attending Veterinarian
                  </div>
                  {availableVets.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => {
                        loginAsVet(v.id);
                        setVetDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-800 transition ${
                        v.id === activeVet?.id ? 'bg-teal-950 text-teal-300 font-semibold' : 'text-stone-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={v.avatar}
                          alt={v.name}
                          className="w-7 h-7 rounded-full object-cover border border-stone-700"
                        />
                        <div>
                          <div className="text-xs">{v.name}</div>
                          <div className="text-[10px] text-stone-400">{v.specialization}</div>
                        </div>
                      </div>
                      {v.id === activeVet?.id && <span className="w-2 h-2 rounded-full bg-teal-400"></span>}
                    </button>
                  ))}
                  <div className="border-t border-stone-800 mt-1 pt-1 px-1">
                    <button
                      onClick={() => {
                        setVetDropdownOpen(false);
                        logoutVet();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-stone-800 rounded-lg transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out to Pet Owner View</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-800 bg-stone-900 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          <button
            onClick={() => {
              onOpenConsultationModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 mb-2 bg-teal-500 text-stone-950 rounded-xl text-xs font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Log New Consultation Chart</span>
          </button>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = vetTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setVetTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive ? 'bg-teal-950 text-teal-300 font-semibold' : 'text-stone-300 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-teal-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs bg-teal-500 text-stone-950 font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-stone-800">
            <button
              onClick={logoutVet}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-stone-800"
            >
              <LogOut className="w-5 h-5" />
              <span>Return to Pet Owner Application</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
