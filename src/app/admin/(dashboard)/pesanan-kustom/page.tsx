"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Beaker, Eye, Clock, CheckCircle, CreditCard, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function PesananKustomPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/custom-requests");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequests(data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengambil data pesanan kustom");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(234, 179, 8, 0.1)", color: "#eab308", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><Clock size={12}/> Pending</span>;
      case 'quoted': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><CreditCard size={12}/> Menunggu Bayar</span>;
      case 'paid': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle size={12}/> Dibayar</span>;
      case 'completed': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(168, 85, 247, 0.1)", color: "#a855f7", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><CheckCircle size={12}/> Selesai</span>;
      case 'rejected': return <span style={{ padding: "4px 8px", borderRadius: "12px", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: 4 }}><XCircle size={12}/> Ditolak</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontFamily: "var(--font-display)", color: "var(--c-ink)" }}>Pesanan Racikan Custom</h1>
          <p style={{ color: "var(--c-ink-muted)", fontSize: "0.9rem" }}>Kelola pengajuan racikan AI dari pelanggan.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--c-ink-muted)" }}>Memuat data...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <Beaker size={48} color="var(--c-border)" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "var(--c-ink-muted)" }}>Belum ada pesanan racikan custom.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "var(--c-surface-2)", borderBottom: "1px solid var(--c-border)", textAlign: "left" }}>
                <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>ID Pesanan</th>
                <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>Pelanggan</th>
                <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>Parfum</th>
                <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "16px", color: "var(--c-ink-dim)", fontWeight: 600 }}>Tanggal</th>
                <th style={{ padding: "16px", textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                  <td style={{ padding: "16px", fontFamily: "monospace", color: "var(--c-gold)" }}>{req.id.substring(0, 8).toUpperCase()}</td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 500, color: "var(--c-ink)" }}>{req.customer_name}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--c-ink-muted)" }}>{req.customer_whatsapp}</div>
                  </td>
                  <td style={{ padding: "16px", color: "var(--c-ink)" }}>{req.ai_recipe?.name_suggestion || 'Custom Perfume'}</td>
                  <td style={{ padding: "16px" }}>{getStatusBadge(req.status)}</td>
                  <td style={{ padding: "16px", color: "var(--c-ink-muted)" }}>{new Date(req.created_at).toLocaleDateString('id-ID')}</td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <Link href={`/admin/pesanan-kustom/${req.id}`} className="btn btn-outline" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                      <Eye size={14} /> Detail & Quotation
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
