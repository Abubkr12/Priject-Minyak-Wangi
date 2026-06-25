"use client";

import { useState, useEffect } from "react";
import { X, Save, Tag, Percent, Truck, Calendar, Hash, Type, Coins, CreditCard, Box, Check, MapPin } from "lucide-react";
import { saveVoucher } from "./actions";
import { format } from "date-fns";

export default function VoucherForm({
  voucher,
  onClose,
  onSuccess,
}: {
  voucher: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "fixed",
    value: 0,
    min_purchase: 0,
    max_discount: 0,
    coverage_area: "Seluruh Indonesia",
    quota: 0,
    valid_from: "",
    valid_until: "",
    is_active: true,
  });

  useEffect(() => {
    if (voucher) {
      setFormData({
        ...voucher,
        valid_from: voucher.valid_from ? format(new Date(voucher.valid_from), "yyyy-MM-dd'T'HH:mm") : "",
        valid_until: voucher.valid_until ? format(new Date(voucher.valid_until), "yyyy-MM-dd'T'HH:mm") : "",
        coverage_area: voucher.coverage_area || "Seluruh Indonesia",
      });
    } else {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setFormData((prev) => ({
        ...prev,
        valid_from: format(now, "yyyy-MM-dd'T'HH:mm"),
        valid_until: format(nextWeek, "yyyy-MM-dd'T'HH:mm"),
      }));
    }
  }, [voucher]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...(voucher?.id ? { id: voucher.id } : {}),
        ...formData,
        valid_from: formData.valid_from ? new Date(formData.valid_from).toISOString() : null,
        valid_until: formData.valid_until ? new Date(formData.valid_until).toISOString() : null,
      };

      const res = await saveVoucher(payload);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan voucher");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label style={{ 
      display: "block", 
      fontSize: "0.75rem", 
      textTransform: "uppercase", 
      letterSpacing: "0.5px", 
      color: "var(--c-ink-dim)", 
      fontWeight: 600, 
      marginBottom: 8 
    }}>
      {children}
    </label>
  );

  const InputWrapper = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
    <div style={{ 
      position: "relative", 
      display: "flex", 
      alignItems: "center",
      background: "var(--bg-color)",
      border: "1px solid var(--c-border)",
      borderRadius: "var(--r-md)",
      transition: "all 0.2s ease",
      overflow: "hidden"
    }}>
      <div style={{ padding: "0 12px", color: "var(--c-ink-muted)", display: "flex", alignItems: "center" }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );

  const baseInputStyle = {
    width: "100%",
    background: "transparent",
    border: "none",
    padding: "12px 12px 12px 0",
    color: "var(--c-ink)",
    fontSize: "0.95rem",
    outline: "none"
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 20
    }}>
      <div className="modal-content animate-fade-up" onClick={(e) => e.stopPropagation()} style={{
        background: "var(--c-surface-1)", borderRadius: "var(--r-lg)",
        width: "100%", maxWidth: 640,
        display: "flex", flexDirection: "column", maxHeight: "90vh",
        boxShadow: "0 24px 48px rgba(0,0,0,0.2), 0 0 0 1px var(--c-border)"
      }}>
        {/* Header */}
        <div style={{
          padding: "24px 32px", borderBottom: "1px solid var(--c-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--c-ink)" }}>
              {voucher ? "Edit Voucher" : "Voucher Baru"}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--c-ink-muted)", marginTop: 4 }}>
              Atur promosi dan diskon untuk pelanggan
            </p>
          </div>
          <button onClick={onClose} style={{ 
            background: "transparent", border: "none", color: "var(--c-ink-dim)", 
            cursor: "pointer", padding: 8, display: "flex", borderRadius: "50%",
            transition: "background 0.2s"
          }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "32px", overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
          {error && (
            <div style={{
              padding: "12px 16px", background: "rgba(225, 29, 72, 0.1)", color: "#e11d48",
              borderRadius: "var(--r-md)", marginBottom: 24, fontSize: "0.85rem",
              border: "1px solid rgba(225, 29, 72, 0.2)", display: "flex", alignItems: "center", gap: 8
            }}>
              <X size={16} />
              {error}
            </div>
          )}

          <form id="voucher-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Grid 2 Columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Label>Kode Voucher *</Label>
                <InputWrapper icon={Hash}>
                  <input
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., MERDEKA50"
                    style={{ ...baseInputStyle, textTransform: "uppercase", fontFamily: "monospace", letterSpacing: "1px" }}
                  />
                </InputWrapper>
              </div>
              <div>
                <Label>Nama Voucher *</Label>
                <InputWrapper icon={Type}>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Diskon Kemerdekaan"
                    style={baseInputStyle}
                  />
                </InputWrapper>
              </div>
            </div>

            {/* Discount Type */}
            <div>
              <Label>Tipe Diskon *</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                {[
                  { id: "fixed", label: "Nominal", icon: Coins },
                  { id: "percentage", label: "Persentase", icon: Percent },
                  { id: "free_shipping", label: "Gratis Ongkir", icon: Truck },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: t.id })}
                    style={{
                      padding: "16px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, 
                      borderRadius: "var(--r-md)",
                      border: formData.type === t.id ? "1px solid var(--c-gold)" : "1px solid var(--c-border)",
                      background: formData.type === t.id ? "var(--c-gold-dim)" : "var(--bg-color)",
                      color: formData.type === t.id ? "var(--c-gold)" : "var(--c-ink-muted)",
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    <t.icon size={18} />
                    <span style={{ fontSize: "0.9rem", fontWeight: formData.type === t.id ? 600 : 500, color: formData.type === t.id ? "var(--c-gold)" : "var(--c-ink)" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Values */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Label>{formData.type === "free_shipping" ? "Maks. Potongan Ongkir *" : "Nilai Diskon *"}</Label>
                <InputWrapper icon={Tag}>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    placeholder={formData.type === "percentage" ? "10" : "50000"}
                    style={baseInputStyle}
                  />
                </InputWrapper>
              </div>

              {formData.type === "percentage" && (
                <div>
                  <Label>Maksimal Diskon (Opsional)</Label>
                  <InputWrapper icon={CreditCard}>
                    <input
                      type="number"
                      min={0}
                      value={formData.max_discount || ""}
                      onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                      placeholder="e.g., 50000"
                      style={baseInputStyle}
                    />
                  </InputWrapper>
                </div>
              )}
              {formData.type === "free_shipping" && (
                <div>
                  <Label>Cakupan Wilayah</Label>
                  <InputWrapper icon={MapPin}>
                    <select
                      value={formData.coverage_area}
                      onChange={(e) => setFormData({ ...formData, coverage_area: e.target.value })}
                      style={{ ...baseInputStyle, cursor: "pointer", paddingRight: 32 }}
                    >
                      <option value="Seluruh Indonesia">Seluruh Indonesia</option>
                      <option value="Pulau Jawa">Pulau Jawa</option>
                      <option value="Jabodetabek">Jabodetabek</option>
                      <option value="Pulau Sumatera">Pulau Sumatera</option>
                      <option value="Pulau Kalimantan">Pulau Kalimantan</option>
                      <option value="Pulau Sulawesi">Pulau Sulawesi</option>
                      <option value="Bali & Nusa Tenggara">Bali & Nusa Tenggara</option>
                      <option value="Maluku & Papua">Maluku & Papua</option>
                    </select>
                  </InputWrapper>
                </div>
              )}
            </div>

            {/* Constraints */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Label>Minimal Belanja (Opsional)</Label>
                <InputWrapper icon={CreditCard}>
                  <input
                    type="number"
                    min={0}
                    value={formData.min_purchase || ""}
                    onChange={(e) => setFormData({ ...formData, min_purchase: Number(e.target.value) })}
                    placeholder="e.g., 100000"
                    style={baseInputStyle}
                  />
                </InputWrapper>
              </div>

              <div>
                <Label>Kuota Penggunaan</Label>
                <InputWrapper icon={Box}>
                  <input
                    type="number"
                    min={0}
                    value={formData.quota || ""}
                    onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
                    placeholder="0 = Tak Terbatas"
                    style={baseInputStyle}
                  />
                </InputWrapper>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div>
                <Label>Berlaku Dari *</Label>
                <InputWrapper icon={Calendar}>
                  <input
                    type="datetime-local"
                    required
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                    style={baseInputStyle}
                  />
                </InputWrapper>
              </div>
              <div>
                <Label>Berlaku Sampai *</Label>
                <InputWrapper icon={Calendar}>
                  <input
                    type="datetime-local"
                    required
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                    style={baseInputStyle}
                  />
                </InputWrapper>
              </div>
            </div>

            {/* Toggle */}
            <div style={{ 
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", background: "var(--bg-color)", 
              borderRadius: "var(--r-md)", border: "1px solid var(--c-border)"
            }}>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 4 }}>Status Voucher Aktif</div>
                <div style={{ fontSize: "0.8rem", color: "var(--c-ink-muted)" }}>Voucher dapat langsung digunakan pelanggan</div>
              </div>
              <button
                type="button"
                onClick={() => setFormData(p => ({ ...p, is_active: !p.is_active }))}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: formData.is_active ? "var(--c-gold)" : "var(--c-border)",
                  border: "none", position: "relative", cursor: "pointer",
                  transition: "background 0.3s"
                }}
              >
                <div style={{
                  position: "absolute", top: 2, left: formData.is_active ? 22 : 2,
                  width: 20, height: 20, borderRadius: "50%", background: "#fff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  transition: "left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                }} />
              </button>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: "20px 32px", borderTop: "1px solid var(--c-border)",
          display: "flex", justifyContent: "flex-end", gap: 12,
        }}>
          <button type="button" onClick={onClose} disabled={loading} style={{ 
            padding: "10px 16px", background: "transparent", border: "1px solid var(--c-border)", 
            borderRadius: "var(--r-md)", color: "var(--c-ink)", fontWeight: 500, cursor: "pointer" 
          }}>
            Batal
          </button>
          <button type="submit" form="voucher-form" disabled={loading} style={{ 
            padding: "10px 16px", background: "var(--c-gold)", border: "none", 
            borderRadius: "var(--r-md)", color: "#fff", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: 8 
          }}>
            {loading ? <div className="animate-spin" style={{ width: 16, height: 16, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%" }} /> : <Check size={18} />}
            <span>{voucher ? "Simpan Perubahan" : "Simpan Voucher"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
