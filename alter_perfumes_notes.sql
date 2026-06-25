-- Menambahkan kolom top_notes, middle_notes, base_notes ke tabel perfumes
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS top_notes text[] DEFAULT '{}';
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS middle_notes text[] DEFAULT '{}';
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS base_notes text[] DEFAULT '{}';

-- (Opsional) Memindahkan data dari notes lama ke salah satu (misal middle_notes)
-- UPDATE perfumes SET middle_notes = notes WHERE notes IS NOT NULL AND array_length(notes, 1) > 0;
