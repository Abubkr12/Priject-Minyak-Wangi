import { createAdminClient } from "@/lib/supabase/admin";
import PelangganClient from "./PelangganClient";

export const dynamic = 'force-dynamic';

export default async function PelangganPage() {
  const supabase = createAdminClient();
  
  // 1. Ambil data autentikasi pengguna (email, last_sign_in_at)
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  const authUsers = authData?.users || [];

  // 2. Ambil profil pelanggan
  const { data: profiles } = await supabase.from('customer_profiles').select('*');
  const profileList = profiles || [];

  // 3. Ambil riwayat pesanan (untuk menghitung order atau lihat riwayat)
  const { data: orders } = await supabase.from('orders').select('id, order_code, total, status, created_at, customer_id').order('created_at', { ascending: false });
  const orderList = orders || [];

  // 4. Ambil daftar karyawan (untuk difilter)
  const { data: adminUsers } = await supabase.from('admin_users').select('id');
  const adminIds = new Set((adminUsers || []).map(a => a.id));

  // 5. Ambil data alamat
  const { data: addresses } = await supabase.from('customer_addresses').select('*').order('is_default', { ascending: false });
  const addressList = addresses || [];

  // 6. Gabungkan data
  const customers = authUsers
    .filter(user => !adminIds.has(user.id)) // Filter out employees
    .map(user => {
    const profile = profileList.find(p => p.id === user.id) || {};
    const userOrders = orderList.filter(o => o.customer_id === user.id);
    const userAddresses = addressList.filter(a => a.customer_id === user.id);

    return {
      id: user.id,
      email: user.email || "",
      last_sign_in_at: user.last_sign_in_at,
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.city || "",
      province: profile.province || "",
      postal_code: profile.postal_code || "",
      created_at: profile.created_at || user.created_at,
      avatar_url: profile.avatar_url || "",
      orders: userOrders,
      addresses: userAddresses
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--c-ink)", marginBottom: 8 }}>
          Pelanggan
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>Kelola data pelanggan, pantau aktivitas pesanan, dan lihat riwayat login mereka.</p>
      </div>

      <PelangganClient customers={customers} />
    </div>
  );
}
