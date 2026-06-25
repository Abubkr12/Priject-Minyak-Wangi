-- Manual payment, Ela Parfum store settings, and payment asset storage.

CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('bank_transfer', 'qris')),
  bank_name TEXT NOT NULL,
  account_number TEXT,
  account_name TEXT,
  qr_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS unique_code INT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_cost BIGINT DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waybill_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method_id INT REFERENCES payment_methods(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'waiting_confirmation', 'paid', 'rejected'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_notes TEXT;

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Public read payment_methods" ON payment_methods;
CREATE POLICY "Public read active payment_methods"
  ON payment_methods FOR SELECT
  USING (is_active = TRUE);

INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-assets', 'payment-assets', TRUE)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public read payment assets" ON storage.objects;
CREATE POLICY "Public read payment assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'payment-assets');

INSERT INTO store_settings (key, value) VALUES
  ('store_name', 'Ela Parfum'),
  ('store_tagline', 'Pusat Parfum Isi Ulang, Refill, dan Biang Berkualitas'),
  ('store_address', 'Jl. Raya Condet No.1, RT.1/RW.15, Cililitan, Kec. Kramat jati, Kota Jakarta Timur, DKI Jakarta 13640'),
  ('store_phone', '+6287877550573'),
  ('store_hours', 'Setiap Hari, 08:00 - 22:00 WIB'),
  ('store_instagram', 'https://www.instagram.com/ela_parfum_condet/'),
  ('store_facebook', 'https://web.facebook.com/ELAPARFUM/?_rdc=1&_rdr#'),
  ('store_whatsapp', 'https://wa.me/6287877550573'),
  ('store_maps_url', 'https://maps.app.goo.gl/CALqLaWZET1Lix7B7'),
  ('store_plus_code', 'PVP7+MW Cililitan, Kota Jakarta Timur, DKI Jakarta'),
  ('GEMINI_MODEL', 'gemini-2.0-flash')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO payment_methods (type, bank_name, account_number, account_name, is_active)
VALUES ('bank_transfer', 'Transfer Bank Ela Parfum', 'Isi nomor rekening asli', 'Ela Parfum', FALSE)
ON CONFLICT DO NOTHING;
