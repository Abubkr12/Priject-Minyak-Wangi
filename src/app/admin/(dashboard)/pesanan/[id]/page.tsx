import { createAdminClient } from "@/lib/supabase/admin";
import { formatRupiah } from "@/lib/types";
import Link from "next/link";
import { ChevronLeft, Truck, Package, User, MapPin } from "lucide-react";
import { markAsPaid, updateResiStatus } from "../actions";

export default async function AdminOrderDetail({ params }: { params: { id: string } }) {
  const supabase = createAdminClient();
  const { id } = params;

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) {
    return <div>Pesanan tidak ditemukan.</div>;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <Link href="/admin/pesanan" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--c-ink-dim)", fontSize: "0.9rem", marginBottom: 16 }}>
          <ChevronLeft size={16} /> Kembali ke Daftar Pesanan
        </Link>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--c-ink)", fontWeight: 400, marginBottom: 8, display: "flex", alignItems: "center", gap: 16 }}>
          Detail Pesanan <span style={{ fontSize: "1.2rem", padding: "4px 12px", background: "var(--glass-bg)", border: "1px solid var(--c-gold)", color: "var(--c-gold)", borderRadius: 100 }}>{order.order_code}</span>
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>
          Dibuat pada {new Date(order.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 32, alignItems: "start" }}>
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Order Items */}
          <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 20 }}>
              <Package size={18} style={{ color: "var(--c-gold)" }} />
              Daftar Produk
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {items?.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid var(--c-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 48, height: 48, background: "var(--glass-bg)", borderRadius: "var(--r-md)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, color: "var(--c-gold)" }}>
                      {item.quantity}x
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, color: "var(--c-ink)" }}>{item.perfume_name}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)" }}>Ukuran: {item.size_label}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--c-ink)" }}>
                    {formatRupiah(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
              <div style={{ display: "flex", width: 300, justifyContent: "space-between", fontSize: "0.9rem", color: "var(--c-ink-muted)" }}>
                <span>Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              <div style={{ display: "flex", width: 300, justifyContent: "space-between", fontSize: "0.9rem", color: "var(--c-ink-muted)" }}>
                <span>Ongkos Kirim {order.courier_name ? `(${order.courier_name})` : ''}</span>
                <span>{formatRupiah(order.shipping_cost || 0)}</span>
              </div>
              {order.unique_code > 0 && (
                <div style={{ display: "flex", width: 300, justifyContent: "space-between", fontSize: "0.9rem", color: "var(--c-ink-muted)" }}>
                  <span>Kode Unik</span>
                  <span style={{ color: "var(--c-gold)" }}>+{order.unique_code}</span>
                </div>
              )}
              <div style={{ height: 1, width: 300, background: "var(--c-border)", margin: "8px 0" }} />
              <div style={{ display: "flex", width: 300, justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 600, color: "var(--c-gold)" }}>
                <span>Total Pembayaran</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Customer Info */}
          <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 20 }}>
              <User size={18} style={{ color: "var(--c-gold)" }} />
              Informasi Pelanggan
            </h2>
            <div style={{ fontSize: "0.9rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 4 }}>{order.customer_name}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 16 }}>{order.customer_phone}</div>
            
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>
              <MapPin size={16} style={{ color: "var(--c-ink-muted)", flexShrink: 0, marginTop: 2 }} />
              <div style={{ lineHeight: 1.5 }}>{order.customer_address}</div>
            </div>
          </div>

          {/* Shipping Update Form */}
          <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 20 }}>
              <Truck size={18} style={{ color: "var(--c-gold)" }} />
              Status Pengiriman
            </h2>
            
            <div style={{ padding: "12px", background: "var(--glass-bg)", borderRadius: "var(--r-md)", fontSize: "0.85rem", color: "var(--c-ink)", marginBottom: 20, border: "1px solid var(--glass-border)" }}>
              {order.notes}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 12, background: "var(--c-surface-2)", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--c-ink-dim)", marginBottom: 4 }}>Metode Bayar</div>
                <div style={{ fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 600 }}>{order.payment_method || "Manual"}</div>
              </div>
              <div style={{ padding: 12, background: "var(--c-surface-2)", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--c-ink-dim)", marginBottom: 4 }}>Status Bayar</div>
                <div style={{ fontSize: "0.85rem", color: order.payment_status === "paid" ? "var(--c-teal)" : "var(--c-gold)", fontWeight: 600 }}>{order.payment_status || "unpaid"}</div>
              </div>
            </div>

            <form action={updateResiStatus} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 8 }}>Nomor Resi (AWB)</label>
                <input 
                  type="text" 
                  name="waybillNumber" 
                  defaultValue={order.waybill_number || ''}
                  className="input-field" 
                  style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} 
                  placeholder="Misal: JP71829038" 
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: "100%", justifyContent: "center", padding: "12px" }}
              >
                Tandai Sudah Dikirim
              </button>

              {order.status === 'pending' && (
                <div style={{ marginTop: 24, padding: 16, background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "var(--r-md)" }}>
                  
                  {order.payment_notes && order.payment_notes.startsWith('http') ? (
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: "0.85rem", color: "#ca8a04", marginBottom: 8, fontWeight: 600 }}>Customer telah mengunggah bukti pembayaran:</div>
                        <a href={order.payment_notes} target="_blank" rel="noopener noreferrer">
                            <img src={order.payment_notes} alt="Bukti Pembayaran" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)', background: 'var(--bg-color)', display: 'block', cursor: 'zoom-in' }} />
                        </a>
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.85rem", color: "#ca8a04", marginBottom: 12 }}>
                        Status pesanan masih <b>Tertunda (Belum Dibayar)</b>. Customer belum mengunggah bukti pembayaran. Cek mutasi rekening Anda secara berkala.
                    </div>
                  )}

                  <button
                    type="submit"
                    formAction={async () => {
                    "use server";
                    await markAsPaid(order.id);
                  }}
                    style={{ width: "100%", padding: "10px", background: "#ca8a04", color: "#fff", border: "none", borderRadius: "var(--r-md)", fontWeight: 600, cursor: "pointer", marginTop: 8 }}
                  >
                    Verifikasi Pembayaran (Tandai Lunas)
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
