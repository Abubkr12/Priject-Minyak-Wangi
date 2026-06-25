import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/types";
import Link from "next/link";
import { Eye, Clock, CheckCircle2, Package, Truck, XCircle } from "lucide-react";

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending': return <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", padding: "4px 10px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", borderRadius: 100 }}><Clock size={12} /> Tertunda</span>;
    case 'confirmed': return <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", padding: "4px 10px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: 100 }}><CheckCircle2 size={12} /> Dikonfirmasi</span>;
    case 'processing': return <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", padding: "4px 10px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", borderRadius: 100 }}><Package size={12} /> Diproses</span>;
    case 'shipped': return <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", padding: "4px 10px", background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", borderRadius: 100 }}><Truck size={12} /> Dikirim</span>;
    case 'completed': return <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", padding: "4px 10px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: 100 }}><CheckCircle2 size={12} /> Selesai</span>;
    case 'cancelled': return <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", padding: "4px 10px", background: "rgba(225, 29, 72, 0.1)", color: "#e11d48", borderRadius: 100 }}><XCircle size={12} /> Dibatalkan</span>;
    default: return <span style={{ fontSize: "0.8rem" }}>{status}</span>;
  }
}

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .order('created_at', { ascending: false });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--c-ink)", fontWeight: 400, marginBottom: 8 }}>
          Daftar Pesanan
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>Kelola semua pesanan pelanggan, proses pengiriman, dan input resi.</p>
      </div>

      <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--glass-bg)", borderBottom: "1px solid var(--c-border)", textAlign: "left", fontSize: "0.85rem", color: "var(--c-ink-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <th style={{ padding: "16px 24px", fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: "16px 24px", fontWeight: 600 }}>Pelanggan</th>
              <th style={{ padding: "16px 24px", fontWeight: 600 }}>Tanggal</th>
              <th style={{ padding: "16px 24px", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "16px 24px", fontWeight: 600 }}>Total</th>
              <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid var(--c-border)", transition: "background 0.2s" }} className="hover:bg-black/5 dark:hover:bg-white/5">
                <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: "var(--c-ink)", fontWeight: 500 }}>
                  {order.order_code}
                </td>
                <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: "var(--c-ink)" }}>
                  <div>{order.customer_name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)" }}>{order.customer_phone}</div>
                </td>
                <td style={{ padding: "16px 24px", fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>
                  {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td style={{ padding: "16px 24px" }}>
                  {getStatusBadge(order.status)}
                </td>
                <td style={{ padding: "16px 24px", fontSize: "0.9rem", color: "var(--c-gold)", fontWeight: 600 }}>
                  {formatRupiah(order.total)}
                </td>
                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                  <Link href={`/admin/pesanan/${order.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, transition: "all 0.2s" }}>
                    <Eye size={14} /> Detail
                  </Link>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--c-ink-dim)", fontSize: "0.9rem" }}>
                  Belum ada pesanan masuk.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
