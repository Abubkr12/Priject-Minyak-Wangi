"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const supabase = await createClient(true);
  
  const name = formData.get("name") as string;
  const label = formData.get("label") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  const { error } = await supabase.from("scent_families").insert({
    name,
    label,
    description,
    color,
    sort_order,
  });

  if (error) {
    throw new Error(`Gagal membuat kategori: ${error.message}`);
  }

  revalidatePath("/admin/kategori");
}

export async function updateCategory(id: number, formData: FormData) {
  const supabase = await createClient(true);
  
  const name = formData.get("name") as string;
  const label = formData.get("label") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;
  const sort_order = parseInt(formData.get("sort_order") as string) || 0;

  const { error } = await supabase
    .from("scent_families")
    .update({ name, label, description, color, sort_order })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal memperbarui kategori: ${error.message}`);
  }

  revalidatePath("/admin/kategori");
}

export async function deleteCategory(id: number) {
  const supabase = await createClient(true);
  
  // Periksa apakah kategori ini sedang digunakan oleh produk
  const { count } = await supabase
    .from("perfumes")
    .select("*", { count: 'exact', head: true })
    .contains("family_ids", [id]);
    
  if (count && count > 0) {
    throw new Error("Gagal menghapus: Keluarga aroma ini sedang digunakan oleh beberapa produk.");
  }

  const { error } = await supabase.from("scent_families").delete().eq("id", id);

  if (error) {
    throw new Error(`Gagal menghapus kategori: ${error.message}`);
  }

  revalidatePath("/admin/kategori");
}
