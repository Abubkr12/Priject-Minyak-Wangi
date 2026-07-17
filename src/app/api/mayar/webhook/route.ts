import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  try {
    // Verifikasi Token Webhook Mayar
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '').trim();
    
    // Pastikan token cocok dengan MAYAR_WEBHOOK_TOKEN di .env.local
    if (token !== process.env.MAYAR_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    
    // Log payload untuk debugging nanti (bisa dihapus saat production stabil)
    console.log('Mayar Webhook Payload:', payload);

    // Ambil data penting dari payload Mayar
    // Biasanya Mayar mengirimkan `status`, `reference_id` (sebagai order_code), dsb.
    const status = payload.status; 
    const orderCode = payload.reference_id; // Sesuaikan dengan field reference dari Mayar

    if (!orderCode) {
      return NextResponse.json({ error: 'Missing reference_id' }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();

    // Map status dari Mayar ke status order kita
    let orderStatus = 'pending';
    if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAID') {
      orderStatus = 'paid';
    } else if (status === 'FAILED' || status === 'EXPIRED' || status === 'CANCELED') {
      orderStatus = 'cancelled';
    }

    // Update status pesanan di database
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: orderStatus })
      .eq('order_code', orderCode);

    if (error) {
      console.error('Failed to update order status:', error);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Webhook received and processed' });
  } catch (error: any) {
    console.error('Mayar Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
