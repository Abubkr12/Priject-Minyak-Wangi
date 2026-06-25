-- Eksekusi SQL ini di Supabase Dashboard (SQL Editor)

-- 1. Buat Storage Bucket untuk foto profil
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 2. Hapus policy lama jika ada untuk menghindari error duplikat
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Users can update their own avatars" on storage.objects;
drop policy if exists "Users can delete their own avatars" on storage.objects;

-- 3. Buat policy Storage yang baru
create policy "Public Access" on storage.objects for select using ( bucket_id = 'avatars' );
create policy "Authenticated users can upload avatars" on storage.objects for insert with check ( bucket_id = 'avatars' and auth.role() = 'authenticated' );
create policy "Users can update their own avatars" on storage.objects for update using ( bucket_id = 'avatars' and auth.uid() = owner );
create policy "Users can delete their own avatars" on storage.objects for delete using ( bucket_id = 'avatars' and auth.uid() = owner );

-- 4. Tambahkan kolom avatar_url di tabel admin_users
alter table public.admin_users add column if not exists avatar_url text;

-- 5. Tambahkan kolom avatar_url di tabel profil customer (sesuaikan nama tabel jika berbeda)
-- alter table public.profiles add column if not exists avatar_url text;
