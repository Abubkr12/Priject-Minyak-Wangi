"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function PesananKustomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Pricing state
  const [pricePerfume, setPricePerfume] = useState(0);
  const [priceBottle, setPriceBottle] = useState(0);
  const [priceService, setPriceService] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/custom-requests/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRequest(data.data);
      setPricePerfume(data.data.price_perfume || 0);
      setPriceBottle(data.data.price_bottle || 0);
      setPriceService(data.data.price_service || 0);
    } catch (err: any) {
      toast.error(err.message || "Gagal memuat detail");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndConfirm = async () => {
    setSaving(true);
    try {
      const total = Number(pricePerfume) + Number(priceBottle) + Number(priceService);
      const res = await fetch(`/api/custom-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_perfume: Number(pricePerfume),
          price_bottle: Number(priceBottle),
          price_service: Number(priceService),
          total_price: total,
          status: "quoted"
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setRequest(data.data);
      toast.success("Pesanan berhasil dikonfirmasi dengan harga baru!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyPaymentLink = () => {
    const link = `${window.location.origin}/checkout/custom/${id}`;
    navigator.clipboard.writeText(
      `Halo ${request.customer_name},\n\nPesanan parfum custom Anda "${request.ai_recipe.name_suggestion}" telah kami konfirmasi.\n\nTotal Biaya: Rp ${(request.total_price || 0).toLocaleString('id-ID')}\n\nSilakan lanjutkan pembayaran melalui link berikut:\n${link}\n\nTerima kasih,\nEla Parfum`
    );
    setCopied(true);
    toast.success("Teks dan link pembayaran disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div style={{ padding: 40 }}>Memuat data...</div>;
  if (!request) return <div style={{ padding: 40 }}>Pesanan tidak ditemukan</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Link href="/admin/pesanan-kustom" className="btn btn-outline" style={{ padding: 8, borderRadius: "var(--r-full)" }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontFamily: "var(--font-display)", color: "var(--c-ink)" }}>Detail Racikan Custom</h1>
          <p style={{ color: "var(--c-ink-muted)", fontSize: "0.9rem" }}>ID: {id}</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: 24 }}>
        {/* Left Column - Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div className="card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: 16, color: "var(--c-ink)", borderBottom: "1px solid var(--c-border)", paddingBottom: 12 }}>Info Pelanggan</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>Nama</p>
                <p style={{ fontWeight: 500, color: "var(--c-ink)" }}>{request.customer_name}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>WhatsApp</p>
                <p style={{ fontWeight: 500, color: "var(--c-gold)" }}>{request.customer_whatsapp}</p>
              </div>
            </div>
            
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 8 }}>Permintaan Khusus (Deskripsi Customer)</p>
              <div style={{ background: "var(--c-surface-1)", padding: 16, borderRadius: "var(--r-md)", fontStyle: "italic", color: "var(--c-ink)" }}>
                "{request.description}"
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1.1rem", marginBottom: 16, color: "var(--c-ink)", borderBottom: "1px solid var(--c-border)", paddingBottom: 12 }}>Resep Racikan AI</h3>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>Nama Saran AI:</span>
              <p style={{ fontSize: "1.5rem", fontFamily: "var(--font-display)", color: "var(--c-gold)" }}>{request.ai_recipe?.name_suggestion}</p>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>Base Note:</span>
              <p style={{ color: "var(--c-ink)" }}>{request.base_note}</p>
            </div>

            <div style={{ background: "rgba(0,0,0,0.3)", padding: 16, borderRadius: "var(--r-md)", border: "1px dashed var(--c-border)" }}>
              <h4 style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>Technical Recipe</h4>
              <p style={{ fontFamily: "monospace", color: "var(--c-ink)", whiteSpace: "pre-wrap" }}>
                {request.ai_recipe?.admin_recipe}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column - Pricing & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div className="card" style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-gold-dim)" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: 16, color: "var(--c-ink)", display: "flex", justifyContent: "space-between" }}>
              Kalkulasi Harga
              <span style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: "12px", background: request.status === 'pending' ? "rgba(234, 179, 8, 0.2)" : "rgba(59, 130, 246, 0.2)", color: request.status === 'pending' ? "#eab308" : "#3b82f6" }}>
                {request.status.toUpperCase()}
              </span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 6 }}>Harga Bibit Parfum (Rp)</label>
                <input 
                  type="number" 
                  value={pricePerfume} 
                  onChange={(e) => setPricePerfume(Number(e.target.value))}
                  className="input-field" 
                  disabled={request.status !== 'pending' && request.status !== 'quoted'}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 6 }}>Harga Botol (Rp)</label>
                <input 
                  type="number" 
                  value={priceBottle} 
                  onChange={(e) => setPriceBottle(Number(e.target.value))}
                  className="input-field" 
                  disabled={request.status !== 'pending' && request.status !== 'quoted'}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", marginBottom: 6 }}>Biaya Jasa / Ekstra (Rp)</label>
                <input 
                  type="number" 
                  value={priceService} 
                  onChange={(e) => setPriceService(Number(e.target.value))}
                  className="input-field" 
                  disabled={request.status !== 'pending' && request.status !== 'quoted'}
                />
              </div>
              
              <div style={{ marginTop: 12, paddingTop: 16, borderTop: "1px dashed var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--c-ink-dim)" }}>Total Akhir</span>
                <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--c-ink)" }}>
                  Rp {(Number(pricePerfume) + Number(priceBottle) + Number(priceService)).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {(request.status === 'pending' || request.status === 'quoted') && (
              <button 
                onClick={handleSaveAndConfirm}
                disabled={saving}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", marginTop: 24, padding: "14px" }}
              >
                <Save size={18} /> {saving ? "Menyimpan..." : "Simpan & Konfirmasi"}
              </button>
            )}

            {request.status !== 'pending' && (
              <button 
                onClick={copyPaymentLink}
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center", marginTop: 12, padding: "14px", border: "1px solid var(--c-gold)", color: "var(--c-gold)" }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />} 
                {copied ? "Disalin!" : "Salin Pesan WA & Link Bayar"}
              </button>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
