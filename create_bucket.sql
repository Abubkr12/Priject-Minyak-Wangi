INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'products');
