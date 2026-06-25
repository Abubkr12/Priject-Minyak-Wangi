-- Buat tabel custom_requests untuk pesanan racikan AI
CREATE TABLE IF NOT EXISTS custom_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  base_note TEXT NOT NULL,
  description TEXT NOT NULL,
  ai_recipe JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'paid', 'completed', 'rejected')),
  price_perfume BIGINT DEFAULT 0,
  price_bottle BIGINT DEFAULT 0,
  price_service BIGINT DEFAULT 0,
  total_price BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) - Opsional, biarkan public untuk insert sementara
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can insert custom_requests" ON custom_requests;
CREATE POLICY "Public can insert custom_requests" ON custom_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can select custom_requests" ON custom_requests;
CREATE POLICY "Public can select custom_requests" ON custom_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can update custom_requests" ON custom_requests;
CREATE POLICY "Public can update custom_requests" ON custom_requests FOR UPDATE USING (true);
