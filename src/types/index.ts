export type Species = 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Reptile' | 'Other';

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  ageYears: number;
  birthDate: string;
  weightKg: number;
  gender: 'Male' | 'Female';
  neutered: boolean;
  microchipId: string;
  photoUrl: string;
  allergies: string[];
  chronicConditions: string[];
  temperament: string;
  dietaryNotes: string;
  primaryClinicId?: string;
  registeredDate: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
}

export interface ClinicService {
  id: string;
  name: string;
  category: 'Wellness' | 'Vaccination' | 'Dental' | 'Surgery' | 'Emergency' | 'Grooming' | 'Telehealth';
  basePriceUSD: number;
  durationMinutes: number;
  description: string;
}

export interface Veterinarian {
  id: string;
  name: string;
  title: string;
  specialization: string;
  avatar: string;
  yearsExperience: number;
  licenseNumber?: string;
  clinicId?: string;
  consultationFeeUSD?: number;
  availableDays?: string[];
  availableTimeSlots?: string[];
  bio?: string;
  phone?: string;
  email?: string;
}

export type ProviderType = 'clinic' | 'hospital_247' | 'groomer' | 'boarding' | 'shelter';

export interface Clinic {
  id: string;
  name: string;
  type: ProviderType;
  countryCode: string;
  address: string;
  city: string;
  stateOrProvince: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  emergencyAvailable: boolean;
  phone: string;
  hours: string;
  image: string;
  verified: boolean;
  services: ClinicService[];
  veterinarians: Veterinarian[];
  about: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'checked_in'
  | 'in_consultation'
  | 'prescriptions_ready'
  | 'completed'
  | 'cancelled';

export interface Appointment {
  id: string;
  petId: string;
  petName: string;
  clinicId: string;
  clinicName: string;
  clinicAddress: string;
  vetId?: string;
  vetName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  isTelehealth: boolean;
  status: AppointmentStatus;
  queuePosition?: number;
  estimatedWaitMins?: number;
  symptoms: string;
  notes?: string;
  baseCostUSD: number;
  paymentStatus: 'paid' | 'deposit_paid' | 'pay_at_clinic';
  syncStatus?: 'synced' | 'pending_sync';
  createdAt: string;
  ownerName?: string;
  ownerPhone?: string;
  rejectionReason?: string;
  completedAt?: string;
  clinicalSummary?: string;
}

export type HealthRecordType = 'vaccine' | 'medication' | 'lab_result' | 'checkup' | 'surgery';

export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  type: HealthRecordType;
  title: string;
  date: string;
  nextDueDate?: string;
  veterinarian: string;
  vetLicenseNumber?: string;
  clinicName: string;
  notes: string;
  status: 'valid' | 'due_soon' | 'expired' | 'completed';
  batchNumber?: string;
  attachmentName?: string;
  syncStatus?: 'synced' | 'pending_sync';
  // EMR & Clinical Fields
  createdByVetId?: string;
  vitals?: {
    weightKg?: number;
    tempC?: number;
    heartRateBpm?: number;
    respiratoryRateBpm?: number;
  };
  diagnosis?: string;
  prescriptions?: PrescriptionItem[];
  isPrivateVetNote?: boolean;
  privateVetNotes?: string;
  ownerDischargeInstructions?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'clinic';
  text: string;
  timestamp: string;
  attachment?: {
    type: 'image' | 'record';
    name: string;
    url?: string;
  };
}

export interface Conversation {
  id: string;
  clinicId: string;
  clinicName: string;
  clinicAvatar: string;
  petId: string;
  petName: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface NotificationItem {
  id: string;
  type: 'appointment' | 'vaccine' | 'message' | 'emergency' | 'sync' | 'location' | 'vet_alert';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  actionTab?: string;
  badge?: string;
}

export interface LostPetReport {
  id: string;
  petName: string;
  species: Species;
  breed: string;
  lastSeenLocation: string;
  city: string;
  countryCode: string;
  dateReported: string;
  status: 'lost' | 'found' | 'reunited';
  contactPhone: string;
  description: string;
  photoUrl: string;
  microchipNumber?: string;
  baseRewardUSD?: number;
}

export interface AdoptablePet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  shelterName: string;
  city: string;
  countryCode: string;
  description: string;
  photoUrl: string;
  vaccinated: boolean;
  neutered: boolean;
  status: 'Available' | 'Pending Adoption';
}

export interface OfflineSyncQueueItem {
  id: string;
  type: 'add_appointment' | 'add_health_record' | 'update_pet' | 'send_message' | 'report_lost_pet' | 'update_appointment_status';
  payload: any;
  timestamp: string;
}

export interface CountryConfig {
  code: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateUSD: number; // 1 USD in this currency
  decimalPlaces: number;
  symbolPosition: 'prefix' | 'suffix';
  distanceUnit: 'km' | 'mi';
  weightUnit: 'kg' | 'lbs';
  emergencyHotline: string;
  emergencyHotlineLabel: string;
  defaultCity: string;
  defaultRegion: string;
}

export interface LocationSettings {
  detectedCountryCode: string;
  detectedCity: string;
  isManualOverride: boolean;
  selectedCountryCode: string;
  customCity: string;
  customRegion: string;
  currencyOverrideCode?: string;
  distanceUnit: 'km' | 'mi';
  weightUnit: 'kg' | 'lbs';
  autoSyncEnabled: boolean;
}

export type UserRole = 'pet_owner' | 'veterinarian';

export interface VetUserSession {
  id: string;
  name: string;
  email: string;
  title: string;
  licenseNumber: string;
  clinicId: string;
  clinicName: string;
  specialization: string;
  avatar: string;
  consultationFeeUSD: number;
  availableDays: string[];
  availableTimeSlots: string[];
  bio: string;
  phone: string;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  approvedAt?: string;
  createdAt?: string;
}
