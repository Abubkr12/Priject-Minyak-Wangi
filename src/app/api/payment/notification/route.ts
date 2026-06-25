import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Gunakan Service Role Key untuk bypass RLS karena ini dipanggil oleh Midtrans (server-to-server)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Verifikasi Signature Key Midtrans untuk Keamanan
    const signatureKey = crypto
      .createHash('sha512')
      .update(data.order_id + data.status_code + data.gross_amount + process.env.MIDTRANS_SERVER_KEY)
      .digest('hex');

    if (signatureKey !== data.signature_key) {
      return NextResponse.json({ message: 'Invalid signature key' }, { status: 401 });
    }

    const orderId = data.order_id;
    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;
    const paymentMethod = data.payment_type;

    let orderStatus = 'pending';

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        orderStatus = 'pending'; // challenge
      } else if (fraudStatus == 'accept') {
        orderStatus = 'confirmed';
      }
    } else if (transactionStatus == 'settlement') {
      orderStatus = 'confirmed';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      orderStatus = 'cancelled';
    } else if (transactionStatus == 'pending') {
      orderStatus = 'pending';
    }

    // Update database
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: orderStatus,
        payment_method: paymentMethod 
      })
      .eq('order_code', orderId);

    if (error) {
      console.error('Webhook Supabase Error:', error);
      return NextResponse.json({ message: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OK' });

  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
