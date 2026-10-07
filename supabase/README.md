# SafePaw Supabase Setup Guide

This guide contains everything you need to configure your **Supabase** backend for SafePaw.

---

## 📋 Table of Contents
1. [Step 1: Run Database Schema](#step-1-run-database-schema)
2. [Step 2: Create Storage Buckets](#step-2-create-storage-buckets)
3. [Step 3: Enable Authentication Providers](#step-3-enable-authentication-providers)
   - [Google OAuth 2.0](#a-google-oauth-20-configuration)
   - [Phone Number (SMS OTP)](#b-phone-sms-otp-configuration)
4. [Step 4: Environment Variables (`.env`)](#step-4-environment-variables-env)

---

## Step 1: Run Database Schema

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. Go to **SQL Editor** (left menu) > Click **"New Query"**.
3. Copy the entire content of [`/supabase/schema.sql`](./schema.sql) and paste it into the editor.
4. Click **Run**.

### What this creates:
- **Tables**: `profiles`, `clinics`, `veterinarians`, `pets`, `appointments`, `health_records`, `vet_applications`, `conversations`, `chat_messages`, `lost_pets`.
- **Double Booking Guard**: Unique index preventing overlapping clinician time slots.
- **Row Level Security (RLS)**: Enforces that pet owners only see their pets and public medical records, while veterinarians have scoped access to clinic records and internal confidential SOAP notes.
- **Seed Data**: Pre-loaded Philippine clinics in BGC, Quezon City, and Makati with accredited veterinary directors.

---

## Step 2: Create Storage Buckets

1. In Supabase **SQL Editor**, create a new query.
2. Copy and run the contents of [`/supabase/storage_setup.sql`](./storage_setup.sql).
3. This creates:
   - `pet-photos` *(Public)*: Pet avatars and lost pet radar photos.
   - `prc-licenses` *(Private)*: Uploaded doctor PRC licenses for board review.
   - `emr-attachments` *(Private)*: Lab test PDFs, diagnostic X-rays, and medical records.

---

## Step 3: Enable Authentication Providers

Go to **Authentication** > **Providers** in your Supabase Dashboard:

### A. Google OAuth 2.0 Configuration
1. Under **Auth Providers**, find **Google** and toggle it **Enabled**.
2. Go to [Google Cloud Console](https://console.cloud.google.com/) > **APIs & Services** > **Credentials**.
3. Create an **OAuth 2.0 Client ID** (Web application).
4. Set **Authorized Redirect URIs** to the URL provided in your Supabase Google Auth panel:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
5. Copy your **Client ID** and **Client Secret** into Supabase and save.

### B. Phone (SMS OTP) Configuration
1. Under **Auth Providers**, find **Phone** and toggle it **Enabled**.
2. Select your SMS provider:
   - **Twilio**: Input `Twilio Account SID`, `Twilio Auth Token`, and `Twilio Message Service SID` / Phone Number.
   - **MessageBird / Vonage**: Input corresponding API credentials.
3. Set **OTP Expiry** to `300 seconds` (5 minutes).

---

## Step 4: Environment Variables (`.env`)

Add the following variables to your `.env` file:

```env
# SUPABASE CONNECTION
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"

# GOOGLE OAUTH
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# SMS GATEWAY (Twilio or Semaphore)
SMS_PROVIDER="twilio"
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="+1XXXXXXXXXX"
```
