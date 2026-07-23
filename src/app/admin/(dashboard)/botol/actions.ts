"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Kita bikin instance Supabase langsung menggunakan SERVICE ROLE KEY
// Ini buat bypass RLS yang ngeblokir update di tabel bottles
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveBotol(payload: any, id?: string) {
  try {
    if (id) {
      // Edit
      const { error } = await supabaseAdmin
        .from("bottles")
        .update(payload)
        .eq("id", id);
        
      if (error) throw error;
    } else {
      // Tambah baru
      const { error } = await supabaseAdmin
        .from("bottles")
        .insert(payload);
        
      if (error) throw error;
    }
    
    // Revalidasi agar tabel di client dapet data terbaru
    revalidatePath("/admin/botol");
    return { success: true };
  } catch (err: any) {
    console.error("Error saveBotol:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteBotol(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("bottles")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
    
    revalidatePath("/admin/botol");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleteBotol:", err);
    return { success: false, error: err.message };
  }
}
