"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { getSupabase } from "@/lib/supabase";
import { CheckCircle2, ChevronRight, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function CustomCheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/custom-requests/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequest(data.data);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat detail");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    // Simulasi upload
    setPaymentProof("uploaded.jpg");
    toast.success("Bukti transfer diunggah");
  };

  const handlePay = async () => {
    if (!paymentProof) {
      toast.error("Harap unggah bukti transfer");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/custom-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" })
      });
      if (!res.ok) throw new Error("Gagal konfirmasi pembayaran");
      
      toast.success("Pembayaran berhasil!");
      router.push("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Memuat...</div>;
  if (!request) return <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>Data pesanan tidak ditemukan</div>;

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
      <PageHeader title="Pembayaran Pesanan Custom" subtitle="Selesaikan pembayaran agar racikan segera diproses" />

      <div className="container" style={{ maxWidth: 600, margin: "0 auto", marginTop: 40 }}>
        
        {request.status !== "quoted" && request.status !== "pending" && (
          <div style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", padding: 24, borderRadius: "var(--r-md)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 24, textAlign: "center" }}>
            <CheckCircle2 size={48} style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 8 }}>Pesanan Sudah Dibayar</h2>
            <p>Terima kasih. Pesanan Anda sedang diproses oleh admin.</p>
            <Link href="/" className="btn btn-outline" style={{ marginTop: 16 }}>Kembali ke Beranda</Link>
          </div>
        )}

        {(request.status === "quoted" || request.status === "pending") && (
          <>
            {request.status === "pending" && (
              <div style={{ background: "rgba(234, 179, 8, 0.1)", color: "#eab308", padding: 16, borderRadius: "var(--r-md)", border: "1px solid rgba(234,179,8,0.2)", marginBottom: 24 }}>
                <strong>Pemberitahuan:</strong> Pesanan ini belum dikonfirmasi total harganya oleh Admin. Harap tunggu konfirmasi harga sebelum membayar.
              </div>
            )}

            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 16, borderBottom: "1px solid var(--c-border)", paddingBottom: 12 }}>Rincian Pesanan</h3>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "var(--c-ink-dim)" }}>Nama Racikan AI</span>
                <span style={{ fontWeight: 500 }}>{request.ai_recipe?.name_suggestion || "Custom"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "var(--c-ink-dim)" }}>Harga Bibit Parfum</span>
                <span style={{ fontWeight: 500 }}>Rp {(request.price_perfume || 0).toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "var(--c-ink-dim)" }}>Harga Botol</span>
                <span style={{ fontWeight: 500 }}>Rp {(request.price_bottle || 0).toLocaleString('id-ID')}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ color: "var(--c-ink-dim)" }}>Biaya Layanan/Jasa</span>
                <span style={{ fontWeight: 500 }}>Rp {(request.price_service || 0).toLocaleString('id-ID')}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px dashed var(--c-border)", marginTop: 16 }}>
                <span style={{ color: "var(--c-ink)" }}>Total Tagihan</span>
                <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--c-gold)" }}>Rp {(request.total_price || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 16 }}>Metode Pembayaran (Transfer BCA)</h3>
              <div style={{ background: "var(--c-surface-1)", padding: 16, borderRadius: "var(--r-md)", marginBottom: 16 }}>
                <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 4 }}>Bank BCA</p>
                <p style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "1px" }}>123 456 7890</p>
                <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginTop: 4 }}>a.n. Ela Parfum</p>
              </div>

              {!paymentProof ? (
                <button 
                  onClick={handleUploadClick}
                  style={{ width: "100%", padding: 16, border: "1px dashed var(--c-border)", borderRadius: "var(--r-md)", background: "transparent", color: "var(--c-ink)", cursor: "pointer" }}
                >
                  <Upload size={20} style={{ margin: "0 auto 8px" }} />
                  Kilk untuk unggah Bukti Transfer
                </button>
              ) : (
                <div style={{ background: "rgba(59, 130, 246, 0.1)", color: "var(--c-gold)", padding: 16, borderRadius: "var(--r-md)", textAlign: "center", border: "1px solid rgba(59,130,246,0.2)" }}>
                  Bukti transfer terunggah
                </div>
              )}
            </div>

            <button 
              onClick={handlePay}
              disabled={submitting || !paymentProof || request.status === "pending"}
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "16px" }}
            >
              {submitting ? "Memproses..." : "Konfirmasi Pembayaran"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
