-- Eksekusi SQL ini di Supabase Dashboard (SQL Editor)

-- 1. Buat Storage Bucket untuk foto produk
insert into storage.buckets (id, name, public) 
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Hapus policy lama jika ada untuk menghindari error duplikat
drop policy if exists "Public Access Products" on storage.objects;
drop policy if exists "Authenticated users can upload products" on storage.objects;
drop policy if exists "Authenticated users can update products" on storage.objects;
drop policy if exists "Authenticated users can delete products" on storage.objects;

-- 3. Buat policy Storage yang baru
create policy "Public Access Products" on storage.objects for select using ( bucket_id = 'products' );
create policy "Authenticated users can upload products" on storage.objects for insert with check ( bucket_id = 'products' and auth.role() = 'authenticated' );
create policy "Authenticated users can update products" on storage.objects for update using ( bucket_id = 'products' and auth.role() = 'authenticated' );
create policy "Authenticated users can delete products" on storage.objects for delete using ( bucket_id = 'products' and auth.role() = 'authenticated' );
