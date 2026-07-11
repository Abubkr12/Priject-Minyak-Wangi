import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/types";
import Link from "next/link";
import { Eye, Clock, CheckCircle2, Package, Truck, XCircle } from "lucide-react";

const getStatusBadge = (order: any) => {
  const status = order.status;
  
  if (status === 'pending') {
    if (order.payment_proof && order.payment_proof.startsWith('http')) {
      return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={12}/> Menunggu Konfirmasi</span>;
    }
    return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={12}/> Menunggu Pembayaran</span>;
  }

  switch (status) {
    case 'confirmed': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12}/> Dikonfirmasi</span>;
    case 'processing': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><Package size={12}/> Menunggu Pengiriman</span>;
    case 'shipped': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><Truck size={12}/> Dikirim</span>;
    case 'completed': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(168, 85, 247, 0.1)", color: "#a855f7", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={12}/> Selesai</span>;
    case 'cancelled': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(225, 29, 72, 0.1)", color: "#e11d48", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><XCircle size={12}/> Dibatalkan</span>;
    default: return <span>{status}</span>;
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

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ background: "var(--c-surface-2)", borderBottom: "1px solid var(--c-border)", textAlign: "left" }}>
              <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>ID Pesanan</th>
              <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>Pelanggan</th>
              <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>Tanggal</th>
              <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>Total</th>
              <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600, textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                <td style={{ padding: "16px", fontFamily: "monospace", color: "var(--c-gold)" }}>
                  {order.order_code}
                </td>
                <td style={{ padding: "16px" }}>
                  <div style={{ fontWeight: 500, color: "var(--c-ink)" }}>{order.customer_name}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--c-ink-muted)" }}>{order.customer_phone}</div>
                </td>
                <td style={{ padding: "16px", color: "var(--c-ink-muted)" }}>
                  {new Date(order.created_at).toLocaleDateString('id-ID')}
                </td>
                <td style={{ padding: "16px" }}>
                  {getStatusBadge(order)}
                </td>
                <td style={{ padding: "16px", color: "var(--c-ink)", fontWeight: 500 }}>
                  {formatRupiah(order.total)}
                </td>
                <td style={{ padding: "16px", textAlign: "right" }}>
                  <Link href={`/admin/pesanan/${order.id}`} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
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
