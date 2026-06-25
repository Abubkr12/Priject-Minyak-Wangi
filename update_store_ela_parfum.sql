-- Update Pengaturan Toko Ela Parfum
UPDATE store_settings SET value = 'Ela Parfum' WHERE key = 'store_name';
UPDATE store_settings SET value = 'Pusat Parfum Isi Ulang & Biang Berkualitas' WHERE key = 'store_tagline';
UPDATE store_settings SET value = 'Jl. Raya Condet No.1, RT.1/RW.15, Cililitan, Kec. Kramat jati, Kota Jakarta Timur, DKI Jakarta 13640' WHERE key = 'store_address';
UPDATE store_settings SET value = '+6287877550573' WHERE key = 'store_phone';
UPDATE store_settings SET value = 'Setiap Hari, 08:00 - 22:00 WIB' WHERE key = 'store_hours';
UPDATE store_settings SET value = 'https://www.instagram.com/ela_parfum_condet/' WHERE key = 'store_instagram';
UPDATE store_settings SET value = 'https://wa.me/6287877550573' WHERE key = 'store_whatsapp';

-- Insert Facebook jika belum ada di schema awal (kita gunakan store_email untuk diganti jadi facebook atau tambah row baru)
INSERT INTO store_settings (key, value) VALUES ('store_facebook', 'https://web.facebook.com/ELAPARFUM/?_rdc=1&_rdr#')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Tambahkan link Maps
INSERT INTO store_settings (key, value) VALUES ('store_maps_url', 'https://maps.app.goo.gl/CALqLaWZET1Lix7B7')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
