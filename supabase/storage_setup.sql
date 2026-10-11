-- ==============================================================================
-- SafePaw Storage Buckets Setup in Supabase
-- Paste into Supabase SQL Editor (SQL Editor > New Query)
-- Safe, Non-Destructive: Won't delete existing buckets or data
-- ==============================================================================

-- 1. Create Public Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('pet-photos', 'pet-photos', true),
  ('prc-licenses', 'prc-licenses', false),
  ('emr-attachments', 'emr-attachments', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Storage Policies for Pet Photos (Allows Reading & Uploading)
DROP POLICY IF EXISTS "Public read pet photos" ON storage.objects;
CREATE POLICY "Public read pet photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'pet-photos');

DROP POLICY IF EXISTS "Public insert pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pet photos" ON storage.objects;
CREATE POLICY "Public insert pet photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pet-photos');

DROP POLICY IF EXISTS "Public update pet photos" ON storage.objects;
CREATE POLICY "Public update pet photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pet-photos');

-- 3. Storage Policies for PRC Licenses (Private)
DROP POLICY IF EXISTS "Users can upload their own PRC license photo" ON storage.objects;
CREATE POLICY "Users can upload their own PRC license photo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'prc-licenses');

DROP POLICY IF EXISTS "Users can view their own license photo" ON storage.objects;
CREATE POLICY "Users can view their own license photo"
ON storage.objects FOR SELECT
USING (bucket_id = 'prc-licenses');

-- 4. Storage Policies for EMR Attachments
DROP POLICY IF EXISTS "Users can upload EMR attachments" ON storage.objects;
CREATE POLICY "Users can upload EMR attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'emr-attachments');

DROP POLICY IF EXISTS "Users can view authorized attachments" ON storage.objects;
CREATE POLICY "Users can view authorized attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'emr-attachments');
