"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, CreditCard, QrCode } from "lucide-react";
import PaymentMethodForm from "./PaymentMethodForm";
import { togglePaymentMethodActive, deletePaymentMethod } from "./actions";

export default function PaymentMethodClient({ paymentMethods }: { paymentMethods: any[] }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);

  const handleEdit = (method: any) => {
    setEditingMethod(method);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingMethod(null);
    setIsFormOpen(true);
  };

  const handleToggle = async (id: number, currentStatus: boolean) => {
    await togglePaymentMethodActive(id, !currentStatus);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin ingin menghapus metode pembayaran ini?")) {
      await deletePaymentMethod(id);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--c-ink)" }}>Metode Pembayaran</h1>
          <p style={{ color: "var(--c-ink-dim)", marginTop: 4 }}>Atur rekening bank dan QRIS untuk transfer manual</p>
        </div>
        <button 
          onClick={handleAddNew}
          style={{ 
            display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", 
            background: "var(--c-gold)", color: "#000", fontWeight: 600, 
            borderRadius: "var(--r-md)", border: "none", cursor: "pointer", transition: "opacity 0.2s"
          }}
        >
          <Plus size={18} />
          Tambah Metode
        </button>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {paymentMethods.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", background: "var(--c-surface-1)", borderRadius: "var(--r-lg)", border: "1px solid var(--c-border)" }}>
            <p style={{ color: "var(--c-ink-dim)" }}>Belum ada metode pembayaran.</p>
          </div>
        ) : (
          paymentMethods.map((pm) => (
            <div key={pm.id} style={{ 
              background: "var(--c-surface-1)", padding: 24, borderRadius: "var(--r-lg)", 
              border: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between",
              opacity: pm.is_active ? 1 : 0.6
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: "50%", background: "var(--glass-bg)", 
                  display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-gold)" 
                }}>
                  {pm.type === "qris" ? <QrCode size={24} /> : <CreditCard size={24} />}
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)", display: "flex", alignItems: "center", gap: 8 }}>
                    {pm.bank_name}
                    {!pm.is_active && <span style={{ fontSize: "0.7rem", padding: "2px 6px", background: "var(--c-surface-2)", color: "var(--c-ink-dim)", borderRadius: "var(--r-sm)" }}>Nonaktif</span>}
                  </h3>
                  <div style={{ color: "var(--c-ink-muted)", marginTop: 4, fontSize: "0.9rem" }}>
                    {pm.type === "qris" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>Metode QRIS Statis</span>
                        {pm.qr_image_url && (
                          <a href={pm.qr_image_url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--c-gold)", textDecoration: "underline", fontSize: "0.8rem" }}>
                            (Lihat QRIS)
                          </a>
                        )}
                      </div>
                    ) : `No. Rekening: ${pm.account_number} a/n ${pm.account_name}`}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.9rem", color: "var(--c-ink-dim)" }}>
                  <input 
                    type="checkbox" 
                    checked={pm.is_active} 
                    onChange={() => handleToggle(pm.id, pm.is_active)}
                    style={{ width: 18, height: 18, accentColor: "var(--c-gold)", cursor: "pointer" }}
                  />
                  Aktif
                </label>
                <div style={{ width: 1, height: 24, background: "var(--c-border)" }}></div>
                <button onClick={() => handleEdit(pm)} style={{ background: "transparent", border: "none", color: "var(--c-ink)", cursor: "pointer", padding: 8, borderRadius: "var(--r-sm)" }}>
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(pm.id)} style={{ background: "transparent", border: "none", color: "var(--c-rose)", cursor: "pointer", padding: 8, borderRadius: "var(--r-sm)" }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <PaymentMethodForm
          paymentMethod={editingMethod}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
