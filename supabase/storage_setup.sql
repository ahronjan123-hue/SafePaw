-- ==============================================================================
-- SafePaw Storage Buckets Setup in Supabase
-- Paste into Supabase SQL Editor to provision public/private buckets
-- ==============================================================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('pet-photos', 'pet-photos', true),
  ('prc-licenses', 'prc-licenses', false),
  ('emr-attachments', 'emr-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Policies for Pet Photos (Public Read, Owner Upload)
CREATE POLICY "Public read pet photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-photos');

CREATE POLICY "Authenticated users can upload pet photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pet-photos' AND auth.role() = 'authenticated');

-- 3. Storage Policies for PRC Licenses (Private, Vet and Admin only)
CREATE POLICY "Users can upload their own PRC license photo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'prc-licenses' AND auth.role() = 'authenticated');

CREATE POLICY "Vets can view their own license photo"
ON storage.objects FOR SELECT
USING (bucket_id = 'prc-licenses' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4. Storage Policies for EMR Attachments (Private, Vets & Patient Owners only)
CREATE POLICY "Authenticated users can upload EMR attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'emr-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Vets and Pet Owners can view authorized attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'emr-attachments' AND auth.role() = 'authenticated');
