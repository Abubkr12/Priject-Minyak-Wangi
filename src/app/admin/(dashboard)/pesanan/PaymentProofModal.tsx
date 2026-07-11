"use client";

import { useState } from 'react';
import { X, CheckCircle, XCircle, FileImage } from 'lucide-react';
import { markAsPaid, rejectPayment } from './actions';

export function PaymentProofModal({ orderId, paymentProof }: { orderId: string, paymentProof: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMarkAsPaid = async (formData: FormData) => {
    try {
      await markAsPaid(formData);
      setIsOpen(false);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const handleRejectPayment = async (formData: FormData) => {
    try {
      await rejectPayment(formData);
      setIsOpen(false);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        style={{ width: "100%", background: "var(--glass-bg)", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", overflow: "hidden", marginBottom: 20, cursor: "pointer", transition: "all 0.2s" }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--c-gold)"}
        onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--c-border)"}
      >
        <img src={paymentProof} alt="Bukti Pembayaran" style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "250px" }} />
        <div style={{ padding: "12px", background: "var(--c-surface-2)", fontSize: "0.85rem", color: "var(--c-ink-dim)", borderTop: "1px solid var(--c-border)", textAlign: "center", fontWeight: 500 }}>
          Klik gambar untuk memperbesar
        </div>
      </div>

      {isOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 24, backdropFilter: "blur(4px)" }} onClick={() => setIsOpen(false)}>
          <div style={{ background: "var(--c-surface-1)", borderRadius: "var(--r-lg)", width: "100%", maxWidth: 600, overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh", border: "1px solid var(--c-border)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-color)" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)", display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
                <FileImage size={18} style={{ color: "var(--c-gold)" }} /> Bukti Pembayaran
              </h2>
              <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "var(--c-ink-dim)", cursor: "pointer", padding: 4, display: "flex" }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ flex: 1, overflow: "auto", background: "var(--bg-color)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
              <img src={paymentProof} alt="Bukti Pembayaran" style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "var(--r-md)" }} />
            </div>
            
            <div style={{ padding: 24, borderTop: "1px solid var(--c-border)", background: "var(--c-surface-1)", display: "flex", gap: 16 }}>
              <form action={handleMarkAsPaid} style={{ flex: 1 }}>
                <input type="hidden" name="orderId" value={orderId} />
                <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", background: "var(--c-teal)", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <CheckCircle size={18} /> Terima Bukti
                </button>
              </form>
              <form action={handleRejectPayment} style={{ flex: 1 }}>
                <input type="hidden" name="orderId" value={orderId} />
                <button type="submit" className="btn btn-outline" style={{ width: "100%", padding: "12px", color: "var(--c-rose)", borderColor: "var(--c-rose)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <XCircle size={18} /> Tolak Bukti
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
