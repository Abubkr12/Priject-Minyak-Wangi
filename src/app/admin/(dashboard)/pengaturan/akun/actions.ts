"use server";

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient(true);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Anda belum login");
  }

  const updates: any = {
    full_name: formData.get("full_name") as string,
    birth_place: formData.get("birth_place") as string,
    birth_date: formData.get("birth_date") ? formData.get("birth_date") as string : null,
    gender: formData.get("gender") as string,
    religion: formData.get("religion") as string,
  };

  const avatarFile = formData.get("avatar") as File | null;
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      updates.avatar_url = data.publicUrl;
    }
  }

  const { error } = await supabase
    .from("admin_users")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    throw new Error(`Gagal menyimpan profil: ${error.message}`);
  }

  revalidatePath("/admin/pengaturan/akun");
}
