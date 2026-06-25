"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteProduct } from "./actions";
import { toast } from "sonner";

export function DeleteProductButton({ id, name }: { id: number, name: string }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProduct(id);
      toast.success("Produk berhasil dihapus");
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const modalContent = showModal ? (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 99999,
      padding: 20
    }}>
      <div style={{
        background: "var(--c-surface-1)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--r-lg)",
        width: "100%", maxWidth: 380,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
        overflow: "hidden",
        animation: "fadeInUp 0.2s ease-out",
        position: "relative"
      }}>
        <button 
          onClick={() => setShowModal(false)}
          disabled={loading}
          style={{ position: "absolute", top: 16, right: 16, background: "transparent", border: "none", color: "var(--c-ink-dim)", cursor: "pointer", padding: 4, display: "flex", borderRadius: "50%", transition: "background 0.2s" }}
        >
          <X size={20} />
        </button>

        <div style={{ padding: "32px 24px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(225, 29, 72, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#e11d48", marginBottom: 20 }}>
            <AlertTriangle size={28} />
          </div>
          
          <h3 style={{ fontSize: "1.3rem", fontWeight: 600, color: "var(--c-ink)", margin: "0 0 12px", fontFamily: "var(--font-display)" }}>Hapus Produk?</h3>
          <p style={{ fontSize: "0.95rem", color: "var(--c-ink-muted)", lineHeight: 1.6, margin: 0 }}>
            Apakah Anda yakin ingin menghapus parfum <strong>"{name}"</strong>? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
          </p>
        </div>
        
        <div style={{ padding: "0 24px 24px", display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowModal(false)}
            disabled={loading}
            style={{ flex: 1, padding: "12px", background: "transparent", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)", fontWeight: 500, cursor: "pointer", transition: "background 0.2s" }}
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            style={{ flex: 1, padding: "12px", background: "#e11d48", border: "none", borderRadius: "var(--r-md)", color: "#fff", fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "opacity 0.2s" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Hapus
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </div>
  ) : null;

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        disabled={loading}
        style={{ padding: "8px", background: "rgba(225, 29, 72, 0.1)", color: "#e11d48", border: "none", borderRadius: "var(--r-md)", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s" }} 
        title="Hapus Produk"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
