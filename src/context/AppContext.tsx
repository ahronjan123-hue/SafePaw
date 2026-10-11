import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Pet,
  Clinic,
  Appointment,
  HealthRecord,
  Conversation,
  ChatMessage,
  NotificationItem,
  LostPetReport,
  AdoptablePet,
  OfflineSyncQueueItem,
  AppointmentStatus,
  CountryConfig,
  LocationSettings,
  UserRole,
  VetUserSession,
} from '../types';
import {
  INITIAL_PETS,
  INITIAL_CLINICS,
  INITIAL_APPOINTMENTS,
  INITIAL_HEALTH_RECORDS,
  INITIAL_CONVERSATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_LOST_PETS,
  INITIAL_ADOPTABLE_PETS,
  INITIAL_VETS,
} from '../data/initialData';
import {
  DEFAULT_COUNTRY,
  getCountryByCode,
  formatCurrencyAmount,
} from '../data/countries';
import { getSupabase } from '../lib/supabase';

interface AppContextType {
  // Role & Session
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeVet: VetUserSession | null;
  loginAsVet: (vetIdOrEmail: string) => boolean;
  loginCustomVet: (customProfile: VetUserSession) => void;
  logoutVet: () => void;
  availableVets: VetUserSession[];
  updateVetProfile: (updates: Partial<VetUserSession>) => void;
  vetTab: string;
  setVetTab: (tab: string) => void;

  // Pets
  pets: Pet[];
  selectedPetId: string;
  selectedPet: Pet | undefined;
  setSelectedPetId: (id: string) => void;
  addPet: (pet: Omit<Pet, 'id' | 'registeredDate'>) => void;
  updatePet: (id: string, updates: Partial<Pet>) => void;
  deletePet: (id: string) => void;
  getAuthorizedPatientsForVet: () => Pet[];

  // Clinics & Appointments
  clinics: Clinic[];
  appointments: Appointment[];
  getVetAppointments: () => Appointment[];
  bookAppointment: (apt: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'syncStatus'>) => { appointment?: Appointment; error?: string };
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  acceptAppointment: (id: string) => void;
  declineAppointment: (id: string, reason: string) => void;
  rescheduleAppointment: (id: string, newDate: string, newTime: string) => { success: boolean; error?: string };
  completeAppointment: (id: string, summary?: string) => void;
  cancelAppointment: (id: string) => void;

  // Health Records & EMR
  healthRecords: HealthRecord[];
  getPublicHealthRecordsForPet: (petId: string) => HealthRecord[];
  getAllHealthRecordsForVet: (petId: string) => HealthRecord[];
  addHealthRecord: (rec: Omit<HealthRecord, 'id' | 'syncStatus'>) => void;
  addClinicalConsultationNote: (data: {
    petId: string;
    appointmentId?: string;
    title: string;
    diagnosis: string;
    notes: string;
    vitals?: { weightKg?: number; tempC?: number; heartRateBpm?: number; respiratoryRateBpm?: number };
    prescriptions?: { medicineName: string; dosage: string; frequency: string; durationDays: number; instructions: string }[];
    vaccineAdministered?: { name: string; batchNumber: string; nextDueDate?: string };
    isPrivateVetNote?: boolean;
    privateVetNotes?: string;
    ownerDischargeInstructions?: string;
    markAppointmentComplete?: boolean;
  }) => void;

  // Conversations
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string, attachment?: { type: 'image' | 'record'; name: string }) => void;
  startOrGetConversationWithClinic: (clinicId: string, petId: string) => string;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  sendSimulatedPushNotification: (title: string, body: string, actionTab?: string) => void;

  // Lost Pets & Shelters
  lostPets: LostPetReport[];
  reportLostPet: (report: Omit<LostPetReport, 'id' | 'dateReported'>) => void;
  adoptablePets: AdoptablePet[];

  // Country, Location & Currency Localization
  locationSettings: LocationSettings;
  currentCountry: CountryConfig;
  formatPrice: (amountUSD: number) => string;
  updateLocationSettings: (updates: Partial<LocationSettings>) => void;
  resetToDetectedLocation: () => void;
  setCountryByCode: (code: string) => void;

  // Offline & Synchronization
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  syncQueue: OfflineSyncQueueItem[];
  isSyncing: boolean;
  syncOfflineQueue: () => void;
  clearOfflineCache: () => void;
  exportOfflineBackup: () => void;

  // Navigation
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  preselectedClinicId: string | null;
  setPreselectedClinicId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const generateId = (_prefix: string = 'id'): string => {
  return generateUUID();
};

export const deduplicateById = <T extends { id: string }>(items: T[]): T[] => {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (!item || !item.id) continue;
    if (seen.has(item.id)) {
      const uniqueItem = {
        ...item,
        id: generateId(item.id.split('-')[0] || 'item'),
      };
      seen.add(uniqueItem.id);
      result.push(uniqueItem);
    } else {
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
};

const STORAGE_KEYS = {
  ROLE: 'safepaw_role_v5_live',
  ACTIVE_VET: 'safepaw_active_vet_v5_live',
  PETS: 'safepaw_pets_v5_live',
  SELECTED_PET_ID: 'safepaw_selected_pet_v5_live',
  APPOINTMENTS: 'safepaw_appointments_v5_live',
  HEALTH_RECORDS: 'safepaw_records_v5_live',
  CONVERSATIONS: 'safepaw_conversations_v5_live',
  NOTIFICATIONS: 'safepaw_notifications_v5_live',
  LOST_PETS: 'safepaw_lost_pets_v5_live',
  OFFLINE_QUEUE: 'safepaw_offline_queue_v5_live',
  LOCATION_SETTINGS: 'safepaw_location_settings_v5_live',
};

// One-time purge of legacy demo cache
if (typeof window !== 'undefined') {
  try {
    const legacyKeys = [
      'safepaw_pets_v3',
      'safepaw_selected_pet_v3',
      'safepaw_appointments_v3',
      'safepaw_records_v3',
      'safepaw_conversations_v3',
      'safepaw_notifications_v3',
      'safepaw_lost_pets_v3',
      'safepaw_active_vet_v3',
    ];
    legacyKeys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

const DEFAULT_LOCATION_SETTINGS: LocationSettings = {
  detectedCountryCode: 'PH',
  detectedCity: 'Metro Manila',
  isManualOverride: false,
  selectedCountryCode: 'PH',
  customCity: 'Metro Manila',
  customRegion: 'NCR',
  distanceUnit: 'km',
  weightUnit: 'kg',
  autoSyncEnabled: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // User Role & Authentication
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    try {
      // Check if URL starts with /vet
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/vet')) {
        return 'veterinarian';
      }
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
      return (saved as UserRole) || 'pet_owner';
    } catch {
      return 'pet_owner';
    }
  });

  const [availableVets] = useState<VetUserSession[]>(INITIAL_VETS);

  const [activeVet, setActiveVet] = useState<VetUserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VET);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name?.includes('Elena Ramos') || parsed?.id === 'vet-1' || parsed?.id === 'vet-2') {
          localStorage.removeItem(STORAGE_KEYS.ACTIVE_VET);
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Navigation tabs
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [vetTab, setVetTab] = useState<string>('dashboard');
  const [preselectedClinicId, setPreselectedClinicId] = useState<string | null>(null);

  // Connectivity
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const isOnline = browserOnline && !isSimulatedOffline;

  // Location & Country Settings
  const [locationSettings, setLocationSettings] = useState<LocationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOCATION_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_LOCATION_SETTINGS;
    } catch {
      return DEFAULT_LOCATION_SETTINGS;
    }
  });

  // Derived current country config
  const currentCountry = useMemo(() => {
    const code = locationSettings.isManualOverride
      ? locationSettings.selectedCountryCode
      : locationSettings.detectedCountryCode;
    return getCountryByCode(code);
  }, [locationSettings]);

  // Price formatting helper
  const formatPrice = (amountUSD: number): string => {
    return formatCurrencyAmount(
      amountUSD,
      currentCountry,
      locationSettings.currencyOverrideCode
    );
  };

  // Pets state
  const [pets, setPets] = useState<Pet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PETS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_PETS;
    } catch {
      return INITIAL_PETS;
    }
  });

  const [selectedPetId, setSelectedPetId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_PET_ID);
      return saved || (INITIAL_PETS[0]?.id || '');
    } catch {
      return INITIAL_PETS[0]?.id || '';
    }
  });

  // Clinics
  const clinics = INITIAL_CLINICS;

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  // Health Records
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HEALTH_RECORDS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_HEALTH_RECORDS;
    } catch {
      return INITIAL_HEALTH_RECORDS;
    }
  });

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Lost Pets
  const [lostPets, setLostPets] = useState<LostPetReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOST_PETS);
      return saved ? deduplicateById(JSON.parse(saved)) : INITIAL_LOST_PETS;
    } catch {
      return INITIAL_LOST_PETS;
    }
  });

  const adoptablePets = INITIAL_ADOPTABLE_PETS;

  // Offline queue
  const [syncQueue, setSyncQueue] = useState<OfflineSyncQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return saved ? deduplicateById(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });

  // Local storage persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
    } catch {}
  }, [currentRole]);

  useEffect(() => {
    try {
      if (activeVet) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_VET, JSON.stringify(activeVet));
      }
    } catch {}
  }, [activeVet]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_SETTINGS, JSON.stringify(locationSettings));
    } catch {}
  }, [locationSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(pets));
    } catch {}
  }, [pets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_PET_ID, selectedPetId);
    } catch {}
  }, [selectedPetId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch {}
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HEALTH_RECORDS, JSON.stringify(healthRecords));
    } catch {}
  }, [healthRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOST_PETS, JSON.stringify(lostPets));
    } catch {}
  }, [lostPets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(syncQueue));
    } catch {}
  }, [syncQueue]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto sync when coming back online
  useEffect(() => {
    if (isOnline && syncQueue.length > 0 && !isSyncing && locationSettings.autoSyncEnabled) {
      syncOfflineQueue();
    }
  }, [isOnline, syncQueue.length, locationSettings.autoSyncEnabled]);

  // Load data from Supabase when available and online
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase || !isOnline) return;

    let isMounted = true;

    const loadSupabaseData = async () => {
      try {
        // 1. Fetch pets from Supabase
        const { data: dbPets, error: petsErr } = await supabase.from('pets').select('*');
        if (!petsErr && dbPets && dbPets.length > 0 && isMounted) {
          const mappedPets: Pet[] = dbPets.map((p: any) => ({
            id: p.id,
            name: p.name,
            species: p.species,
            breed: p.breed,
            ageYears: Number(p.age_years) || 1,
            birthDate: p.birth_date || '',
            weightKg: Number(p.weight_kg) || 5,
            gender: p.gender || 'Male',
            neutered: Boolean(p.neutered),
            microchipId: p.microchip_id || '',
            photoUrl: p.photo_url || '',
            allergies: Array.isArray(p.allergies) ? p.allergies : [],
            chronicConditions: Array.isArray(p.chronic_conditions) ? p.chronic_conditions : [],
            temperament: p.temperament || '',
            dietaryNotes: p.dietary_notes || '',
            primaryClinicId: p.primary_clinic_id,
            ownerName: p.owner_name,
            ownerPhone: p.owner_phone,
            ownerEmail: p.owner_email,
            registeredDate: p.registered_date || new Date().toISOString().split('T')[0],
          }));
          setPets(mappedPets);
        } else if (!petsErr && dbPets && dbPets.length === 0) {
          // Supabase pets table is empty - seed initial demo pets to Supabase
          try {
            for (const pet of INITIAL_PETS) {
              await supabase.from('pets').upsert({
                id: pet.id,
                name: pet.name,
                species: pet.species,
                breed: pet.breed,
                age_years: pet.ageYears,
                birth_date: pet.birthDate || null,
                weight_kg: pet.weightKg,
                gender: pet.gender,
                neutered: pet.neutered,
                microchip_id: pet.microchipId || null,
                photo_url: pet.photoUrl || null,
                allergies: pet.allergies,
                chronic_conditions: pet.chronicConditions,
                temperament: pet.temperament || null,
                dietary_notes: pet.dietaryNotes || null,
                owner_name: pet.ownerName || 'Verified Pet Parent',
                owner_phone: pet.ownerPhone || '(02) 8812-9901',
                registered_date: pet.registeredDate || new Date().toISOString().split('T')[0],
                primary_clinic_id: pet.primaryClinicId || null,
              });
            }
          } catch (seedErr) {
            console.warn('[SafePaw] Notice seeding initial pets to Supabase:', seedErr);
          }
        }

        // 2. Fetch appointments from Supabase
        const { data: dbAppointments, error: apptErr } = await supabase.from('appointments').select('*');
        if (!apptErr && dbAppointments && dbAppointments.length > 0 && isMounted) {
          const mappedAppts: Appointment[] = dbAppointments.map((a: any) => ({
            id: a.id,
            petId: a.pet_id,
            petName: a.pet_name,
            clinicId: a.clinic_id,
            clinicName: a.clinic_name,
            clinicAddress: a.clinic_address,
            vetId: a.vet_id,
            vetName: a.vet_name,
            serviceId: a.service_id,
            serviceName: a.service_name,
            date: a.date,
            time: a.time,
            isTelehealth: Boolean(a.is_telehealth),
            status: a.status as AppointmentStatus,
            queuePosition: a.queue_position,
            estimatedWaitMins: a.estimated_wait_mins,
            symptoms: a.symptoms || '',
            notes: a.notes || '',
            baseCostUSD: Number(a.base_cost_usd) || 0,
            paymentStatus: a.payment_status || 'pay_at_clinic',
            createdAt: a.created_at || new Date().toISOString(),
            ownerName: a.owner_name,
            ownerPhone: a.owner_phone,
            rejectionReason: a.rejection_reason,
            completedAt: a.completed_at,
            clinicalSummary: a.clinical_summary,
            syncStatus: 'synced',
          }));
          setAppointments(mappedAppts);
        }

        // 3. Fetch health records from Supabase
        const { data: dbRecords, error: recErr } = await supabase.from('health_records').select('*');
        if (!recErr && dbRecords && dbRecords.length > 0 && isMounted) {
          const mappedRecords: HealthRecord[] = dbRecords.map((r: any) => ({
            id: r.id,
            petId: r.pet_id,
            type: r.type,
            title: r.title,
            date: r.date,
            nextDueDate: r.next_due_date,
            veterinarian: r.veterinarian,
            vetLicenseNumber: r.vet_license_number,
            clinicName: r.clinic_name,
            notes: r.notes,
            status: r.status,
            batchNumber: r.batch_number,
            attachmentName: r.attachment_name,
            createdByVetId: r.created_by_vet_id,
            vitals: r.vitals,
            prescriptions: r.prescriptions,
            vaccineAdministered: r.vaccine_administered,
            isPrivateVetNote: r.is_private_vet_note,
            privateVetNotes: r.private_vet_notes,
            ownerDischargeInstructions: r.owner_discharge_instructions,
            syncStatus: 'synced',
          }));
          setHealthRecords(mappedRecords);
        }

        // 4. Fetch lost pets from Supabase
        const { data: dbLostPets, error: lostErr } = await supabase.from('lost_pets').select('*');
        if (!lostErr && dbLostPets && dbLostPets.length > 0 && isMounted) {
          const mappedLost: LostPetReport[] = dbLostPets.map((l: any) => ({
            id: l.id,
            petName: l.pet_name,
            species: l.species,
            breed: l.breed,
            photoUrl: l.photo_url || '',
            lastSeenLocation: l.last_seen_location || '',
            city: l.city || 'Metro Manila',
            countryCode: l.country_code || 'PH',
            lastSeenDate: l.last_seen_date,
            contactPhone: l.contact_phone,
            contactEmail: l.contact_email,
            microchipNumber: l.microchip_number,
            baseRewardUSD: Number(l.base_reward_usd) || 0,
            status: l.status,
            description: l.description,
            reportedBy: l.reported_by,
            dateReported: l.date_reported,
          }));
          setLostPets(mappedLost);
        }

        // 5. Fetch conversations and chat messages from Supabase
        const { data: dbConversations, error: convErr } = await supabase.from('conversations').select('*');
        const { data: dbMessages } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true });

        if (!convErr && dbConversations && dbConversations.length > 0 && isMounted) {
          const mappedConvs: Conversation[] = dbConversations.map((c: any) => {
            const clinic = clinics.find((cl) => cl.id === c.clinic_id) || clinics[0];
            const pet = pets.find((p) => p.id === c.pet_id);
            const convMsgs = (dbMessages || [])
              .filter((m: any) => m.conversation_id === c.id)
              .map((m: any) => ({
                id: m.id,
                sender: (m.sender || m.sender_type || 'user') as 'clinic' | 'user',
                text: m.text || m.message_text || '',
                timestamp: m.timestamp || (m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'),
                attachment: m.attachment || undefined,
              }));

            return {
              id: c.id,
              clinicId: c.clinic_id,
              clinicName: c.clinic_name || clinic?.name || 'Veterinary Hospital',
              clinicAvatar: c.clinic_avatar || clinic?.image || '',
              petId: c.pet_id,
              petName: c.pet_name || pet?.name || 'General Inquiry',
              lastMessage: c.last_message || (convMsgs[convMsgs.length - 1]?.text || 'Direct communication channel opened.'),
              lastTimestamp: c.last_timestamp || 'Just now',
              unreadCount: Number(c.unread_count) || 0,
              messages: convMsgs,
            };
          });
          setConversations(mappedConvs);
        } else if (!convErr && dbConversations && dbConversations.length === 0) {
          // Supabase conversations table is empty - seed initial conversation and messages
          try {
            for (const conv of INITIAL_CONVERSATIONS) {
              await supabase.from('conversations').upsert({
                id: conv.id,
                clinic_id: conv.clinicId,
                clinic_name: conv.clinicName,
                clinic_avatar: conv.clinicAvatar,
                pet_id: conv.petId,
                pet_name: conv.petName,
                last_message: conv.lastMessage,
                last_timestamp: new Date().toISOString(),
                unread_count: 0,
              });
              for (const msg of conv.messages) {
                await supabase.from('chat_messages').upsert({
                  id: msg.id,
                  conversation_id: conv.id,
                  sender: msg.sender,
                  sender_type: msg.sender,
                  sender_name: msg.sender === 'clinic' ? conv.clinicName : 'Pet Parent',
                  text: msg.text,
                  message_text: msg.text,
                  timestamp: msg.timestamp,
                  is_read: true,
                  attachment: msg.attachment || null,
                  created_at: new Date().toISOString(),
                });
              }
            }
          } catch (seedConvErr) {
            console.warn('[SafePaw] Notice seeding conversations to Supabase:', seedConvErr);
          }
        }
      } catch (err) {
        console.warn('[SafePaw] Error loading data from Supabase:', err);
      }
    };

    loadSupabaseData();

    // Real-time listener for incoming messages
    const channel = supabase
      .channel('realtime_chat_messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload: any) => {
          if (!isMounted || !payload?.new) return;
          const newRow = payload.new;
          const newMsgItem: ChatMessage = {
            id: newRow.id,
            sender: (newRow.sender_type || 'user') as 'clinic' | 'user',
            text: newRow.message_text || '',
            timestamp: newRow.created_at ? new Date(newRow.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
            attachment: newRow.attachment || undefined,
          };
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === newRow.conversation_id) {
                if (c.messages.some((m) => m.id === newRow.id)) return c;
                return {
                  ...c,
                  lastMessage: newRow.message_text,
                  lastTimestamp: 'Just now',
                  messages: [...c.messages, newMsgItem],
                };
              }
              return c;
            })
          );
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  const syncOfflineQueue = () => {
    if (syncQueue.length === 0) return;
    setIsSyncing(true);

    setTimeout(() => {
      setAppointments((prev) =>
        prev.map((a) => (a.syncStatus === 'pending_sync' ? { ...a, syncStatus: 'synced' } : a))
      );
      setHealthRecords((prev) =>
        prev.map((r) => (r.syncStatus === 'pending_sync' ? { ...r, syncStatus: 'synced' } : r))
      );

      const itemsSyncedCount = syncQueue.length;
      setSyncQueue([]);
      setIsSyncing(false);

      const newNotif: NotificationItem = {
        id: `notif-sync-${Date.now()}`,
        type: 'sync',
        title: 'Offline Sync Completed',
        description: `Successfully synchronized ${itemsSyncedCount} offline record${itemsSyncedCount > 1 ? 's' : ''} with SafePaw Cloud.`,
        timestamp: 'Just now',
        read: false,
        badge: 'Sync',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }, 1200);
  };

  // Veterinarian Authentication & Role Handling
  const loginAsVet = (vetIdOrEmail: string): boolean => {
    const found = availableVets.find(
      (v) => v.id === vetIdOrEmail || v.email.toLowerCase() === vetIdOrEmail.toLowerCase()
    );
    if (found) {
      if (activeVet?.id === found.id && currentRole === 'veterinarian') {
        return true;
      }
      setActiveVet(found);
      setCurrentRole('veterinarian');
      setVetTab('dashboard');
      return true;
    }
    return false;
  };

  const loginCustomVet = (customProfile: VetUserSession) => {
    if (activeVet?.id === customProfile.id && currentRole === 'veterinarian') {
      return;
    }
    setActiveVet(customProfile);
    setCurrentRole('veterinarian');
    setVetTab('dashboard');
  };

  const logoutVet = () => {
    setCurrentRole('pet_owner');
    setCurrentTab('dashboard');
  };

  const updateVetProfile = (updates: Partial<VetUserSession>) => {
    if (!activeVet) return;
    const updated = { ...activeVet, ...updates };
    setActiveVet(updated);
  };

  // Scoped Data Access for Veterinarians
  const getVetAppointments = (): Appointment[] => {
    if (!activeVet) return appointments;
    // Returns appointments assigned to this vet OR to their clinic
    return appointments.filter(
      (a) => a.vetId === activeVet.id || a.clinicId === activeVet.clinicId
    );
  };

  const getAuthorizedPatientsForVet = (): Pet[] => {
    if (!activeVet) return pets;
    // Authorized patients are pets associated with this clinic or assigned appointments
    const relevantPetIds = new Set<string>();
    pets.forEach((p) => {
      if (p.primaryClinicId === activeVet.clinicId) {
        relevantPetIds.add(p.id);
      }
    });
    appointments.forEach((a) => {
      if (a.clinicId === activeVet.clinicId || a.vetId === activeVet.id) {
        relevantPetIds.add(a.petId);
      }
    });
    return pets.filter((p) => relevantPetIds.has(p.id));
  };

  // Security Scoped Records: Pet owners cannot see internal private vet notes
  const getPublicHealthRecordsForPet = (petId: string): HealthRecord[] => {
    return healthRecords
      .filter((r) => r.petId === petId && !r.isPrivateVetNote)
      .map((r) => {
        // Strip out private internal notes before delivering to pet owner
        const copy = { ...r };
        delete copy.privateVetNotes;
        return copy;
      });
  };

  const getAllHealthRecordsForVet = (petId: string): HealthRecord[] => {
    return healthRecords.filter((r) => r.petId === petId);
  };

  // Pet management
  const selectedPet = pets.find((p) => p.id === selectedPetId) || pets[0] || undefined;

  const addPet = (petData: Omit<Pet, 'id' | 'registeredDate'>) => {
    const newPet: Pet = {
      ...petData,
      id: generateId('pet'),
      registeredDate: new Date().toISOString().split('T')[0],
      ownerName: petData.ownerName || 'Verified Pet Parent',
      ownerPhone: petData.ownerPhone || '(02) 8812-9901',
    };
    setPets((prev) => deduplicateById([newPet, ...prev]));
    setSelectedPetId(newPet.id);

    const supabase = getSupabase();
    if (supabase && isOnline) {
      supabase.auth.getUser().then(({ data: authData }) => {
        const ownerId = authData.user?.id;
        const ownerEmail = authData.user?.email;
        const ownerName = authData.user?.user_metadata?.full_name || authData.user?.user_metadata?.name || newPet.ownerName || 'Verified Pet Parent';

        const speciesFormatted = (['Dog', 'Cat', 'Bird', 'Rabbit', 'Reptile'].find(
          (s) => s.toLowerCase() === newPet.species?.toLowerCase()
        ) || 'Other');

        const petRow: any = {
          id: newPet.id,
          name: newPet.name,
          species: speciesFormatted,
          breed: newPet.breed || 'Mixed Breed',
          age_years: Number(newPet.ageYears) || 1,
          birth_date: newPet.birthDate || null,
          weight_kg: Number(newPet.weightKg) || 5,
          gender: newPet.gender || 'Male',
          neutered: Boolean(newPet.neutered),
          microchip_id: newPet.microchipId || null,
          photo_url: newPet.photoUrl || null,
          allergies: Array.isArray(newPet.allergies) ? newPet.allergies : [],
          chronic_conditions: Array.isArray(newPet.chronicConditions) ? newPet.chronicConditions : [],
          temperament: newPet.temperament || null,
          dietary_notes: newPet.dietaryNotes || null,
          owner_name: ownerName,
          owner_phone: newPet.ownerPhone || '(02) 8812-9901',
          owner_email: ownerEmail || newPet.ownerEmail || null,
          registered_date: newPet.registeredDate || new Date().toISOString().split('T')[0],
          primary_clinic_id: newPet.primaryClinicId || null,
        };
        if (ownerId) petRow.owner_id = ownerId;

        supabase.from('pets').upsert(petRow).then(({ error }: any) => {
          if (error) {
            console.error('[SafePaw] Supabase pet insert error:', error.message);
          } else {
            console.log('[SafePaw] Pet successfully persisted in Supabase!');
          }
        });
      }).catch((err: unknown) => console.warn('[SafePaw] Supabase pet write note:', err));
    }

    if (!isOnline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: generateId('queue'),
          type: 'update_pet',
          payload: newPet,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const updatePet = (id: string, updates: Partial<Pet>) => {
    setPets((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));

    const supabase = getSupabase();
    if (supabase && isOnline) {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.weightKg !== undefined) dbUpdates.weight_kg = updates.weightKg;
      if (updates.ageYears !== undefined) dbUpdates.age_years = updates.ageYears;
      if (updates.dietaryNotes !== undefined) dbUpdates.dietary_notes = updates.dietaryNotes;
      if (updates.temperament !== undefined) dbUpdates.temperament = updates.temperament;
      if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
      if (updates.allergies !== undefined) dbUpdates.allergies = updates.allergies;
      if (updates.chronicConditions !== undefined) dbUpdates.chronic_conditions = updates.chronicConditions;
      dbUpdates.updated_at = new Date().toISOString();

      Promise.resolve(
        supabase
          .from('pets')
          .update(dbUpdates)
          .eq('id', id)
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase pet update note:', err));
    }

    if (!isOnline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: generateId('queue'),
          type: 'update_pet',
          payload: { id, updates },
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const deletePet = (id: string) => {
    setPets((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (selectedPetId === id && remaining.length > 0) {
        setSelectedPetId(remaining[0].id);
      }
      return remaining;
    });

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(supabase.from('pets').delete().eq('id', id))
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase pet delete note:', err));
    }
  };

  // Appointment Double Booking / Conflict Check
  const checkDoubleBooking = (
    vetId: string,
    clinicId: string,
    date: string,
    time: string,
    excludeAppointmentId?: string
  ): boolean => {
    return appointments.some((a) => {
      if (excludeAppointmentId && a.id === excludeAppointmentId) return false;
      if (a.status === 'cancelled') return false;
      const sameVet = a.vetId === vetId;
      const sameClinic = a.clinicId === clinicId;
      const sameTimeSlot = a.date === date && a.time === time;
      return (sameVet || sameClinic) && sameTimeSlot;
    });
  };

  // Booking appointments (Owner Initiated)
  const bookAppointment = (
    aptData: Omit<Appointment, 'id' | 'createdAt' | 'status' | 'syncStatus'>
  ): { appointment?: Appointment; error?: string } => {
    // Conflict check
    if (aptData.vetId) {
      const hasConflict = checkDoubleBooking(
        aptData.vetId,
        aptData.clinicId,
        aptData.date,
        aptData.time
      );
      if (hasConflict) {
        return {
          error: `Dr. ${aptData.vetName} already has a scheduled consultation at ${aptData.time} on ${aptData.date}. Please select another slot.`,
        };
      }
    }

    const newApt: Appointment = {
      ...aptData,
      id: generateId('apt'),
      status: 'scheduled',
      queuePosition: 2,
      estimatedWaitMins: 15,
      createdAt: new Date().toISOString(),
      syncStatus: isOnline ? 'synced' : 'pending_sync',
      ownerName: aptData.ownerName || 'Verified Pet Parent',
      ownerPhone: aptData.ownerPhone || '(02) 8812-9901',
    };
    setAppointments((prev) => deduplicateById([newApt, ...prev]));

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(
        supabase.auth.getUser().then(({ data: authData }) => {
          const ownerId = authData.user?.id;
          const apptRow: any = {
            id: newApt.id,
            pet_id: newApt.petId,
            clinic_id: newApt.clinicId,
            service_name: newApt.serviceName,
            appointment_date: newApt.date,
            appointment_time: newApt.time,
            is_telehealth: Boolean(newApt.isTelehealth),
            status: newApt.status,
            queue_position: newApt.queuePosition || 1,
            estimated_wait_mins: newApt.estimatedWaitMins || 15,
            symptoms: newApt.symptoms || '',
            notes: newApt.notes || '',
            base_cost_usd: Number(newApt.baseCostUSD) || 0,
            payment_status: newApt.paymentStatus || 'pay_at_clinic',
          };
          if (ownerId) apptRow.owner_id = ownerId;
          if (newApt.vetId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(newApt.vetId)) {
            apptRow.vet_id = newApt.vetId;
          }
          return supabase.from('appointments').upsert(apptRow);
        })
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase appt write note:', err));
    }

    if (!isOnline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: generateId('queue'),
          type: 'add_appointment',
          payload: newApt,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: 'Appointment Booked!',
      description: `Visit scheduled for ${newApt.petName} at ${newApt.clinicName} on ${newApt.date} at ${newApt.time}. Total: ${formatPrice(newApt.baseCostUSD)}.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'tracker',
      badge: 'New',
    };
    setNotifications((prev) => deduplicateById([notif, ...prev]));
    return { appointment: newApt };
  };

  // Veterinarian Appointment Actions
  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          return {
            ...apt,
            status,
            estimatedWaitMins:
              status === 'in_consultation' ? 5 : status === 'checked_in' ? 10 : 0,
            queuePosition: status === 'in_consultation' ? 1 : apt.queuePosition,
            completedAt: status === 'completed' ? new Date().toISOString() : apt.completedAt,
          };
        }
        return apt;
      })
    );

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(
        supabase
          .from('appointments')
          .update({ status })
          .eq('id', id)
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase status update error:', err));
    }
  };

  const acceptAppointment = (id: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'scheduled' } : a))
    );

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(
        supabase.from('appointments').update({ status: 'scheduled' }).eq('id', id)
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase accept error:', err));
    }

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `Visit Confirmed: ${apt.petName}`,
      description: `${apt.clinicName} has officially approved your visit slot for ${apt.date} at ${apt.time}.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'tracker',
      badge: 'Approved',
    };
    setNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const declineAppointment = (id: string, reason: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: 'cancelled', rejectionReason: reason } : a
      )
    );

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(
        supabase.from('appointments').update({ status: 'cancelled', rejection_reason: reason }).eq('id', id)
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase decline error:', err));
    }

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `Appointment Update: ${apt.petName}`,
      description: `Appointment at ${apt.clinicName} was declined: "${reason}". Please choose another date or contact reception.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'book',
      badge: 'Cancelled',
    };
    setNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const rescheduleAppointment = (
    id: string,
    newDate: string,
    newTime: string
  ): { success: boolean; error?: string } => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return { success: false, error: 'Appointment not found' };

    // Prevent double booking
    if (apt.vetId) {
      const hasConflict = checkDoubleBooking(apt.vetId, apt.clinicId, newDate, newTime, id);
      if (hasConflict) {
        return {
          success: false,
          error: `Time conflict: A consultation is already booked at ${newTime} on ${newDate}.`,
        };
      }
    }

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, date: newDate, time: newTime, status: 'scheduled' } : a
      )
    );

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(
        supabase.from('appointments').update({ date: newDate, time: newTime, status: 'scheduled' }).eq('id', id)
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase reschedule error:', err));
    }

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `Appointment Rescheduled: ${apt.petName}`,
      description: `Your visit with ${apt.vetName} has been rescheduled to ${newDate} at ${newTime}.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'tracker',
      badge: 'Rescheduled',
    };
    setNotifications((prev) => deduplicateById([notif, ...prev]));
    return { success: true };
  };

  const completeAppointment = (id: string, summary?: string) => {
    const apt = appointments.find((a) => a.id === id);
    if (!apt) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: 'completed',
              completedAt: new Date().toISOString(),
              clinicalSummary: summary || a.clinicalSummary,
            }
          : a
      )
    );

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(
        supabase.from('appointments').update({ status: 'completed', clinical_summary: summary || apt.clinicalSummary, completed_at: new Date().toISOString() }).eq('id', id)
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase complete error:', err));
    }

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title: `Consultation Completed: ${apt.petName}`,
      description: `Dr. ${apt.vetName} has updated ${apt.petName}'s digital health passport and prescriptions.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'records',
      badge: 'Completed',
    };
    setNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' } : apt))
    );

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(
        supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id)
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase cancel error:', err));
    }
  };

  // Health Records & EMR Charting
  const addHealthRecord = (recData: Omit<HealthRecord, 'id' | 'syncStatus'>) => {
    const newRecord: HealthRecord = {
      ...recData,
      id: generateId('rec'),
      syncStatus: isOnline ? 'synced' : 'pending_sync',
    };
    setHealthRecords((prev) => deduplicateById([newRecord, ...prev]));

    const supabase = getSupabase();
    if (supabase && isOnline) {
      Promise.resolve(
        supabase
          .from('health_records')
          .upsert({
            id: newRecord.id,
            pet_id: newRecord.petId,
            type: newRecord.type,
            title: newRecord.title,
            date: newRecord.date,
            next_due_date: newRecord.nextDueDate,
            veterinarian: newRecord.veterinarian,
            vet_license_number: newRecord.vetLicenseNumber,
            clinic_name: newRecord.clinicName,
            notes: newRecord.notes,
            status: newRecord.status,
            batch_number: newRecord.batchNumber,
            attachment_name: newRecord.attachmentName,
            created_by_vet_id: newRecord.createdByVetId,
            vitals: newRecord.vitals,
            prescriptions: newRecord.prescriptions,
            is_private_vet_note: newRecord.isPrivateVetNote,
            private_vet_notes: newRecord.privateVetNotes,
            owner_discharge_instructions: newRecord.ownerDischargeInstructions,
          })
      )
        .then(() => {})
        .catch((err: unknown) => console.warn('Supabase health rec write note:', err));
    }

    if (!isOnline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: generateId('queue'),
          type: 'add_health_record',
          payload: newRecord,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    if (newRecord.type === 'vaccine' && newRecord.nextDueDate) {
      const notif: NotificationItem = {
        id: generateId('notif'),
        type: 'vaccine',
        title: `Vaccine Logged: ${newRecord.title}`,
        description: `Next booster scheduled for ${newRecord.nextDueDate}.`,
        timestamp: 'Just now',
        read: false,
        actionTab: 'records',
        badge: 'Vaccine',
      };
      setNotifications((prev) => deduplicateById([notif, ...prev]));
    }
  };

  const addClinicalConsultationNote = (data: {
    petId: string;
    appointmentId?: string;
    title: string;
    diagnosis: string;
    notes: string;
    vitals?: { weightKg?: number; tempC?: number; heartRateBpm?: number; respiratoryRateBpm?: number };
    prescriptions?: { medicineName: string; dosage: string; frequency: string; durationDays: number; instructions: string }[];
    vaccineAdministered?: { name: string; batchNumber: string; nextDueDate?: string };
    isPrivateVetNote?: boolean;
    privateVetNotes?: string;
    ownerDischargeInstructions?: string;
    markAppointmentComplete?: boolean;
  }) => {
    const vetName = activeVet?.name || 'Dr. Elena Ramos, DVM';
    const vetLicense = activeVet?.licenseNumber || 'PRC-VET-0038912';
    const clinicName = activeVet?.clinicName || 'Greenwood Animal Hospital & Wellness Center';
    const today = new Date().toISOString().split('T')[0];

    // Create primary clinical record
    const newRecord: HealthRecord = {
      id: generateId('rec'),
      petId: data.petId,
      type: 'checkup',
      title: data.title || 'Clinical Examination & Medical Note',
      date: today,
      veterinarian: vetName,
      vetLicenseNumber: vetLicense,
      clinicName: clinicName,
      notes: data.notes,
      status: 'completed',
      createdByVetId: activeVet?.id,
      vitals: data.vitals,
      diagnosis: data.diagnosis,
      prescriptions: data.prescriptions,
      isPrivateVetNote: data.isPrivateVetNote || false,
      privateVetNotes: data.privateVetNotes,
      ownerDischargeInstructions: data.ownerDischargeInstructions,
      syncStatus: isOnline ? 'synced' : 'pending_sync',
    };

    const newRecordsToAdd = [newRecord];

    // If vaccine was administered, also create separate vaccine ledger item
    if (data.vaccineAdministered && data.vaccineAdministered.name) {
      const vaccineRec: HealthRecord = {
        id: generateId('rec-vax'),
        petId: data.petId,
        type: 'vaccine',
        title: data.vaccineAdministered.name,
        date: today,
        nextDueDate: data.vaccineAdministered.nextDueDate || undefined,
        veterinarian: vetName,
        vetLicenseNumber: vetLicense,
        clinicName: clinicName,
        notes: `Administered during consultation. Batch: ${data.vaccineAdministered.batchNumber || 'N/A'}`,
        status: 'valid',
        batchNumber: data.vaccineAdministered.batchNumber,
        syncStatus: isOnline ? 'synced' : 'pending_sync',
      };
      newRecordsToAdd.push(vaccineRec);
    }

    setHealthRecords((prev) => deduplicateById([...newRecordsToAdd, ...prev]));

    const supabase = getSupabase();
    if (supabase && isOnline) {
      newRecordsToAdd.forEach((r) => {
        Promise.resolve(
          supabase
            .from('health_records')
            .upsert({
              id: r.id,
              pet_id: r.petId,
              type: r.type,
              title: r.title,
              date: r.date,
              next_due_date: r.nextDueDate,
              veterinarian: r.veterinarian,
              vet_license_number: r.vetLicenseNumber,
              clinic_name: r.clinicName,
              notes: r.notes,
              status: r.status,
              batch_number: r.batchNumber,
              created_by_vet_id: r.createdByVetId,
              vitals: r.vitals,
              prescriptions: r.prescriptions,
              is_private_vet_note: r.isPrivateVetNote,
              private_vet_notes: r.privateVetNotes,
              owner_discharge_instructions: r.ownerDischargeInstructions,
            })
        )
          .then(() => {})
          .catch((err: unknown) => console.warn('Supabase health note write error:', err));
      });
    }

    // Update pet's weight in their profile if vitals provided
    if (data.vitals?.weightKg) {
      updatePet(data.petId, { weightKg: data.vitals.weightKg });
    }

    // Mark appointment complete if requested
    if (data.appointmentId && data.markAppointmentComplete) {
      completeAppointment(data.appointmentId, data.diagnosis || data.title);
    }

    // Notify pet owner if there are public discharge instructions or prescriptions
    const pet = pets.find((p) => p.id === data.petId);
    if (pet && !data.isPrivateVetNote) {
      const notif: NotificationItem = {
        id: generateId('notif'),
        type: 'vaccine',
        title: `Medical Records Updated: ${pet.name}`,
        description: `Attending vet ${vetName} has logged consultation results and aftercare instructions.`,
        timestamp: 'Just now',
        read: false,
        actionTab: 'records',
        badge: 'Medical',
      };
      setNotifications((prev) => deduplicateById([notif, ...prev]));
    }
  };

  // Messages
  const sendMessage = async (
    conversationId: string,
    text: string,
    attachment?: { type: 'image' | 'record'; name: string }
  ) => {
    const senderType: 'clinic' | 'user' = currentRole === 'veterinarian' ? 'clinic' : 'user';
    const msgId = generateUUID();
    const newMsg: ChatMessage = {
      id: msgId,
      sender: senderType,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment,
    };
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastTimestamp: 'Just now',
            messages: deduplicateById([...c.messages, newMsg]),
          };
        }
        return c;
      })
    );

    const supabase = getSupabase();
    if (supabase && isOnline) {
      try {
        const sessionUser = (await supabase.auth.getUser()).data.user;
        const currentConv = conversations.find((c) => c.id === conversationId);
        const fallbackClinic = clinics[0];
        const convClinicId = currentConv?.clinicId || fallbackClinic.id;
        const matchedClinic = clinics.find((cl) => cl.id === convClinicId) || fallbackClinic;

        // 1. Guarantee parent conversation exists in Supabase before message insert
        const convRow: any = {
          id: conversationId,
          clinic_id: convClinicId,
          clinic_name: currentConv?.clinicName || matchedClinic.name || 'Veterinary Hospital',
          clinic_avatar: currentConv?.clinicAvatar || matchedClinic.image || null,
          pet_id: currentConv?.petId || (pets[0]?.id || 'pet-general'),
          pet_name: currentConv?.petName || (pets[0]?.name || 'General Care Inquiry'),
          owner_id: sessionUser?.id || null,
          last_message: text,
          last_timestamp: new Date().toISOString(),
          unread_count: 0,
          updated_at: new Date().toISOString(),
        };
        const { error: convErr } = await supabase.from('conversations').upsert(convRow);
        if (convErr) {
          console.error('[SafePaw] Conversation upsert error:', convErr.message);
        }

        // 2. Insert chat message with comprehensive column schema support
        const senderName = currentRole === 'veterinarian' ? (activeVet?.name || 'Dr. Attending Vet') : (sessionUser?.user_metadata?.full_name || 'Pet Parent');
        const msgRow: any = {
          id: msgId,
          conversation_id: conversationId,
          sender: senderType,
          sender_type: senderType,
          sender_name: senderName,
          sender_id: sessionUser?.id || null,
          text: text,
          message_text: text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          is_read: true,
          attachment: attachment || null,
          created_at: new Date().toISOString(),
        };

        const { error: chatErr } = await supabase.from('chat_messages').insert(msgRow);
        if (chatErr) {
          console.error('[SafePaw] Chat message insert error:', chatErr.message);
        } else {
          console.log('[SafePaw] Chat message successfully saved to Supabase.');
        }
      } catch (err) {
        console.error('[SafePaw] Supabase chat write error:', err);
      }
    }

    if (!isOnline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: generateId('queue'),
          type: 'send_message',
          payload: { conversationId, text, attachment },
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  };

  const startOrGetConversationWithClinic = (clinicId: string, petId?: string): string => {
    const clinic = clinics.find((cl) => cl.id === clinicId) || clinics[0];
    const pet = pets.find((p) => p.id === petId) || pets[0] || null;
    const targetPetId = pet?.id || generateUUID();
    const targetPetName = pet ? pet.name : 'General Care Inquiry';

    const existing = conversations.find((c) => c.clinicId === clinic.id);
    if (existing) return existing.id;

    const newConvId = generateUUID();
    const newConv: Conversation = {
      id: newConvId,
      clinicId: clinic.id,
      clinicName: clinic.name,
      clinicAvatar: clinic.image,
      petId: targetPetId,
      petName: targetPetName,
      lastMessage: 'Direct communication channel opened.',
      lastTimestamp: 'Just now',
      unreadCount: 0,
      messages: [],
    };
    setConversations((prev) => deduplicateById([newConv, ...prev]));

    // Sync new conversation to Supabase
    const supabase = getSupabase();
    if (supabase && isOnline) {
      supabase.auth.getUser().then(({ data: authData }) => {
        supabase.from('conversations').upsert({
          id: newConv.id,
          clinic_id: newConv.clinicId,
          clinic_name: newConv.clinicName,
          clinic_avatar: newConv.clinicAvatar || null,
          pet_id: newConv.petId,
          pet_name: newConv.petName,
          owner_id: authData.user?.id || null,
          last_message: newConv.lastMessage,
          last_timestamp: new Date().toISOString(),
          unread_count: 0,
          updated_at: new Date().toISOString(),
        }).then(({ error }: any) => {
          if (error) console.error('[SafePaw] Conversation create error:', error.message);
        });
      });
    }

    return newConv.id;
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const sendSimulatedPushNotification = (title: string, body: string, actionTab?: string) => {
    const newNotif: NotificationItem = {
      id: generateId('notif'),
      type: 'appointment',
      title,
      description: body,
      timestamp: 'Just now',
      read: false,
      actionTab: actionTab || 'tracker',
      badge: 'Alert',
    };
    setNotifications((prev) => deduplicateById([newNotif, ...prev]));

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch {}
    }
  };

  // Lost pet report
  const reportLostPet = (reportData: Omit<LostPetReport, 'id' | 'dateReported'>) => {
    const newReport: LostPetReport = {
      ...reportData,
      id: generateId('lost'),
      countryCode: currentCountry.code,
      dateReported: new Date().toISOString().split('T')[0],
    };
    setLostPets((prev) => deduplicateById([newReport, ...prev]));

    if (!isOnline) {
      setSyncQueue((prev) => [
        ...prev,
        {
          id: generateId('queue'),
          type: 'report_lost_pet',
          payload: newReport,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    const notif: NotificationItem = {
      id: generateId('notif'),
      type: 'emergency',
      title: `Lost Pet Alert Broadcasted: ${newReport.petName}`,
      description: `Alert broadcasted to registered veterinary clinics and volunteers in ${newReport.city}, ${currentCountry.name}.`,
      timestamp: 'Just now',
      read: false,
      actionTab: 'shelters',
      badge: 'Radar',
    };
    setNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const clearOfflineCache = () => {
    setSyncQueue([]);
    setPets(INITIAL_PETS);
    setAppointments(INITIAL_APPOINTMENTS);
    setHealthRecords(INITIAL_HEALTH_RECORDS);
    setConversations(INITIAL_CONVERSATIONS);
    setLostPets(INITIAL_LOST_PETS);
    localStorage.clear();
  };

  const exportOfflineBackup = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      country: currentCountry.name,
      currency: currentCountry.currencyCode,
      pets,
      healthRecords,
      appointments,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safepaw_offline_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Location setting updates
  const updateLocationSettings = (updates: Partial<LocationSettings>) => {
    setLocationSettings((prev) => {
      const next = { ...prev, ...updates };
      if (updates.selectedCountryCode && updates.selectedCountryCode !== prev.selectedCountryCode) {
        const country = getCountryByCode(updates.selectedCountryCode);
        next.distanceUnit = country.distanceUnit;
        next.weightUnit = country.weightUnit;
        if (!updates.customCity) {
          next.customCity = country.defaultCity;
          next.customRegion = country.defaultRegion;
        }
      }
      return next;
    });

    const targetCode = updates.selectedCountryCode || locationSettings.selectedCountryCode;
    const country = getCountryByCode(targetCode);
    const notif: NotificationItem = {
      id: generateId('notif-loc'),
      type: 'location',
      title: `Region Updated: ${country.name}`,
      description: `Currency updated to ${country.currencyCode} (${country.currencySymbol}). Emergency hotlines and units adapted for ${country.name}.`,
      timestamp: 'Just now',
      read: false,
      badge: 'Location',
    };
    setNotifications((prev) => deduplicateById([notif, ...prev]));
  };

  const setCountryByCode = (code: string) => {
    updateLocationSettings({
      isManualOverride: true,
      selectedCountryCode: code,
    });
  };

  const resetToDetectedLocation = () => {
    updateLocationSettings({
      isManualOverride: false,
      selectedCountryCode: locationSettings.detectedCountryCode,
      customCity: locationSettings.detectedCity,
    });
  };

  return (
    <AppContext.Provider
      value={{
        // Role & Auth
        currentRole,
        setCurrentRole,
        activeVet,
        loginAsVet,
        loginCustomVet,
        logoutVet,
        availableVets,
        updateVetProfile,
        vetTab,
        setVetTab,

        // Pets
        pets,
        selectedPetId,
        selectedPet,
        setSelectedPetId,
        addPet,
        updatePet,
        deletePet,
        getAuthorizedPatientsForVet,

        // Clinics & Appointments
        clinics,
        appointments,
        getVetAppointments,
        bookAppointment,
        updateAppointmentStatus,
        acceptAppointment,
        declineAppointment,
        rescheduleAppointment,
        completeAppointment,
        cancelAppointment,

        // Health records & EMR
        healthRecords,
        getPublicHealthRecordsForPet,
        getAllHealthRecordsForVet,
        addHealthRecord,
        addClinicalConsultationNote,

        // Messages & Notifications
        conversations,
        sendMessage,
        startOrGetConversationWithClinic,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        sendSimulatedPushNotification,

        // Lost Pets
        lostPets,
        reportLostPet,
        adoptablePets,

        // Location & Currency
        locationSettings,
        currentCountry,
        formatPrice,
        updateLocationSettings,
        resetToDetectedLocation,
        setCountryByCode,

        // Offline
        isOnline,
        isSimulatedOffline,
        toggleSimulatedOffline,
        syncQueue,
        isSyncing,
        syncOfflineQueue,
        clearOfflineCache,
        exportOfflineBackup,

        // Navigation
        currentTab,
        setCurrentTab,
        preselectedClinicId,
        setPreselectedClinicId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
