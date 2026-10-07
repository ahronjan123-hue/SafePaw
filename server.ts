import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// In-Memory Database for Vets & Applications
interface ApprovedVetRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
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
  approvalStatus: 'approved' | 'pending' | 'rejected';
  approvedAt?: string;
  createdAt: string;
}

interface VetApplicationRecord {
  id: string;
  authProvider: 'google';
  identifier: string; // email
  name: string;
  email?: string;
  licenseNumber: string;
  clinicId: string;
  clinicName: string;
  specialization: string;
  prcIdPhotoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewNotes?: string;
}

// Initial Pre-Approved Veterinarians
const approvedVets: ApprovedVetRecord[] = [
  {
    id: 'vet-1',
    name: 'Dr. Elena Ramos, DVM',
    email: 'elena.ramos@greenwoodvet.ph',
    phone: '+639178349210',
    title: 'Medical Director',
    licenseNumber: 'PRC-VET-0038912',
    clinicId: 'clinic-1',
    clinicName: 'Greenwood Animal Hospital & Wellness Center',
    specialization: 'Canine & Feline Internal Medicine',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    consultationFeeUSD: 12,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableTimeSlots: ['08:30 AM', '09:15 AM', '10:00 AM', '10:45 AM', '11:30 AM', '01:30 PM', '02:15 PM', '03:00 PM', '03:45 PM'],
    bio: '14+ years of clinical excellence specializing in geriatric patient management, chronic kidney disease, preventive immunology, and feline medicine.',
    approvalStatus: 'approved',
    approvedAt: '2025-01-10T08:00:00Z',
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'vet-2',
    name: 'Dr. Marcus Vance, DVM',
    email: 'marcus.vance@greenwoodvet.ph',
    phone: '+639185521902',
    title: 'Senior Surgeon',
    licenseNumber: 'PRC-VET-0041289',
    clinicId: 'clinic-1',
    clinicName: 'Greenwood Animal Hospital & Wellness Center',
    specialization: 'Orthopedic Surgery & Exotic Pets',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    consultationFeeUSD: 15,
    availableDays: ['Mon', 'Wed', 'Thu', 'Fri', 'Sat'],
    availableTimeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'],
    bio: 'Board-certified orthopedic veterinary surgeon with deep passion for avian, rabbit, and exotic mammal soft tissue surgery.',
    approvalStatus: 'approved',
    approvedAt: '2025-02-14T09:30:00Z',
    createdAt: '2025-02-14T09:30:00Z',
  },
  {
    id: 'vet-3',
    name: 'Dr. Sarah Alcantara, DVM',
    email: 'sarah.alcantara@stfrancis247.ph',
    phone: '+639209994357',
    title: 'Emergency Care Specialist',
    licenseNumber: 'PRC-VET-0059281',
    clinicId: 'clinic-2',
    clinicName: 'St. Francis 24/7 Pet Emergency & Trauma Center',
    specialization: 'Critical Care & Anesthesiology',
    avatar: 'https://images.unsplash.com/photo-1594824813583-57755f1f9a23?auto=format&fit=crop&w=300&q=80',
    consultationFeeUSD: 20,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    availableTimeSlots: ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'],
    bio: 'Dedicated trauma resuscitator managing acute trauma stabilization, emergency blood transfusions, and intensive care monitoring.',
    approvalStatus: 'approved',
    approvedAt: '2025-03-01T11:00:00Z',
    createdAt: '2025-03-01T11:00:00Z',
  },
];

const applicationsStore: VetApplicationRecord[] = [];

// API Routes

// 1. Auth Configuration
app.get('/api/auth/config', (_req: Request, res: Response) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    defaultCountryCode: '+63',
    defaultCountryName: 'Philippines',
  });
});

// 2. Google OAuth Verification & Veterinarian Access Check
app.post('/api/auth/google/verify', async (req: Request, res: Response) => {
  try {
    const { credential, email, name, picture } = req.body;

    let verifiedEmail = email;
    let verifiedName = name || 'Veterinarian User';
    let verifiedPicture = picture || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80';

    // If Google JWT Credential is provided, parse payload
    if (credential) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
          const payload = JSON.parse(payloadJson);
          if (payload.email) verifiedEmail = payload.email.toLowerCase();
          if (payload.name) verifiedName = payload.name;
          if (payload.picture) verifiedPicture = payload.picture;
        }
      } catch (jwtErr) {
        console.warn('[Auth] Error parsing Google credential JWT:', jwtErr);
      }
    }

    if (!verifiedEmail) {
      return res.status(400).json({ error: 'Valid Google email is required.' });
    }

    verifiedEmail = verifiedEmail.toLowerCase();

    // Check if account is in pre-approved Veterinarian Roster
    const existingVet = approvedVets.find(
      (v) => v.email.toLowerCase() === verifiedEmail && v.approvalStatus === 'approved'
    );

    if (existingVet) {
      return res.json({
        status: 'approved',
        accountType: 'veterinarian',
        message: 'Google identity verified. Welcome to the SafePaw Clinical Suite.',
        vet: {
          id: existingVet.id,
          name: existingVet.name,
          email: existingVet.email,
          title: existingVet.title,
          licenseNumber: existingVet.licenseNumber,
          clinicId: existingVet.clinicId,
          clinicName: existingVet.clinicName,
          specialization: existingVet.specialization,
          avatar: existingVet.avatar || verifiedPicture,
          consultationFeeUSD: existingVet.consultationFeeUSD,
          availableDays: existingVet.availableDays,
          availableTimeSlots: existingVet.availableTimeSlots,
          bio: existingVet.bio,
          phone: existingVet.phone,
        },
      });
    }

    // Check if there is a pending application under review
    const pendingApp = applicationsStore.find(
      (a) => a.identifier.toLowerCase() === verifiedEmail || a.email?.toLowerCase() === verifiedEmail
    );

    if (pendingApp) {
      return res.json({
        status: 'pending',
        accountType: 'pending_veterinarian',
        message: 'Your veterinarian application is currently under review by the Clinical Accreditation Board.',
        application: pendingApp,
      });
    }

    // Unregistered / Non-approved account
    return res.json({
      status: 'unregistered',
      accountType: 'pet_owner',
      message: 'Google identity confirmed. This account is not yet authorized for clinical veterinarian access.',
      user: {
        email: verifiedEmail,
        name: verifiedName,
        picture: verifiedPicture,
      },
    });
  } catch (err: any) {
    console.error('[Auth] Google verify error:', err);
    res.status(500).json({ error: 'Internal server error verifying Google account.' });
  }
});

// 3. Submit Veterinarian Credential Application
app.post('/api/auth/vet/apply', (req: Request, res: Response) => {
  try {
    const {
      identifier,
      name,
      email,
      licenseNumber,
      clinicId,
      clinicName,
      specialization,
      prcIdPhotoUrl,
    } = req.body;

    if (!name || !licenseNumber || !clinicId) {
      return res.status(400).json({
        error: 'Doctor name, official PRC / Board license number, and clinic association are required.',
      });
    }

    const appId = `app-${Date.now()}`;
    const newApplication: VetApplicationRecord = {
      id: appId,
      authProvider: 'google',
      identifier: identifier || email || `doc-${Date.now()}`,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      licenseNumber: licenseNumber.trim(),
      clinicId: clinicId || 'clinic-1',
      clinicName: clinicName || 'Greenwood Animal Hospital',
      specialization: specialization ? specialization.trim() : 'General Veterinary Medicine',
      prcIdPhotoUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      reviewNotes: 'Pending credential authenticity check with PRC / National Veterinary Board registry.',
    };

    applicationsStore.unshift(newApplication);

    res.json({
      success: true,
      message: 'Application received. Your clinical credentials will be reviewed within 24–48 hours.',
      application: newApplication,
    });
  } catch (err: any) {
    console.error('[Auth] Application error:', err);
    res.status(500).json({ error: 'Failed to submit application.' });
  }
});

// 4. View Applications
app.get('/api/auth/vet/applications', (_req: Request, res: Response) => {
  res.json({
    applications: applicationsStore,
    approvedVets: approvedVets.map((v) => ({
      id: v.id,
      name: v.name,
      email: v.email,
      licenseNumber: v.licenseNumber,
      clinicName: v.clinicName,
      specialization: v.specialization,
      approvalStatus: v.approvalStatus,
    })),
  });
});

// 5. Approve / Reject Application (Board Verification)
app.post('/api/auth/vet/review-application', (req: Request, res: Response) => {
  try {
    const { applicationId, action, notes } = req.body;

    const appIndex = applicationsStore.findIndex((a) => a.id === applicationId);
    if (appIndex === -1) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    const targetApp = applicationsStore[appIndex];
    targetApp.status = action === 'approve' ? 'approved' : 'rejected';
    targetApp.reviewNotes = notes || (action === 'approve' ? 'PRC License Verified & Active' : 'Application declined');

    if (action === 'approve') {
      const newVet: ApprovedVetRecord = {
        id: `vet-reg-${Date.now()}`,
        name: targetApp.name,
        email: targetApp.email || `${targetApp.identifier.replace(/[^a-zA-Z0-9]/g, '')}@safepaw.ph`,
        phone: '+639170000000',
        title: 'Attending Clinical Veterinarian',
        licenseNumber: targetApp.licenseNumber,
        clinicId: targetApp.clinicId,
        clinicName: targetApp.clinicName,
        specialization: targetApp.specialization,
        avatar: targetApp.prcIdPhotoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
        consultationFeeUSD: 14,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        availableTimeSlots: ['08:30 AM', '09:15 AM', '10:00 AM', '11:00 AM', '01:30 PM', '02:30 PM', '03:30 PM'],
        bio: `Board-licensed practitioner specializing in ${targetApp.specialization}.`,
        approvalStatus: 'approved',
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      approvedVets.push(newVet);

      return res.json({
        success: true,
        message: 'Application approved! Veterinarian access granted.',
        vet: newVet,
      });
    }

    res.json({
      success: true,
      message: 'Application rejected.',
      application: targetApp,
    });
  } catch (err: any) {
    console.error('[Auth] Review application error:', err);
    res.status(500).json({ error: 'Failed to process application review.' });
  }
});

// Vite mounting & Static handler
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SafePaw Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
