-- ===================================================
--  MINYAK WANGI - DATABASE SCHEMA
--  Jalankan di Supabase Dashboard > SQL Editor
--  Copy-paste SELURUH isi file ini, lalu klik RUN
-- ===================================================

-- ┌──────────────────────────────────┐
-- │  TABEL 1: Store Settings        │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS store_settings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key         TEXT UNIQUE NOT NULL,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO store_settings (key, value) VALUES
  ('store_name',        'Nama Toko'),
  ('store_tagline',     'Parfum Isi Ulang Premium'),
  ('store_logo',        ''),
  ('store_address',     'Palembang, Sumatera Selatan'),
  ('store_phone',       '+62 812-xxxx-xxxx'),
  ('store_email',       'hello@namatoko.com'),
  ('store_hours',       'Senin - Sabtu, 09:00 - 21:00 WIB'),
  ('store_instagram',   ''),
  ('store_whatsapp',    ''),
  ('store_description', 'Toko parfum isi ulang dengan AI assistant untuk menemukan aroma yang cocok.')
ON CONFLICT (key) DO NOTHING;

-- ┌──────────────────────────────────┐
-- │  TABEL 2: Scent Families        │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS scent_families (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  label       TEXT NOT NULL,
  description TEXT,
  color       TEXT,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO scent_families (name, label, description, color, sort_order) VALUES
  ('fresh',   'Fresh & Clean',    'Aroma segar dan bersih, cocok untuk aktivitas sehari-hari',    '#2dd4b4', 1),
  ('floral',  'Floral & Romantic','Aroma bunga yang romantis dan elegan',                          '#e8899a', 2),
  ('woody',   'Woody & Earthy',   'Aroma kayu yang hangat dan maskulin',                           '#8b6914', 3),
  ('citrus',  'Citrus & Zesty',   'Aroma jeruk yang segar dan energik',                            '#f5c518', 4),
  ('sweet',   'Sweet & Gourmand', 'Aroma manis seperti vanilla, karamel, dan cokelat',             '#d4a574', 5),
  ('aquatic', 'Aquatic & Ocean',  'Aroma laut dan air yang menyegarkan',                           '#5ba4cf', 6),
  ('spicy',   'Spicy & Bold',     'Aroma rempah yang bold dan berani',                             '#c05668', 7),
  ('musky',   'Musky & Sensual',  'Aroma musk yang sensual dan misterius',                         '#9b8ec4', 8)
ON CONFLICT (name) DO NOTHING;

-- ┌──────────────────────────────────┐
-- │  TABEL 3: Perfumes              │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS perfumes (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  collection      TEXT DEFAULT 'Signature',
  family_id       INT REFERENCES scent_families(id) ON DELETE SET NULL,
  mood            TEXT,
  description     TEXT,
  full_description TEXT,
  notes           JSONB DEFAULT '[]',
  strength        TEXT DEFAULT 'Eau de Parfum',
  longevity       TEXT DEFAULT '6-8 jam',
  usage_guide     TEXT,
  image_url       TEXT,
  images          JSONB DEFAULT '[]',
  is_active       BOOLEAN DEFAULT TRUE,
  is_featured     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ┌──────────────────────────────────┐
-- │  TABEL 4: Perfume Sizes         │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS perfume_sizes (
  id          SERIAL PRIMARY KEY,
  perfume_id  INT NOT NULL REFERENCES perfumes(id) ON DELETE CASCADE,
  size_ml     INT NOT NULL,
  size_label  TEXT NOT NULL,
  price       BIGINT NOT NULL,
  stock       INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  UNIQUE(perfume_id, size_ml)
);

-- ┌──────────────────────────────────┐
-- │  TABEL 5: Customer Profiles     │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS customer_profiles (
  id          UUID PRIMARY KEY,
  full_name   TEXT,
  phone       TEXT,
  address     TEXT,
  city        TEXT,
  province    TEXT,
  postal_code TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ┌──────────────────────────────────┐
-- │  TABEL 6: Orders                │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS orders (
  id              SERIAL PRIMARY KEY,
  order_code      TEXT UNIQUE NOT NULL,
  customer_id     UUID,
  customer_name   TEXT,
  customer_phone  TEXT,
  customer_address TEXT,
  subtotal        BIGINT NOT NULL DEFAULT 0,
  discount        BIGINT DEFAULT 0,
  total           BIGINT NOT NULL DEFAULT 0,
  voucher_code    TEXT,
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','processing','shipped','completed','cancelled')),
  payment_method  TEXT,
  midtrans_id     TEXT,
  midtrans_url    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ┌──────────────────────────────────┐
-- │  TABEL 7: Order Items           │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  perfume_id  INT REFERENCES perfumes(id) ON DELETE SET NULL,
  size_id     INT REFERENCES perfume_sizes(id) ON DELETE SET NULL,
  perfume_name TEXT NOT NULL,
  size_label  TEXT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  price       BIGINT NOT NULL,
  subtotal    BIGINT NOT NULL
);

-- ┌──────────────────────────────────┐
-- │  TABEL 8: Custom Requests       │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS custom_requests (
  id              SERIAL PRIMARY KEY,
  customer_id     UUID,
  customer_name   TEXT,
  description     TEXT NOT NULL,
  size_preference TEXT DEFAULT '30ml',
  reference_image TEXT,
  status          TEXT DEFAULT 'baru'
                  CHECK (status IN ('baru','diproses','butuh_review','selesai','dibatalkan')),
  admin_notes     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ┌──────────────────────────────────┐
-- │  TABEL 9: Vouchers              │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS vouchers (
  id              SERIAL PRIMARY KEY,
  code            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('percentage', 'nominal')),
  value           BIGINT NOT NULL,
  min_purchase    BIGINT DEFAULT 0,
  max_discount    BIGINT,
  quota           INT DEFAULT 0,
  used_count      INT DEFAULT 0,
  valid_from      TIMESTAMPTZ DEFAULT now(),
  valid_until     TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ┌──────────────────────────────────┐
-- │  TABEL 10: Contact Messages     │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS contact_messages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  subject     TEXT,
  message     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ┌──────────────────────────────────┐
-- │  TABEL 11: FAQ                  │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS faq (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INT DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

INSERT INTO faq (question, answer, sort_order) VALUES
  ('Apa itu parfum isi ulang?',
   'Parfum isi ulang adalah parfum yang bisa dibeli dalam kemasan refill dengan berbagai ukuran (10ml, 30ml, 50ml, 100ml). Lebih hemat dan ramah lingkungan dibanding beli botol baru.',
   1),
  ('Bagaimana cara request racikan custom?',
   'Anda bisa menggunakan fitur Custom Request di halaman utama. Tulis brief aroma yang diinginkan, atau upload foto parfum referensi. Tim kami akan menghubungi Anda untuk diskusi lebih lanjut.',
   2),
  ('Berapa lama daya tahan parfum isi ulang?',
   'Daya tahan parfum isi ulang kami berkisar antara 4-12 jam, tergantung jenis racikan dan konsentrasi yang dipilih (Eau de Toilette vs Eau de Parfum).',
   3),
  ('Apakah bisa replika parfum merek terkenal?',
   'Ya, kami bisa meracik parfum yang terinspirasi dari aroma merek terkenal. Upload foto atau sebutkan nama parfum referensi Anda, dan kami akan membuatkan racikan serupa.',
   4),
  ('Metode pembayaran apa saja yang tersedia?',
   'Kami menerima transfer bank (BCA, BNI, BRI, Mandiri), e-wallet (GoPay, OVO, Dana, ShopeePay), kartu kredit/debit, dan Alfamart/Indomaret melalui Midtrans.',
   5),
  ('Berapa lama pengiriman?',
   'Pengiriman dalam kota Palembang 1-2 hari kerja. Luar kota 2-5 hari kerja tergantung ekspedisi yang dipilih.',
   6)
ON CONFLICT DO NOTHING;

-- ┌──────────────────────────────────┐
-- │  TABEL 12: Homepage Sliders     │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS homepage_sliders (
  id              SERIAL PRIMARY KEY,
  title           TEXT,
  description     TEXT,
  image_url       TEXT,
  button_text_1   TEXT,
  button_link_1   TEXT,
  button_text_2   TEXT,
  button_link_2   TEXT,
  overlay_opacity DECIMAL(3,2) DEFAULT 0.4,
  sort_order      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ┌──────────────────────────────────┐
-- │  TABEL 13: AI Chat Logs         │
-- └──────────────────────────────────┘
CREATE TABLE IF NOT EXISTS ai_chat_logs (
  id          SERIAL PRIMARY KEY,
  customer_id UUID,
  session_id  TEXT,
  messages    JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);


-- ===================================================
--  SAMPLE PERFUME DATA
-- ===================================================

INSERT INTO perfumes (name, slug, collection, family_id, mood, description, full_description, notes, strength, longevity, is_featured) VALUES
  ('Velvet Rose Musk',  'velvet-rose-musk',  'Signature Mix', 2, 'Romantis, bersih, feminin',
   'Perpaduan rose dan white musk yang elegan.',
   'Velvet Rose Musk menghadirkan keanggunan rose Turki yang dipadukan dengan white musk yang bersih. Sentuhan lychee di top notes memberikan kesegaran manis yang playful, sementara soft amber di base menciptakan warmth yang lasting. Cocok untuk daily wear dan date night.',
   '["Rose", "White musk", "Lychee", "Soft amber"]', 'Medium', '6-8 jam', TRUE),

  ('Citrus Neroli Clean', 'citrus-neroli-clean', 'Fresh Daily', 4, 'Segar, rapi, ringan',
   'Kesegaran neroli dan bergamot untuk daily wear.',
   'Citrus Neroli Clean adalah definisi dari clean fragrance. Bergamot Italia membuka dengan ledakan citrus yang ceria, diikuti neroli yang elegan dan green tea yang calming. Clean musk di base memastikan aroma bertahan lama tanpa terasa berat.',
   '["Bergamot", "Neroli", "Green tea", "Clean musk"]', 'Soft', '4-6 jam', TRUE),

  ('Noir Oud Reserve',  'noir-oud-reserve',  'Premium Blend', 3, 'Mewah, bold, dewasa',
   'Karakter oud yang dalam dan patchouli yang kaya.',
   'Noir Oud Reserve adalah statement scent untuk yang mengerti kemewahan. Oud kualitas tinggi menjadi tulang punggung komposisi ini, diperkaya dengan saffron yang exquisite dan patchouli yang earthy. Dark vanilla di base memberikan sweetness yang sophisticated.',
   '["Oud", "Saffron", "Patchouli", "Dark vanilla"]', 'Strong', '8-10 jam', TRUE),

  ('Ocean Linen Mist',  'ocean-linen-mist',  'Clean Fresh', 6, 'Sejuk, bersih, effortless',
   'Aroma linen segar dengan sentuhan laut.',
   'Ocean Linen Mist menangkap perasaan kain linen yang baru dijemur di tepi pantai. Sea salt memberikan freshness yang natural, lavender menambah ketenangan, dan soft woods di base menciptakan fondasi yang clean.',
   '["Sea salt", "Linen", "Lavender", "Soft woods"]', 'Medium', '5-7 jam', TRUE),

  ('Vanilla Skin Glow', 'vanilla-skin-glow', 'Comfort Mix', 5, 'Manis, hangat, dekat di kulit',
   'Vanilla gourmand yang warm dan nyaman.',
   'Vanilla Skin Glow adalah comfort scent yang sempurna. Vanilla yang rich dipadukan dengan caramel yang tidak terlalu manis, milk accord yang creamy, dan skin musk yang intimate. Aroma yang membuat orang ingin mendekat.',
   '["Vanilla", "Caramel", "Milk accord", "Skin musk"]', 'Medium', '6-8 jam', FALSE),

  ('Spiced Amber Club', 'spiced-amber-club', 'Evening Mix', 7, 'Hangat, percaya diri, maskulin',
   'Rempah hangat untuk malam yang berkesan.',
   'Spiced Amber Club adalah aroma untuk momen spesial. Cardamom memberikan opening yang intriguing, amber menciptakan warmth yang enveloping, tonka bean menambah sweetness yang sophisticated, dan cedar memberikan dry-down yang clean.',
   '["Cardamom", "Amber", "Tonka", "Cedar"]', 'Strong', '7-9 jam', FALSE)
ON CONFLICT (slug) DO NOTHING;


-- Insert perfume sizes
DO $$
DECLARE
  p RECORD;
  base_price BIGINT;
BEGIN
  FOR p IN SELECT id, name FROM perfumes LOOP
    base_price := CASE
      WHEN p.name = 'Noir Oud Reserve'  THEN 22000
      WHEN p.name = 'Spiced Amber Club' THEN 18000
      WHEN p.name = 'Vanilla Skin Glow' THEN 16000
      WHEN p.name = 'Velvet Rose Musk'  THEN 15000
      ELSE 14000
    END;

    INSERT INTO perfume_sizes (perfume_id, size_ml, size_label, price, stock)
    VALUES
      (p.id, 10,  '10ml',  base_price,             50),
      (p.id, 30,  '30ml',  base_price * 25 / 10,   30),
      (p.id, 50,  '50ml',  base_price * 40 / 10,   20),
      (p.id, 100, '100ml', base_price * 70 / 10,   10)
    ON CONFLICT (perfume_id, size_ml) DO NOTHING;
  END LOOP;
END $$;


-- ===================================================
--  ROW LEVEL SECURITY (RLS)
-- ===================================================

-- Public read access
ALTER TABLE perfumes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read perfumes" ON perfumes;
CREATE POLICY "Public read perfumes" ON perfumes FOR SELECT USING (TRUE);

ALTER TABLE perfume_sizes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read perfume_sizes" ON perfume_sizes;
CREATE POLICY "Public read perfume_sizes" ON perfume_sizes FOR SELECT USING (TRUE);

ALTER TABLE scent_families ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read scent_families" ON scent_families;
CREATE POLICY "Public read scent_families" ON scent_families FOR SELECT USING (TRUE);

ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read store_settings" ON store_settings;
CREATE POLICY "Public read store_settings" ON store_settings FOR SELECT USING (TRUE);

ALTER TABLE faq ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read faq" ON faq;
CREATE POLICY "Public read faq" ON faq FOR SELECT USING (is_active = TRUE);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active vouchers" ON vouchers;
CREATE POLICY "Public read active vouchers" ON vouchers FOR SELECT USING (is_active = TRUE);

ALTER TABLE homepage_sliders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read active sliders" ON homepage_sliders;
CREATE POLICY "Public read active sliders" ON homepage_sliders FOR SELECT USING (is_active = TRUE);

-- Customer profiles
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own profile" ON customer_profiles;
CREATE POLICY "Users read own profile" ON customer_profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own profile" ON customer_profiles;
CREATE POLICY "Users update own profile" ON customer_profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users insert own profile" ON customer_profiles;
CREATE POLICY "Users insert own profile" ON customer_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own orders" ON orders;
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Users insert own orders" ON orders;
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (TRUE);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own order items" ON order_items;
CREATE POLICY "Users read own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));

-- Custom requests
ALTER TABLE custom_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own requests" ON custom_requests;
CREATE POLICY "Users read own requests" ON custom_requests FOR SELECT USING (auth.uid() = customer_id);
DROP POLICY IF EXISTS "Anyone insert requests" ON custom_requests;
CREATE POLICY "Anyone insert requests" ON custom_requests FOR INSERT WITH CHECK (TRUE);

-- Contact messages: anyone can send
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can send message" ON contact_messages;
CREATE POLICY "Anyone can send message" ON contact_messages FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Public read messages" ON contact_messages;
CREATE POLICY "Public read messages" ON contact_messages FOR SELECT USING (TRUE);

-- AI chat logs
ALTER TABLE ai_chat_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone insert chats" ON ai_chat_logs;
CREATE POLICY "Anyone insert chats" ON ai_chat_logs FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Anyone read chats" ON ai_chat_logs;
CREATE POLICY "Anyone read chats" ON ai_chat_logs FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Anyone update chats" ON ai_chat_logs;
CREATE POLICY "Anyone update chats" ON ai_chat_logs FOR UPDATE USING (TRUE);
