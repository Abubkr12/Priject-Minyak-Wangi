"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

const PAYMENT_BUCKET = "payment-assets";

export async function getPaymentMethods() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payment methods:", error);
    return [];
  }
  return data;
}

export async function savePaymentMethod(formData: FormData) {
  const supabase = createAdminClient();
  
  const idStr = formData.get('id') as string;
  const id = idStr ? parseInt(idStr) : null;
  
  const type = formData.get('type') as string;
  const bank_name = formData.get('bank_name') as string;
  const account_number = formData.get('account_number') as string;
  const account_name = formData.get('account_name') as string;
  const is_active = formData.get('is_active') === 'true';
  
  let qr_image_url = formData.get('existing_qr_url') as string;
  const qr_image_base64 = formData.get('qr_image_base64') as string;

  if (type === 'qris' && qr_image_base64) {
    const matches = qr_image_base64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!matches) {
      return { success: false, error: 'Format gambar tidak valid' };
    }
    
    const contentType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const fileExt = contentType.split('/')[1] || 'png';
    const fileName = `qris/qris-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    let { error: uploadError } = await supabase.storage
      .from(PAYMENT_BUCKET)
      .upload(fileName, buffer, {
        cacheControl: '3600',
        contentType: contentType,
        upsert: false
      });

    // Fallback: If bucket doesn't exist, try creating it first
    if (uploadError && uploadError.message.includes('bucket')) {
      await supabase.storage.createBucket(PAYMENT_BUCKET, { public: true });
      const retry = await supabase.storage
        .from(PAYMENT_BUCKET)
        .upload(fileName, buffer, {
          cacheControl: '3600',
          contentType: contentType,
          upsert: false
        });
      uploadError = retry.error;
    }

    if (uploadError) {
      return { success: false, error: 'Gagal upload gambar: ' + uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(PAYMENT_BUCKET)
      .getPublicUrl(fileName);
      
    qr_image_url = publicUrlData.publicUrl;
  }

  const payload = {
    type,
    bank_name,
    account_number: type === 'qris' ? null : account_number,
    account_name: type === 'qris' ? bank_name : account_name,
    qr_image_url: type === 'qris' ? qr_image_url : null,
    is_active
  };

  if (id) {
    const { error } = await supabase.from("payment_methods").update(payload).eq("id", id);
    if (error) return { success: false, error: error.message };
  } else {
    const { error } = await supabase.from("payment_methods").insert([payload]);
    if (error) return { success: false, error: error.message };
  }

  revalidatePath("/admin/pengaturan/pembayaran");
  return { success: true };
}

export async function deletePaymentMethod(id: number) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/pengaturan/pembayaran");
  return { success: true };
}

export async function togglePaymentMethodActive(id: number, isActive: boolean) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("payment_methods").update({ is_active: isActive }).eq("id", id);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/pengaturan/pembayaran");
  return { success: true };
}
