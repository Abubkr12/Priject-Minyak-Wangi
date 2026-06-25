"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getStoreSettings() {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("store_settings").select("*");
  if (error) {
    console.error("Error fetching settings:", error);
    return [];
  }
  return data;
}

export async function saveStoreSetting(key: string, value: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("store_settings")
    .upsert({ key, value }, { onConflict: "key" });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
