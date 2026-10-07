import React from 'react';
import { useApp } from '../context/AppContext';
import { WifiOff, RefreshCw, CheckCircle, Database } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline, syncQueue, isSyncing, syncOfflineQueue, toggleSimulatedOffline } = useApp();

  if (isOnline && !isSyncing && syncQueue.length === 0) {
    return null;
  }

  return (
    <aside
      aria-label="Connectivity and sync status"
      className={`border-b transition-all duration-300 ${
        !isOnline
          ? 'bg-amber-50 border-amber-200 text-amber-950'
          : isSyncing
          ? 'bg-teal-50 border-teal-200 text-teal-950'
          : 'bg-emerald-50 border-emerald-200 text-emerald-950'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 py-2.5 sm:px-6 lg:px-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {!isOnline ? (
              <div className="p-1 rounded bg-amber-100 text-amber-800">
                <WifiOff className="w-4 h-4" />
              </div>
            ) : isSyncing ? (
              <div className="p-1 rounded bg-teal-100 text-teal-800 animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-1 rounded bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs font-semibold">
                {!isOnline
                  ? 'Offline Mode Active · Cached Records Available'
                  : isSyncing
                  ? 'Synchronizing local changes with SafePaw Cloud...'
                  : 'All changes synced successfully'}
              </div>
              <div className="text-[11px] text-stone-600">
                {!isOnline
                  ? 'You can view pet records, draft appointments, and manage passports without connection. All changes are stored safely in local storage.'
                  : isSyncing
                  ? `Updating ${syncQueue.length} queued item(s) to secure veterinary database.`
                  : 'Your digital health passports and appointments are current.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {syncQueue.length > 0 && !isOnline && (
              <span className="flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-amber-200/60 text-amber-900">
                <Database className="w-3 h-3" />
                {syncQueue.length} pending update{syncQueue.length > 1 ? 's' : ''}
              </span>
            )}

            {!isOnline ? (
              <button
                onClick={toggleSimulatedOffline}
                className="px-2.5 py-1 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-md shadow-xs transition"
              >
                Reconnect Online
              </button>
            ) : isSyncing ? (
              <span className="text-xs text-teal-800 font-medium flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Syncing...
              </span>
            ) : (
              syncQueue.length > 0 && (
                <button
                  onClick={syncOfflineQueue}
                  className="px-2.5 py-1 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-md transition"
                >
                  Sync Now
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
