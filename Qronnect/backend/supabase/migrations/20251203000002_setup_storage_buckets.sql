-- ============================================
-- Setup Storage Buckets for Branding Images
-- ============================================
-- Date: 2025-12-03
-- Description: Create and configure storage buckets for logo, favicon, etc.

-- Create the branding bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,  -- Public bucket so images can be accessed directly
  2097152,  -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/x-icon']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp', 'image/x-icon'];

-- Policy: Allow anyone to read files (public bucket)
DROP POLICY IF EXISTS "Public read access for branding" ON storage.objects;
CREATE POLICY "Public read access for branding"
ON storage.objects FOR SELECT
USING (bucket_id = 'branding');

-- Policy: Allow authenticated users (admins) to upload
DROP POLICY IF EXISTS "Admin upload access for branding" ON storage.objects;
CREATE POLICY "Admin upload access for branding"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'branding');

-- Policy: Allow authenticated users (admins) to update
DROP POLICY IF EXISTS "Admin update access for branding" ON storage.objects;
CREATE POLICY "Admin update access for branding"
ON storage.objects FOR UPDATE
USING (bucket_id = 'branding');

-- Policy: Allow authenticated users (admins) to delete
DROP POLICY IF EXISTS "Admin delete access for branding" ON storage.objects;
CREATE POLICY "Admin delete access for branding"
ON storage.objects FOR DELETE
USING (bucket_id = 'branding');

COMMIT;
