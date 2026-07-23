"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveBibit(payload: any, id?: string) {
  try {
    if (id) {
      const { error } = await supabaseAdmin
        .from("bibit")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin
        .from("bibit")
        .insert(payload);
      if (error) throw error;
    }
    
    revalidatePath("/admin/bibit");
    return { success: true };
  } catch (err: any) {
    console.error("Error saveBibit:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteBibit(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("bibit")
      .delete()
      .eq("id", id);
    if (error) throw error;
    
    revalidatePath("/admin/bibit");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleteBibit:", err);
    return { success: false, error: err.message };
  }
}
