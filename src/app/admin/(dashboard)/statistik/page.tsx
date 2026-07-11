import React from 'react';
import { createClient } from '@/lib/supabase/server';
import StatistikClient from './StatistikClient';

export default async function StatistikPage() {
  const supabase = await createClient(true);
  
  // Ambil semua order, filter by successful statuses di client, atau ambil sukses saja. 
  // Biar bisa lihat riwayat transaksi lengkap, kita ambil semua, tapi client filter
  const { data: orders, error } = await supabase
    .from('orders')
    .select('id, order_code, customer_name, total, status, created_at, payment_method')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error.message);
  }

  return (
    <div>
      <StatistikClient initialOrders={orders || []} />
    </div>
  );
}
