"use client";

import { useState, useMemo } from "react";
import { Search, Edit, Trash2, X, Check, Eye, Package, MapPin, Clock, KeyRound } from "lucide-react";
import { updateCustomer, deleteCustomer } from "./actions";

type CustomerOrder = {
  id: number;
  order_code: string;
  total: number;
  status: string;
  created_at: string;
};

type CustomerData = {
  id: string;
  email: string;
  last_sign_in_at?: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  created_at: string;
  avatar_url?: string;
  orders: CustomerOrder[];
  addresses: any[];
};

export default function PelangganClient({ customers }: { customers: CustomerData[] }) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"name" | "date" | "last_login">("date");
  
  // Modal States
  const [editingCustomer, setEditingCustomer] = useState<CustomerData | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<CustomerData | null>(null);
  
  // Form States for Edit
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status calculation
  const getStatus = (lastSignIn?: string) => {
    if (!lastSignIn) return { text: "Offline", color: "var(--c-ink-dim)" };
    const diffHours = (new Date().getTime() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60);
    if (diffHours < 1) return { text: "Online", color: "#10b981" }; // Active in last hour
    if (diffHours < 24) return { text: "Hari ini", color: "#3b82f6" };
    return { text: "Offline", color: "var(--c-ink-dim)" };
  };

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => 
        (c.full_name?.toLowerCase().includes(search.toLowerCase())) ||
        (c.email?.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortField === "name") return (a.full_name || "").localeCompare(b.full_name || "");
        if (sortField === "last_login") return new Date(b.last_sign_in_at || 0).getTime() - new Date(a.last_sign_in_at || 0).getTime();
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [customers, search, sortField]);

  const handleEditClick = (customer: CustomerData) => {
    setEditingCustomer(customer);
    setFormData({
      email: customer.email || "",
      password: "",
      full_name: customer.full_name || "",
      phone: customer.phone || ""
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCustomer) return;
    setIsSubmitting(true);
    try {
      const dataToUpdate: any = { ...formData };
      if (!dataToUpdate.password) delete dataToUpdate.password; // Don't send empty password
      
      const res = await updateCustomer(editingCustomer.id, dataToUpdate);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Data pelanggan berhasil diperbarui!");
        setEditingCustomer(null);
      }
    } catch (e: any) {
      alert("Terjadi kesalahan: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus pelanggan ${name}? Data tidak dapat dikembalikan.`)) {
      const res = await deleteCustomer(id);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Pelanggan berhasil dihapus.");
      }
    }
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Controls */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flexGrow: 1, maxWidth: 400 }}>
          <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-dim)" }} />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              width: "100%", padding: "12px 16px 12px 42px", 
              borderRadius: "var(--r-md)", border: "1px solid var(--c-border)",
              background: "var(--c-surface-1)", color: "var(--c-ink)"
            }}
          />
        </div>
        <select 
          value={sortField}
          onChange={(e) => setSortField(e.target.value as any)}
          style={{ 
            padding: "12px 16px", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)",
            background: "var(--c-surface-1)", color: "var(--c-ink)", cursor: "pointer"
          }}
        >
          <option value="date">Terbaru Bergabung</option>
          <option value="name">Nama (A-Z)</option>
          <option value="last_login">Login Terakhir</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: 800, borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "var(--c-surface-2)", borderBottom: "1px solid var(--c-border)" }}>
            <tr>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Pelanggan</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Kontak</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Status & Aktivitas</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "var(--c-ink-dim)" }}>
                  Tidak ada pelanggan yang ditemukan.
                </td>
              </tr>
            ) : (
              filteredCustomers.map(c => {
                const status = getStatus(c.last_sign_in_at);
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--c-border)", transition: "background 0.2s" }} onMouseOver={e => e.currentTarget.style.background = 'var(--c-surface-2)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--c-gold)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                          {c.full_name ? c.full_name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--c-ink)" }}>{c.full_name || "Tanpa Nama"}</div>
                          <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>Bergabung: {new Date(c.created_at).toLocaleDateString("id-ID")}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ color: "var(--c-ink)" }}>{c.email}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>{c.phone || "No HP belum diisi"}</div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: status.color, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: status.color }}></div>
                        {status.text}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>
                        {c.last_sign_in_at ? `Login: ${new Date(c.last_sign_in_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}` : 'Belum pernah login'}
                      </div>
                      <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginTop: 4 }}>
                        Pesanan: {c.orders.length} transaksi
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={() => setViewingCustomer(c)} style={{ padding: "8px", borderRadius: "var(--r-sm)", border: "none", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", cursor: "pointer" }} title="Lihat Detail">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => handleEditClick(c)} style={{ padding: "8px", borderRadius: "var(--r-sm)", border: "none", background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", cursor: "pointer" }} title="Edit Akun">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(c.id, c.full_name || 'Pelanggan')} style={{ padding: "8px", borderRadius: "var(--r-sm)", border: "none", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", cursor: "pointer" }} title="Hapus Akun">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingCustomer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: 24 }}>
          <div style={{ background: "var(--c-surface-1)", padding: 32, borderRadius: "var(--r-lg)", width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setEditingCustomer(null)} style={{ position: "absolute", right: 24, top: 24, background: "none", border: "none", cursor: "pointer", color: "var(--c-ink-dim)" }}><X size={24} /></button>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 24, color: "var(--c-ink)" }}>Edit Akun: {editingCustomer.full_name || 'Tanpa Nama'}</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 8 }}>Nama Lengkap</label>
                  <input type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", color: "var(--c-ink)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 8 }}>No. Telepon</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", color: "var(--c-ink)" }} />
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 8 }}>Email (Auth)</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: "100%", padding: "10px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", color: "var(--c-ink)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 8 }}>Password Baru (Kosongkan jika tak diubah)</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Ketik password baru..." style={{ width: "100%", padding: "10px", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", color: "var(--c-ink)" }} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
                <button onClick={() => setEditingCustomer(null)} disabled={isSubmitting} style={{ padding: "12px 24px", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-ink)", cursor: "pointer" }}>Batal</button>
                <button onClick={handleSaveEdit} disabled={isSubmitting} style={{ padding: "12px 24px", borderRadius: "var(--r-md)", border: "none", background: "var(--c-gold)", color: "#fff", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <Check size={18} /> {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingCustomer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", padding: 24 }}>
          <div style={{ background: "var(--c-surface-1)", padding: 32, borderRadius: "var(--r-lg)", width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
            <button onClick={() => setViewingCustomer(null)} style={{ position: "absolute", right: 24, top: 24, background: "none", border: "none", cursor: "pointer", color: "var(--c-ink-dim)" }}><X size={24} /></button>
            <h2 style={{ fontSize: "1.5rem", marginBottom: 24, color: "var(--c-ink)" }}>Detail Pelanggan</h2>
            
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--c-border)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--c-gold)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: "bold" }}>
                {viewingCustomer.full_name ? viewingCustomer.full_name.charAt(0).toUpperCase() : "?"}
              </div>
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ fontSize: "1.2rem", color: "var(--c-ink)", margin: "0 0 4px 0" }}>{viewingCustomer.full_name || "Tanpa Nama"}</h3>
                <div style={{ color: "var(--c-ink-dim)", marginBottom: 4 }}>{viewingCustomer.email}</div>
                <div style={{ color: "var(--c-ink-dim)" }}>{viewingCustomer.phone || "-"}</div>
              </div>
            </div>

            <h4 style={{ fontSize: "1rem", color: "var(--c-ink)", marginBottom: 12 }}>Alamat Tersimpan ({viewingCustomer.addresses.length})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {viewingCustomer.addresses.length === 0 ? (
                <div style={{ padding: 16, background: "var(--c-surface-2)", borderRadius: "var(--r-md)", color: "var(--c-ink-dim)", textAlign: "center" }}>
                  Belum ada alamat tersimpan.
                </div>
              ) : (
                viewingCustomer.addresses.map(addr => (
                  <div key={addr.id} style={{ background: "var(--c-surface-2)", padding: 16, borderRadius: "var(--r-md)", color: "var(--c-ink)", display: "flex", gap: 12 }}>
                    <MapPin style={{ color: "var(--c-gold)", flexShrink: 0 }} />
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <strong style={{ color: "var(--c-ink)" }}>{addr.label}</strong>
                        {addr.is_default && (
                          <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: 4, fontWeight: 600 }}>Utama</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>{addr.recipient_name} • {addr.phone}</div>
                      <div style={{ fontSize: "0.9rem", marginTop: 4 }}>{addr.full_address}</div>
                      {addr.maps_latitude && addr.maps_longitude && (
                        <div style={{ marginTop: 8 }}>
                          <a 
                            href={`https://maps.google.com/?q=${addr.maps_latitude},${addr.maps_longitude}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ fontSize: "0.85rem", color: "#3b82f6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                          >
                            <MapPin size={14} /> Lihat di Peta (Koordinat Tersimpan)
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <h4 style={{ fontSize: "1rem", color: "var(--c-ink)", marginBottom: 12 }}>Riwayat Pesanan ({viewingCustomer.orders.length})</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {viewingCustomer.orders.length === 0 ? (
                <div style={{ padding: 16, background: "var(--c-surface-2)", borderRadius: "var(--r-md)", color: "var(--c-ink-dim)", textAlign: "center" }}>
                  Belum ada transaksi.
                </div>
              ) : (
                viewingCustomer.orders.map(order => (
                  <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 16, background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--c-ink)" }}>#{order.order_code}</div>
                      <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={12} /> {new Date(order.created_at).toLocaleDateString("id-ID")}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 600, color: "var(--c-gold)" }}>{formatRp(order.total)}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--c-ink)", textTransform: "uppercase", background: "var(--c-surface-2)", padding: "2px 8px", borderRadius: 4, display: "inline-block", marginTop: 4 }}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
