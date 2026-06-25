"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getVouchers() {
  const supabase = await createClient(true);
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching vouchers:", error);
    return [];
  }
  return data;
}

export async function saveVoucher(data: any) {
  const supabase = await createClient(true);
  const { id, ...payload } = data;

  if (id) {
    // Update
    const { error } = await supabase.from("vouchers").update(payload).eq("id", id);
    if (error) {
      console.error("Error updating voucher:", error);
      return { success: false, error: error.message };
    }
  } else {
    // Insert
    const { error } = await supabase.from("vouchers").insert([payload]);
    if (error) {
      console.error("Error inserting voucher:", error);
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/admin/voucher");
  return { success: true };
}

export async function toggleVoucherActive(id: number, isActive: boolean) {
  const supabase = await createClient(true);
  const { error } = await supabase.from("vouchers").update({ is_active: isActive }).eq("id", id);

  if (error) {
    console.error("Error toggling voucher:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/voucher");
  return { success: true };
}

export async function deleteVoucher(id: number) {
  const supabase = await createClient(true);
  const { error } = await supabase.from("vouchers").delete().eq("id", id);

  if (error) {
    console.error("Error deleting voucher:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/voucher");
  return { success: true };
}
