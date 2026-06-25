-- Langkah 1: Hapus default dari kolom jika kolom tersebut sudah ada
-- Ini mencegah error "default for column cannot be cast automatically"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'perfumes' AND column_name = 'family_ids'
    ) THEN
        ALTER TABLE perfumes ALTER COLUMN family_ids DROP DEFAULT;
    END IF;
END $$;

-- Langkah 2: Tambahkan kolom jika belum ada
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS family_ids int[];

-- Langkah 3: Ubah tipe data menjadi int[] (jika sebelumnya jsonb)
ALTER TABLE perfumes ALTER COLUMN family_ids TYPE int[] USING (
    CASE 
      WHEN family_ids IS NULL OR jsonb_typeof(family_ids::jsonb) = 'null' THEN '{}'::int[]
      WHEN jsonb_typeof(family_ids::jsonb) = 'array' THEN translate(family_ids::text, '[]', '{}')::int[]
      ELSE '{}'::int[]
    END
);

-- Langkah 4: Set default value yang benar untuk tipe int[]
ALTER TABLE perfumes ALTER COLUMN family_ids SET DEFAULT '{}'::int[];

-- Langkah 5: Migrasi data dari family_id tunggal ke array
UPDATE perfumes SET family_ids = ARRAY[family_id] 
WHERE family_id IS NOT NULL AND (family_ids IS NULL OR array_length(family_ids, 1) IS NULL);
