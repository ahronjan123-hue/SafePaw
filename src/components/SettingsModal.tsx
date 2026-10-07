import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_COUNTRIES, getCountryByCode } from '../data/countries';
import {
  X,
  Globe,
  MapPin,
  DollarSign,
  Wifi,
  WifiOff,
  RefreshCw,
  Download,
  Trash2,
  Check,
  Shield,
  Phone,
  Sliders,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    locationSettings,
    currentCountry,
    updateLocationSettings,
    resetToDetectedLocation,
    formatPrice,
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    syncQueue,
    isSyncing,
    syncOfflineQueue,
    clearOfflineCache,
    exportOfflineBackup,
    pets,
    healthRecords,
    appointments,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'location' | 'offline' | 'preferences'>('location');
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    locationSettings.selectedCountryCode
  );
  const [isManualOverride, setIsManualOverride] = useState(
    locationSettings.isManualOverride
  );
  const [customCity, setCustomCity] = useState(
    locationSettings.customCity || currentCountry.defaultCity
  );
  const [customRegion, setCustomRegion] = useState(
    locationSettings.customRegion || currentCountry.defaultRegion
  );
  const [distanceUnit, setDistanceUnit] = useState(locationSettings.distanceUnit);
  const [weightUnit, setWeightUnit] = useState(locationSettings.weightUnit);
  const [currencyOverrideCode, setCurrencyOverrideCode] = useState(
    locationSettings.currencyOverrideCode || ''
  );
  const [autoSync, setAutoSync] = useState(locationSettings.autoSyncEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCountrySelect = (code: string) => {
    setSelectedCountryCode(code);
    const country = getCountryByCode(code);
    setCustomCity(country.defaultCity);
    setCustomRegion(country.defaultRegion);
    setDistanceUnit(country.distanceUnit);
    setWeightUnit(country.weightUnit);
  };

  const handleSaveSettings = () => {
    updateLocationSettings({
      isManualOverride,
      selectedCountryCode,
      customCity,
      customRegion,
      distanceUnit,
      weightUnit,
      currencyOverrideCode: currencyOverrideCode || undefined,
      autoSyncEnabled: autoSync,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleResetDetected = () => {
    resetToDetectedLocation();
    const detected = getCountryByCode(locationSettings.detectedCountryCode);
    setSelectedCountryCode(detected.code);
    setIsManualOverride(false);
    setCustomCity(detected.defaultCity);
    setCustomRegion(detected.defaultRegion);
    setDistanceUnit(detected.distanceUnit);
    setWeightUnit(detected.weightUnit);
    setCurrencyOverrideCode('');
  };

  // Preview price for standard visit ($45 USD)
  const sampleUSD = 45;
  const activePreviewCountry = getCountryByCode(
    isManualOverride ? selectedCountryCode : locationSettings.detectedCountryCode
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto z-10 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Application Settings</h2>
              <p className="text-xs text-stone-500">
                Country, currency localization, manual location override & offline storage
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

        {/* Tab Selection */}
        <div className="flex items-center gap-1 border-b border-stone-200 px-6 pt-3 bg-stone-50 text-xs">
          <button
            onClick={() => setActiveTab('location')}
            className={`pb-3 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Country & Location Override</span>
          </button>
          <button
            onClick={() => setActiveTab('offline')}
            className={`pb-3 px-3 font-semibold transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'offline'
                ? 'border-teal-600 text-teal-900'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Offline Mode & Local Storage</span>
            {syncQueue.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono">
                {syncQueue.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1">
          {activeTab === 'location' && (
            <div className="space-y-6">
              {/* Detected Location Status Card */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                      Auto-Detected Network Location
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">IP Geolocation</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="text-stone-700 font-medium">
                      {getCountryByCode(locationSettings.detectedCountryCode).flag}{' '}
                      {getCountryByCode(locationSettings.detectedCountryCode).name} ·{' '}
                      {locationSettings.detectedCity}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Default Currency:{' '}
                      <strong>
                        {getCountryByCode(locationSettings.detectedCountryCode).currencyCode} (
                        {getCountryByCode(locationSettings.detectedCountryCode).currencySymbol})
                      </strong>{' '}
                      · Units: <strong>Kilometers / Kg</strong>
                    </div>
                  </div>
                  {isManualOverride && (
                    <button
                      type="button"
                      onClick={handleResetDetected}
                      className="text-xs text-teal-700 font-semibold hover:underline self-start sm:self-auto"
                    >
                      Restore Auto-Detected
                    </button>
                  )}
                </div>
              </div>

              {/* Manual Override Toggle */}
              <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/40 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-stone-900">
                    Manually Override Detected Location
                  </div>
                  <div className="text-[11px] text-stone-600 mt-0.5">
                    Select a different country during travel or change currency and distance units manually.
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isManualOverride}
                    onChange={(e) => setIsManualOverride(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Country Selection Grid */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-600 tracking-wider mb-2">
                  Select Target Country & Currency
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {SUPPORTED_COUNTRIES.map((c) => {
                    const isSelected = selectedCountryCode === c.code;
                    return (
                      <div
                        key={c.code}
                        onClick={() => {
                          setIsManualOverride(true);
                          handleCountrySelect(c.code);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-200'
                            : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-2xl">{c.flag}</span>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-stone-900 truncate">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-stone-500">
                              {c.currencyCode} ({c.currencySymbol}) · {c.distanceUnit.toUpperCase()}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* City / Region Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500" />
                    City / Municipality
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="e.g. London, Berlin, Tokyo"
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    State / Province / Region
                  </label>
                  <input
                    type="text"
                    value={customRegion}
                    onChange={(e) => setCustomRegion(e.target.value)}
                    placeholder="e.g. Greater London, Bavaria, NCR"
                    className="w-full text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-teal-600"
                  />
                </div>
              </div>

              {/* Units & Currency Override */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Distance Unit
                  </label>
                  <select
                    value={distanceUnit}
                    onChange={(e) => setDistanceUnit(e.target.value as 'km' | 'mi')}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg bg-white"
                  >
                    <option value="km">Kilometers (km)</option>
                    <option value="mi">Miles (mi)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Weight Unit
                  </label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg bg-white"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="lbs">Pounds (lbs)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Currency Mode
                  </label>
                  <select
                    value={currencyOverrideCode}
                    onChange={(e) => setCurrencyOverrideCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-stone-200 rounded-lg bg-white"
                  >
                    <option value="">Sync with Country ({activePreviewCountry.currencyCode})</option>
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.currencyCode}>
                        {c.currencyCode} ({c.currencySymbol}) - {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Currency & Emergency Preview */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
                <div className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                  Localized Display Preview
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-stone-500">Standard Vet Exam Fee ($45 USD):</span>{' '}
                    <strong className="text-sm font-bold text-teal-900">
                      {formatPrice(sampleUSD)}
                    </strong>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-600">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span>
                      24/7 Hotline: <strong>{activePreviewCountry.emergencyHotline}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offline' && (
            <div className="space-y-5">
              {/* Connectivity Simulator */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isOnline ? (
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                        <Wifi className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                        <WifiOff className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-stone-900">
                        {isOnline ? 'Online Connection Active' : 'Offline Mode Active'}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {isOnline
                          ? 'Real-time cloud synchronization active.'
                          : 'Changes will be saved locally in your browser storage.'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleSimulatedOffline}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      isSimulatedOffline
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-stone-800 text-white border-stone-700'
                    }`}
                  >
                    {isSimulatedOffline ? 'Switch to Online' : 'Simulate Offline Mode'}
                  </button>
                </div>
              </div>

              {/* Local Storage Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                    Cached Pets
                  </span>
                  <strong className="text-base text-stone-900">{pets.length}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                    Health Records
                  </span>
                  <strong className="text-base text-stone-900">{healthRecords.length}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                    Appointments
                  </span>
                  <strong className="text-base text-stone-900">{appointments.length}</strong>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-stone-400 block text-[10px] uppercase font-semibold">
                    Queued Offline
                  </span>
                  <strong className="text-base text-amber-700">{syncQueue.length}</strong>
                </div>
              </div>

              {/* Sync Queue Manager */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-bold text-stone-900">
                      Offline Sync Queue ({syncQueue.length} items)
                    </span>
                  </div>
                  {syncQueue.length > 0 && (
                    <button
                      onClick={syncOfflineQueue}
                      disabled={isSyncing}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {isSyncing ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                      )}
                      <span>Sync Now</span>
                    </button>
                  )}
                </div>
                {syncQueue.length === 0 ? (
                  <p className="text-xs text-stone-500">
                    All local changes are fully synchronized with the SafePaw cloud database.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {syncQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 bg-white rounded-lg border border-stone-200 text-[11px] flex items-center justify-between"
                      >
                        <span className="font-mono text-stone-700 capitalize">
                          {item.type.replace('_', ' ')}
                        </span>
                        <span className="text-stone-400">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Export & Backup Tools */}
              <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={exportOfflineBackup}
                  className="flex-1 py-2 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4 text-stone-500" />
                  <span>Export Offline Pet Passport Vault (.JSON)</span>
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        'Clear local cache? This will reset all demo records to initial state.'
                      )
                    ) {
                      clearOfflineCache();
                      onClose();
                    }
                  }}
                  className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  <span>Reset Cache</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between sticky bottom-0">
          <div className="text-xs text-stone-500">
            Active Country: <strong>{activePreviewCountry.flag} {activePreviewCountry.name}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Preferences</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
