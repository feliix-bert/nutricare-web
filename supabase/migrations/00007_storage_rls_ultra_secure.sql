-- [Opsional] Bersihkan aturan lama
DROP POLICY IF EXISTS "Public Access for food-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload food photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own food photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own food photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload food photos to their own child folders" ON storage.objects;
DROP POLICY IF EXISTS "Secure Uploads to own child folder" ON storage.objects;
DROP POLICY IF EXISTS "Secure Update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Secure Delete own photos" ON storage.objects;

-- 1. READ: Izinkan akses baca.
CREATE POLICY "Public Access for food-photos" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'food-photos' );

-- 2. CREATE (ULTRA-SECURE)
-- Pengguna HANYA boleh mengunggah file ke DALAM folder ID anak mereka sendiri
CREATE POLICY "Secure Uploads to own child folder" 
ON storage.objects FOR INSERT 
WITH CHECK ( 
  bucket_id = 'food-photos' 
  AND auth.role() = 'authenticated'
  AND split_part(name, '/', 1) IN (
    SELECT id::text FROM public.children WHERE user_id = auth.uid()
  )
);

-- 3. UPDATE (SECURE)
-- Hanya akun yang mengunggah foto tersebut yang berhak memodifikasinya
CREATE POLICY "Secure Update own photos" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'food-photos' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'food-photos' AND auth.uid() = owner );

-- 4. DELETE (SECURE)
-- Hanya akun yang mengunggah foto tersebut yang berhak menghapusnya
CREATE POLICY "Secure Delete own photos" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'food-photos' AND auth.uid() = owner );
