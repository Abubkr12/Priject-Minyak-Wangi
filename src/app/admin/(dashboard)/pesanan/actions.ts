"use server";

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createAdminClient();

export async function updateResiStatus(formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const waybillNumber = formData.get('waybillNumber') as string;

  if (!orderId) throw new Error('Order ID hilang');

  const newStatus = waybillNumber && waybillNumber.trim().length > 0 ? 'shipped' : 'processing';

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ 
      waybill_number: waybillNumber,
      status: newStatus
    })
    .eq('id', orderId);

  if (error) {
    throw new Error('Gagal update resi: ' + error.message);
  }

  revalidatePath('/admin/pesanan');
  revalidatePath(`/admin/pesanan/${orderId}`);
  revalidatePath('/pesanan'); // update the customer side too
}

export async function markAsPaid(orderId: string) {
  const { error } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'processing',
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      payment_verified_at: new Date().toISOString()
    })
    .eq('id', orderId);

  if (error) {
    throw new Error('Gagal update status: ' + error.message);
  }

  revalidatePath('/admin/pesanan');
  revalidatePath(`/admin/pesanan/${orderId}`);
  revalidatePath('/pesanan');
}
