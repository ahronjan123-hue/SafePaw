import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Bell,
  X,
  CheckCheck,
  Calendar,
  Syringe,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Globe,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
    sendSimulatedPushNotification,
    setCurrentTab,
    selectedPet,
    currentCountry,
  } = useApp();

  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  if (!isOpen) return null;

  const requestBrowserPermission = async () => {
    if (typeof Notification !== 'undefined') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification('SafePaw Alerts Activated', {
            body: 'You will receive timely reminders for upcoming vet visits and vaccination boosters.',
          });
        }
      } catch (err) {
        console.error('Notification permission error', err);
      }
    }
  };

  const handleTriggerDemoPush = (scenario: 'vaccine' | 'appointment' | 'medication') => {
    const petName = selectedPet?.name || 'Mochi';
    if (scenario === 'vaccine') {
      sendSimulatedPushNotification(
        `Vaccine Reminder: ${petName}`,
        `Upcoming DHPP booster is recommended within the next 7 days in ${currentCountry.name}. Click to view passport schedule.`,
        'records'
      );
    } else if (scenario === 'appointment') {
      sendSimulatedPushNotification(
        `Appointment Reminder: Greenwood Hospital`,
        `Your visit for ${petName} is scheduled tomorrow at 10:30 AM. Tap to view real-time queue tracker.`,
        'tracker'
      );
    } else {
      sendSimulatedPushNotification(
        `Medication Alert: NexGard Spectra`,
        `Monthly preventive dose is due today for ${petName}. Marked in digital health ledger.`,
        'records'
      );
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4 text-teal-600" />;
      case 'vaccine':
        return <Syringe className="w-4 h-4 text-amber-600" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'emergency':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'sync':
        return <RefreshCw className="w-4 h-4 text-emerald-600" />;
      case 'location':
        return <Globe className="w-4 h-4 text-teal-600" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-stone-900">Notification Center</h2>
                <p className="text-xs text-stone-500">Upcoming visits, vaccines & reminders</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={markAllNotificationsAsRead}
                title="Mark all as read"
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-200 transition"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-stone-500 hover:text-stone-800 rounded-md hover:bg-stone-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Push Simulator Controls */}
          <div className="p-3 bg-stone-100 border-b border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Test Push Notification Triggers
              </span>
              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestBrowserPermission}
                  className="text-[10px] text-teal-700 hover:underline font-medium"
                >
                  Enable OS Push
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleTriggerDemoPush('vaccine')}
                className="px-2 py-1 bg-white hover:bg-amber-50 hover:text-amber-700 text-stone-700 border border-stone-200 rounded text-[11px] font-medium transition text-center"
              >
                + Vaccine Due
              </button>
              <button
                onClick={() => handleTriggerDemoPush('appointment')}
                className="px-2 py-1 bg-white hover:bg-teal-50 hover:text-teal-700 text-stone-700 border border-stone-200 rounded text-[11px] font-medium transition text-center"
              >
                + Visit Tomorrow
              </button>
              <button
                onClick={() => handleTriggerDemoPush('medication')}
                className="px-2 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 text-stone-700 border border-stone-200 rounded text-[11px] font-medium transition text-center"
              >
                + Med Refill
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-stone-400" />
                <p className="text-sm font-medium">All caught up!</p>
                <p className="text-xs text-stone-400 mt-1">No pending visits or overdue vaccination alerts.</p>
              </div>
            ) : (
              notifications.map((notif, index) => (
                <div
                  key={notif.id ? `${notif.id}-${index}` : `notif-${index}`}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.actionTab) {
                      setCurrentTab(notif.actionTab);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer relative group ${
                    notif.read
                      ? 'bg-white border-stone-200 text-stone-700'
                      : 'bg-teal-50/40 border-teal-200 shadow-xs text-stone-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-lg bg-stone-100 shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-5">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold truncate">{notif.title}</h4>
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">
                        {notif.description}
                      </p>
                      {notif.actionTab && (
                        <span className="inline-block mt-1.5 text-[10px] font-medium text-teal-700 underline underline-offset-2">
                          View details →
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Dismiss button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(notif.id);
                    }}
                    className="absolute top-2 right-2 text-stone-300 hover:text-stone-600 p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500">
            Push notifications sync securely across your devices.
          </div>
        </div>
      </div>
    </div>
  );
};
