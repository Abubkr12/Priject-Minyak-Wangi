import { createClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/types";
import { Package, TrendingUp, Users } from "lucide-react";
import SalesChart from "./SalesChart";

export default async function AdminDashboard() {
  const supabase = await createClient(true);
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name || 'Admin';

  // Fetch some quick stats
  const { data: orders } = await supabase.from("orders").select("total, status, created_at").neq('status', 'cancelled');
  
  const totalRevenue = orders?.filter(o => o.status !== 'pending').reduce((sum, o) => sum + o.total, 0) || 0;
  const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;
  const paidOrders = orders?.filter(o => o.status === 'paid').length || 0;
  const totalOrders = orders?.length || 0;

  // Process data for the last 7 days chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
  });

  const chartData = last7Days.map(dateLabel => {
    return {
      name: dateLabel,
      total: orders?.filter(o => {
        if (o.status === 'pending') return false;
        const orderDate = new Date(o.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        return orderDate === dateLabel;
      }).reduce((sum, o) => sum + o.total, 0) || 0
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--c-ink)", fontWeight: 400, marginBottom: 8 }}>
          Selamat Datang, {userName}!
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>Berikut adalah ringkasan performa toko Anda hari ini.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(201, 169, 108, 0.1)", color: "var(--c-gold)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--c-ink-muted)", marginBottom: 4 }}>Total Pendapatan (Sukses)</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--c-ink)" }}>{formatRupiah(totalRevenue)}</div>
          </div>
        </div>

        <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--c-ink-muted)", marginBottom: 4 }}>Pesanan Perlu Diproses</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--c-ink)", display: "flex", gap: 12, alignItems: "center" }}>
              {paidOrders} <span style={{ fontSize: "0.8rem", padding: "4px 8px", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", borderRadius: 100 }}>{pendingOrders} Belum Dibayar</span>
            </div>
          </div>
        </div>

        <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: "0.85rem", color: "var(--c-ink-muted)", marginBottom: 4 }}>Total Pesanan Keseluruhan</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--c-ink)" }}>{totalOrders}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Sales Chart Area */}
        <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 24 }}>Grafik Penjualan (7 Hari Terakhir)</h2>
          <SalesChart data={chartData} />
        </div>

        {/* Quick Actions / Helpers */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--glass-bg)", border: "1px dashed var(--c-gold)", borderRadius: "var(--r-lg)", padding: 24, color: "var(--c-ink)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--c-gold)", marginBottom: 8 }}>Tips Admin 💡</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", lineHeight: 1.6 }}>
              Selalu pantau tab <b>Pesanan</b> untuk melihat pelanggan yang sudah membayar. Segera input <b>Nomor Resi</b> agar pembeli merasa aman dan status pesanan berubah menjadi Dikirim.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
