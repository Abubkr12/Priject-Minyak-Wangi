-- 1. Buat tabel payment_methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('bank_transfer', 'qris')),
  bank_name TEXT, -- e.g. BCA, Mandiri
  account_number TEXT,
  account_name TEXT,
  qr_image_url TEXT, -- Untuk QRIS statis
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tambahkan default payment methods (Opsional, agar ada isinya)
INSERT INTO payment_methods (type, bank_name, account_number, account_name) VALUES
  ('bank_transfer', 'BCA', '1234567890', 'Ela Parfum'),
  ('bank_transfer', 'Mandiri', '0987654321', 'Ela Parfum');

INSERT INTO payment_methods (type, bank_name, account_name, qr_image_url) VALUES
  ('qris', 'QRIS Ela Parfum', 'Ela Parfum', 'https://via.placeholder.com/400x400.png?text=QRIS+Ela+Parfum');

-- 3. Update tabel orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS unique_code INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill_number TEXT;

-- 4. Set RLS (Row Level Security) untuk payment_methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read payment_methods" ON payment_methods;
CREATE POLICY "Public read payment_methods" ON payment_methods FOR SELECT USING (is_active = TRUE);
