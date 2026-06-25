import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // The data object contains status from Midtrans
    // Example: { order_id: 'MW-XXX', transaction_status: 'settlement', ... }
    const orderId = data.order_id;
    const transactionStatus = data.transaction_status;
    const fraudStatus = data.fraud_status;

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID not found' }, { status: 400 });
    }

    let newStatus = 'pending';

    if (transactionStatus == 'capture') {
        if (fraudStatus == 'challenge') {
          newStatus = 'pending';
        } else if (fraudStatus == 'accept') {
          newStatus = 'paid';
        }
    } else if (transactionStatus == 'settlement') {
        newStatus = 'paid';
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
        newStatus = 'cancelled';
    } else if (transactionStatus == 'pending') {
        newStatus = 'pending';
    }

    // Update the database
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('order_code', orderId);

    if (error) {
      console.error('Webhook DB Error:', error);
      return NextResponse.json({ message: 'Failed to update order status' }, { status: 500 });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Webhook parsing error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
