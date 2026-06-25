"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function adminLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi" };
  }

  // Use the admin client (isAdmin = true)
  const supabase = await createClient(true);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email atau password salah" };
    }
    return { error: error.message };
  }

  const nextUrl = formData.get("next") as string || "/admin";

  revalidatePath("/", "layout");
  redirect(nextUrl);
}
