"use client";

import { useState, useEffect } from "react";
import { X, Save, Building, Hash, User, ImageIcon, CreditCard, QrCode } from "lucide-react";
import { savePaymentMethod } from "./actions";
import { toast } from "sonner";

export default function PaymentMethodForm({
  paymentMethod,
  onClose,
  onSuccess,
}: {
  paymentMethod: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    type: "bank_transfer",
    bank_name: "",
    account_number: "",
    account_name: "",
    qr_image_url: "",
    is_active: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (paymentMethod) {
      setFormData({
        type: paymentMethod.type,
        bank_name: paymentMethod.bank_name || "",
        account_number: paymentMethod.account_number || "",
        account_name: paymentMethod.account_name || "",
        qr_image_url: paymentMethod.qr_image_url || "",
        is_active: paymentMethod.is_active,
      });
      if (paymentMethod.qr_image_url) {
        setPreviewImage(paymentMethod.qr_image_url);
      }
    }
  }, [paymentMethod]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      if (paymentMethod?.id) submitData.append("id", paymentMethod.id.toString());
      
      submitData.append("type", formData.type);
      submitData.append("bank_name", formData.bank_name);
      submitData.append("is_active", formData.is_active.toString());
      
      if (formData.type === "bank_transfer") {
        submitData.append("account_number", formData.account_number);
        submitData.append("account_name", formData.account_name);
      }
      
      if (formData.type === "qris") {
        if (formData.qr_image_url) submitData.append("existing_qr_url", formData.qr_image_url);
        if (imageFile) {
          // Convert file to base64 to avoid Next.js FormData file serialization issues
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          });
          submitData.append("qr_image_base64", base64);
        } else if (!formData.qr_image_url) {
          throw new Error("Gambar QRIS wajib diunggah");
        }
      }

      const res = await savePaymentMethod(submitData);
      if (!res.success) throw new Error(res.error || "Gagal menyimpan metode pembayaran");
      
      toast.success("Berhasil menyimpan metode pembayaran!");
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display: "block", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--c-ink-dim)", fontWeight: 600, marginBottom: 8 }}>
      {children}
    </label>
  );

  const InputWrapper = ({ icon: Icon, children }: { icon: any, children: React.ReactNode }) => (
    <div style={{ position: "relative", display: "flex", alignItems: "center", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", transition: "all 0.2s ease", overflow: "hidden" }}>
      <div style={{ padding: "0 12px", color: "var(--c-ink-muted)", display: "flex", alignItems: "center" }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );

  const baseInputStyle = { width: "100%", background: "transparent", border: "none", padding: "12px 12px 12px 0", color: "var(--c-ink)", fontSize: "0.95rem", outline: "none" };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
      <div className="modal-content animate-fade-up" onClick={(e) => e.stopPropagation()} style={{ background: "var(--c-surface-1)", borderRadius: "var(--r-lg)", width: "100%", maxWidth: 640, display: "flex", flexDirection: "column", maxHeight: "90vh", boxShadow: "0 24px 48px rgba(0,0,0,0.2), 0 0 0 1px var(--c-border)" }}>
        {/* Header */}
        <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--c-ink)" }}>{paymentMethod ? "Edit Metode Pembayaran" : "Metode Pembayaran Baru"}</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--c-ink-muted)", marginTop: 4 }}>Atur rincian rekening untuk transfer pelanggan</p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--c-ink-dim)", cursor: "pointer", padding: 8, display: "flex", borderRadius: "50%", transition: "background 0.2s" }}><X size={20} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: "32px", overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(225, 29, 72, 0.1)", color: "#e11d48", borderRadius: "var(--r-md)", marginBottom: 24, fontSize: "0.85rem", border: "1px solid rgba(225, 29, 72, 0.2)", display: "flex", alignItems: "center", gap: 8 }}><X size={16} />{error}</div>
          )}

          <form id="payment-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Tipe Pembayaran */}
            <div>
              <Label>Tipe Metode Pembayaran *</Label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { id: "bank_transfer", label: "Transfer Bank", icon: CreditCard },
                  { id: "qris", label: "QRIS Statis", icon: QrCode },
                ].map((t) => (
                  <button
                    key={t.id} type="button"
                    onClick={() => setFormData({ ...formData, type: t.id })}
                    style={{ padding: "16px 12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: "var(--r-md)", border: formData.type === t.id ? "1px solid var(--c-gold)" : "1px solid var(--c-border)", background: formData.type === t.id ? "var(--c-gold-dim)" : "var(--bg-color)", color: formData.type === t.id ? "var(--c-gold)" : "var(--c-ink-muted)", cursor: "pointer", transition: "all 0.2s" }}
                  >
                    <t.icon size={18} />
                    <span style={{ fontSize: "0.9rem", fontWeight: formData.type === t.id ? 600 : 500, color: formData.type === t.id ? "var(--c-gold)" : "var(--c-ink)" }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>{formData.type === "qris" ? "Nama QRIS *" : "Nama Bank *"}</Label>
              <InputWrapper icon={Building}>
                <input required value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder={formData.type === "qris" ? "e.g., QRIS Ela Parfum" : "e.g., BCA"} style={baseInputStyle} />
              </InputWrapper>
            </div>

            {formData.type === "bank_transfer" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <Label>Nomor Rekening *</Label>
                  <InputWrapper icon={Hash}>
                    <input required value={formData.account_number} onChange={(e) => setFormData({ ...formData, account_number: e.target.value })} placeholder="e.g., 1234567890" style={baseInputStyle} />
                  </InputWrapper>
                </div>
                <div>
                  <Label>Atas Nama *</Label>
                  <InputWrapper icon={User}>
                    <input required value={formData.account_name} onChange={(e) => setFormData({ ...formData, account_name: e.target.value })} placeholder="e.g., Budi Santoso" style={baseInputStyle} />
                  </InputWrapper>
                </div>
              </div>
            )}

            {formData.type === "qris" && (
              <div>
                <Label>Gambar Barcode QRIS *</Label>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <label 
                    htmlFor="qris-upload"
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center", 
                      gap: "12px", 
                      padding: "16px", 
                      background: "var(--bg-color)", 
                      border: "1px dashed var(--c-border)", 
                      borderRadius: "var(--r-md)", 
                      color: "var(--c-ink-dim)", 
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontWeight: 500,
                      fontSize: "0.95rem"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--c-gold)", e.currentTarget.style.color = "var(--c-gold)")}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = "var(--c-border)", e.currentTarget.style.color = "var(--c-ink-dim)")}
                  >
                    <ImageIcon size={20} />
                    <span>{imageFile ? imageFile.name : "Pilih Gambar QRIS..."}</span>
                    <input 
                      id="qris-upload"
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      style={{ display: "none" }} 
                    />
                  </label>
                  {previewImage && (
                    <div style={{ width: 200, height: 200, borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", overflow: "hidden", background: "#fff", margin: "0 auto" }}>
                      <img src={previewImage} alt="QRIS Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                  )}
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer */}
        <div style={{ padding: "20px 32px", borderTop: "1px solid var(--c-border)", display: "flex", justifyContent: "flex-end", gap: 12, background: "var(--bg-color)", borderRadius: "0 0 var(--r-lg) var(--r-lg)" }}>
          <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", background: "var(--c-surface-1)", color: "var(--c-ink)", fontWeight: 500, cursor: "pointer" }}>Batal</button>
          <button type="submit" form="payment-form" disabled={loading} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: "var(--r-md)", border: "none", background: "var(--c-gold)", color: "#000", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            <Save size={18} />
            {loading ? "Menyimpan..." : "Simpan Metode"}
          </button>
        </div>
      </div>
    </div>
  );
}
