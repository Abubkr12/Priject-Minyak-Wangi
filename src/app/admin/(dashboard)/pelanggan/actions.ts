"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function updateCustomer(
  id: string,
  data: {
    email?: string;
    password?: string;
    full_name?: string;
    phone?: string;
  }
) {
  try {
    const supabase = createAdminClient();

    // 1. Update Auth User (Email/Password) if provided
    if (data.email || data.password) {
      const authUpdates: any = {};
      if (data.email) authUpdates.email = data.email;
      if (data.password) authUpdates.password = data.password;

      const { error: authError } = await supabase.auth.admin.updateUserById(id, authUpdates);
      if (authError) {
        return { error: `Gagal memperbarui autentikasi: ${authError.message}` };
      }
    }

    // 2. Update Customer Profile
    const { error: profileError } = await supabase
      .from("customer_profiles")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (profileError) {
      return { error: `Gagal memperbarui profil: ${profileError.message}` };
    }

    revalidatePath("/admin/pelanggan");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const supabase = createAdminClient();
    
    // Using admin.deleteUser deletes the user from auth.users.
    // If there's ON DELETE CASCADE on customer_profiles, it will be deleted automatically.
    // However, if not, we should delete it manually first just in case.
    await supabase.from("customer_profiles").delete().eq("id", id);
    
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) {
      return { error: `Gagal menghapus akun: ${error.message}` };
    }

    revalidatePath("/admin/pelanggan");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
