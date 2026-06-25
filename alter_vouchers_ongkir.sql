-- 1. Hapus batasan tipe lama agar mendukung gratis ongkir
ALTER TABLE vouchers DROP CONSTRAINT IF EXISTS vouchers_type_check;

-- 2. Tambahkan batasan tipe baru
ALTER TABLE vouchers ADD CONSTRAINT vouchers_type_check CHECK (type IN ('percentage', 'nominal', 'free_shipping'));

-- 3. Tambahkan kolom coverage_area (Cakupan Wilayah)
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS coverage_area text DEFAULT 'Seluruh Indonesia';
