import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_COUNTRIES } from '../data/countries';
import {
  Bell,
  Wifi,
  WifiOff,
  RefreshCw,
  Heart,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  Search,
  Shield,
  Menu,
  X,
  Radio,
  ChevronDown,
  Plus,
  Settings,
  Globe,
  Stethoscope,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenNewPetModal: () => void;
  onOpenSettings: () => void;
  onOpenVetPortal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenNewPetModal,
  onOpenSettings,
  onOpenVetPortal,
}) => {
  const {
    currentTab,
    setCurrentTab,
    pets,
    selectedPetId,
    setSelectedPetId,
    selectedPet,
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    syncQueue,
    isSyncing,
    notifications,
    currentCountry,
    locationSettings,
    setCountryByCode,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [petDropdownOpen, setPetDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Heart },
    { id: 'clinics', label: 'Clinics & Care', icon: Search },
    { id: 'book', label: 'Book Visit', icon: Calendar },
    { id: 'tracker', label: 'Live Tracker', icon: Clock },
    { id: 'records', label: 'Health Records', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'shelters', label: 'Shelters & Lost Radar', icon: Radio },
    { id: 'pets', label: 'My Pets', icon: Shield },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Utility & Connectivity Bar */}
      <div className="bg-stone-900 text-stone-200 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Country Flag & Region indicator */}
          <div className="relative">
            <button
              onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 transition font-medium text-[11px]"
              title="Change Country & Currency"
            >
              <span>{currentCountry.flag}</span>
              <span>{currentCountry.name}</span>
              <span className="text-teal-400 font-mono font-semibold">({currentCountry.currencyCode})</span>
              {locationSettings.isManualOverride && (
                <span className="text-[9px] bg-teal-900 text-teal-300 px-1 rounded uppercase font-semibold">
                  Manual
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {/* Quick Country Switcher Dropdown */}
            {countryDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 bg-white text-stone-800 rounded-xl shadow-xl border border-stone-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-600 border-b border-stone-100 flex items-center justify-between">
                  <span>Switch Country & Currency</span>
                  <button
                    onClick={() => {
                      setCountryDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="text-teal-700 hover:underline capitalize"
                  >
                    All Settings
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCountryByCode(c.code);
                        setCountryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left hover:bg-stone-50 transition ${
                        c.code === currentCountry.code ? 'bg-teal-50 font-bold text-teal-900' : 'text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </div>
                      <span className="font-mono text-[11px] text-teal-800">{c.currencyCode}</span>
                    </button>
                  ))}
                </div>
                <div className="p-1 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setCountryDropdownOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full text-center text-xs py-1 text-teal-700 hover:bg-teal-50 rounded font-semibold"
                  >
                    Open Full Location Settings...
                  </button>
                </div>
              </div>
            )}
          </div>

          <span className="hidden md:inline text-stone-500">·</span>
          <span className="hidden md:inline text-stone-400 text-[11px]">
            Emergency Hotline: <strong className="text-stone-100 font-mono">{currentCountry.emergencyHotline}</strong>
          </span>
        </div>

        {/* Offline & Synchronization Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Online</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 font-medium text-[11px]">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Mode</span>
                {syncQueue.length > 0 && (
                  <span className="bg-amber-500/30 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                    {syncQueue.length} queued
                  </span>
                )}
              </span>
            )}
          </div>

          <button
            onClick={toggleSimulatedOffline}
            title={isSimulatedOffline ? 'Switch to Online Mode' : 'Test Offline Mode'}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
          >
            {isSyncing ? (
              <RefreshCw className="w-3 h-3 animate-spin text-teal-400" />
            ) : isSimulatedOffline ? (
              'Connect Online'
            ) : (
              'Simulate Offline'
            )}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm shadow-teal-700/20 group-hover:bg-teal-700 transition">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 10.5c1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5 1.12 2.5 2.5 2.5zm-5-2c1.38 0 2.5-1.12 2.5-2.5S8.38 3.5 7 3.5 4.5 4.62 4.5 6s1.12 2.5 2.5 2.5zm10 0c1.38 0 2.5-1.12 2.5-2.5S18.38 3.5 17 3.5 14.5 4.62 14.5 6s1.12 2.5 2.5 2.5zm-1.8 4.2c-.7-.5-1.6-.7-2.7-.7s-2 .2-2.7.7c-2.4 1.7-4.8 5-2.8 7.3 1.2 1.4 3.4 1.5 5.5 1.5s4.3-.1 5.5-1.5c2-2.3-.4-5.6-2.8-7.3z"/>
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-stone-900 group-hover:text-teal-700 transition">
                  SafePaw<span className="text-teal-600">.</span>
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Pet Switcher, Settings & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pet Switcher dropdown */}
            <div className="relative">
              <button
                onClick={() => setPetDropdownOpen(!petDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg text-left transition"
              >
                {selectedPet?.photoUrl ? (
                  <img
                    src={selectedPet.photoUrl}
                    alt={selectedPet.name}
                    className="w-6 h-6 rounded-full object-cover border border-stone-200"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                    P
                  </div>
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-stone-900 leading-tight">
                    {selectedPet?.name || 'Select Pet'}
                  </div>
                  <div className="text-[10px] text-stone-500 leading-tight">
                    {selectedPet?.species}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {petDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-1.5 z-50">
                  <div className="px-3 py-1.5 border-b border-stone-100 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                    Your Registered Pets
                  </div>
                  {pets.map((pet) => (
                    <button
                      key={pet.id}
                      onClick={() => {
                        setSelectedPetId(pet.id);
                        setPetDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-50 transition ${
                        pet.id === selectedPetId ? 'bg-teal-50/60 font-semibold text-teal-900' : 'text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={pet.photoUrl}
                          alt={pet.name}
                          className="w-7 h-7 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <div className="text-xs">{pet.name}</div>
                          <div className="text-[10px] text-stone-500 font-normal">
                            {pet.breed} · {pet.ageYears}y
                          </div>
                        </div>
                      </div>
                      {pet.id === selectedPetId && (
                        <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-stone-100 mt-1 pt-1 px-1">
                    <button
                      onClick={() => {
                        setPetDropdownOpen(false);
                        onOpenNewPetModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-teal-700 hover:bg-teal-50 rounded-lg transition font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add New Pet Profile</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Vet Portal CTA Switcher */}
            <button
              onClick={onOpenVetPortal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-teal-300 border border-stone-800 rounded-lg text-xs font-bold transition shadow-xs"
              title="Enter Veterinarian Clinical Portal (EMR)"
            >
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>Vet Portal</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition relative"
              aria-label="Open Settings menu"
              title="Settings: Location override, currency & offline mode"
            >
              <Settings className="w-5 h-5" />
              {locationSettings.isManualOverride && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal-600"></span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-stone-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 mt-2 border-t border-stone-100 space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenVetPortal();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-teal-800 bg-teal-50 hover:bg-teal-100"
            >
              <Stethoscope className="w-5 h-5 text-teal-600" />
              <span>Veterinarian Portal (EMR)</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSettings();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              <Settings className="w-5 h-5 text-stone-500" />
              <span>Settings (Country, Currency & Offline)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
