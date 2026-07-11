"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { getStoreSettings } from "../../pengaturan/api/actions";

export default function PesananKustomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Pricing state
  const [hargaBibitMl, setHargaBibitMl] = useState(1500);
  const [hargaPelarutMl, setHargaPelarutMl] = useState(500);
  const [rasio, setRasio] = useState("50/50");
  const [pricePerfume, setPricePerfume] = useState(0);
  const [priceBottle, setPriceBottle] = useState(0);
  const [priceService, setPriceService] = useState(0);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Recalculate price when ingredients change
  useEffect(() => {
    if (request && (request.status === 'pending' || request.status === 'quoted')) {
      const volume = request.volume_ml || 30;
      const pctBibit = rasio === '70/30' ? 0.7 : 0.5;
      const mlBibit = volume * pctBibit;
      const mlPelarut = volume * (1 - pctBibit);
      setPricePerfume(Math.round((mlBibit * hargaBibitMl) + (mlPelarut * hargaPelarutMl)));
    }
  }, [hargaBibitMl, hargaPelarutMl, rasio, request]);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/custom-requests/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const reqData = data.data;
      setRequest(reqData);

      let initialPerfume = reqData.price_perfume || 0;

      // Always fetch settings to populate the inputs nicely
      const settings = await getStoreSettings();
      const settingsMap: Record<string, string> = {};
      settings.forEach((s: any) => settingsMap[s.key] = s.value);
      
      const hBibit = Number(settingsMap.HARGA_BIBIT_PER_ML || 1500);
      const hPelarut = Number(settingsMap.HARGA_PELARUT_PER_ML || 500);
      setHargaBibitMl(hBibit);
      setHargaPelarutMl(hPelarut);

      const dbRatio = reqData.ai_recipe?.ratio || '50/50';
      const parsedRatio = dbRatio === '70/30' ? '70/30' : '50/50';
      setRasio(parsedRatio);

      // If pending and no price set, auto calculate
      if (reqData.status === 'pending' && !reqData.price_perfume) {
        const volume = reqData.volume_ml || 30;
        const pctBibit = parsedRatio === '70/30' ? 0.7 : 0.5;
        const mlBibit = volume * pctBibit;
        const mlPelarut = volume * (1 - pctBibit);
        
        initialPerfume = Math.round((mlBibit * hBibit) + (mlPelarut * hPelarut));
      }

      setPricePerfume(initialPerfume);
      setPriceBottle(reqData.price_bottle || 0);
      setPriceService(reqData.price_service || 0);
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
      `Halo ${request.customer_name},\n\nPesanan parfum custom Anda "${request.ai_recipe.name_suggestion}" (${request.volume_ml || 30} ml) telah kami konfirmasi.\n\nTotal Biaya: Rp ${(request.total_price || 0).toLocaleString('id-ID')}\n\nSilakan lanjutkan pembayaran melalui link berikut:\n${link}\n\nTerima kasih,\nEla Parfum`
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
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          <div className="card" style={{ padding: "32px", border: "1px solid var(--c-border)", boxShadow: "0 10px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)", background: "var(--c-surface-2)", overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: "linear-gradient(90deg, var(--c-gold), var(--c-gold-light))" }}></div>
            <h3 style={{ fontSize: "1.2rem", marginBottom: 24, color: "var(--c-ink)", borderBottom: "1px solid var(--c-border)", paddingBottom: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              Info Pelanggan
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "rgba(0,0,0,0.02)", padding: "12px 16px", borderRadius: "var(--r-md)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Nama</p>
                <p style={{ fontWeight: 600, color: "var(--c-ink)", fontSize: "1.05rem" }}>{request.customer_name}</p>
              </div>
              <div style={{ background: "rgba(0,0,0,0.02)", padding: "12px 16px", borderRadius: "var(--r-md)" }}>
                <p style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>WhatsApp</p>
                <p style={{ fontWeight: 600, color: "var(--c-gold)", fontSize: "1.05rem" }}>{request.customer_whatsapp}</p>
              </div>
            </div>
            
            <div style={{ marginTop: 24 }}>
              <p style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>Permintaan Khusus</p>
              <div style={{ background: "var(--c-surface-1)", borderLeft: "4px solid var(--c-gold)", padding: "16px 20px", borderRadius: "0 var(--r-md) var(--r-md) 0", fontStyle: "italic", color: "var(--c-ink)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                "{request.description}"
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: "32px", border: "1px solid var(--c-border)", boxShadow: "0 10px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)", background: "var(--c-surface-2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--c-border)", paddingBottom: 16, marginBottom: 24 }}>
              <h3 style={{ fontSize: "1.2rem", color: "var(--c-ink)", fontWeight: 700, margin: 0 }}>Resep Racikan AI</h3>
              <span style={{ background: "var(--c-gold-dim)", border: "1px solid var(--c-gold)", color: "var(--c-gold)", padding: "6px 16px", borderRadius: "var(--r-pill)", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "1px" }}>
                {request.volume_ml || 30} ML
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Saran Nama:</span>
              <p style={{ fontSize: "1.8rem", fontFamily: "var(--font-display)", color: "var(--c-gold)", lineHeight: 1.2, marginTop: 4 }}>{request.ai_recipe?.name_suggestion}</p>
            </div>
            
            <div style={{ marginBottom: 24, padding: "16px", background: "rgba(0,0,0,0.02)", borderRadius: "var(--r-md)" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Base Note Pilihan Customer:</span>
              <p style={{ color: "var(--c-ink)", fontWeight: 500, marginTop: 4 }}>{request.base_note}</p>
            </div>

            <div style={{ background: "var(--c-surface-1)", padding: 24, borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", position: "relative", overflow: "hidden", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(45deg, transparent, rgba(0,0,0,0.02))", pointerEvents: "none" }}></div>
              <h4 style={{ fontSize: "0.8rem", color: "var(--c-gold)", marginBottom: 12, textTransform: "uppercase", letterSpacing: "1.5px", fontWeight: 600 }}>Technical Recipe</h4>
              <p style={{ fontFamily: "monospace", color: "var(--c-ink)", whiteSpace: "pre-wrap", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {request.ai_recipe?.admin_recipe}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column - Pricing & Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          <div className="card" style={{ padding: "32px", background: "var(--glass-bg)", backdropFilter: "blur(20px)", border: "1px solid var(--c-border)", boxShadow: "var(--shadow-float)" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: 24, color: "var(--c-ink)", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--c-border)", paddingBottom: 16 }}>
              <span style={{ fontWeight: 700 }}>Kalkulasi Harga</span>
              <span style={{ fontSize: "0.8rem", padding: "6px 14px", borderRadius: "var(--r-pill)", background: request.status === 'pending' ? "rgba(234, 179, 8, 0.15)" : "rgba(59, 130, 246, 0.15)", color: request.status === 'pending' ? "#eab308" : "#3b82f6", fontWeight: 700, letterSpacing: "1px", border: `1px solid ${request.status === 'pending' ? 'rgba(234, 179, 8, 0.3)' : 'rgba(59, 130, 246, 0.3)'}` }}>
                {request.status.toUpperCase()}
              </span>
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ padding: 16, background: "var(--glass-bg)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 600 }}>Biaya Bibit & Pelarut</span>
                  <span style={{ color: "var(--c-gold)", fontSize: "0.85rem", fontWeight: 600 }}>Ukuran: {request.volume_ml || 30}ml</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "var(--c-ink-dim)", marginBottom: 4 }}>Rasio Racikan</label>
                    <select
                      value={rasio}
                      onChange={(e) => setRasio(e.target.value)}
                      disabled={request.status !== 'pending' && request.status !== 'quoted'}
                      className="input-field"
                      style={{ background: "var(--c-surface-1)" }}
                    >
                      <option value="50/50">50/50% (Racikan 1:1)</option>
                      <option value="70/30">70/30% (Racikan 2:1)</option>
                    </select>
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--c-ink-dim)", marginBottom: 4 }}>Harga Bibit / ML</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-muted)", fontSize: "0.85rem" }}>Rp</span>
                        <input 
                          type="number" 
                          value={hargaBibitMl}
                          onChange={(e) => setHargaBibitMl(Number(e.target.value))}
                          disabled={request.status !== 'pending' && request.status !== 'quoted'}
                          className="input-field"
                          style={{ paddingLeft: 35, background: "var(--c-surface-1)" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "var(--c-ink-dim)", marginBottom: 4 }}>Harga Pelarut / ML</label>
                      <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-muted)", fontSize: "0.85rem" }}>Rp</span>
                        <input 
                          type="number" 
                          value={hargaPelarutMl}
                          onChange={(e) => setHargaPelarutMl(Number(e.target.value))}
                          disabled={request.status !== 'pending' && request.status !== 'quoted'}
                          className="input-field"
                          style={{ paddingLeft: 35, background: "var(--c-surface-1)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed var(--c-border)", textAlign: "right" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", fontWeight: 500 }}>Total Bahan: </span>
                  <span style={{ color: "var(--c-ink)", fontWeight: 700, fontSize: "1.05rem" }}>Rp {pricePerfume.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", marginBottom: 8, fontWeight: 500 }}>Harga Botol (Rp)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-muted)", fontWeight: 500 }}>Rp</span>
                  <input 
                    type="number" 
                    value={priceBottle} 
                    onChange={(e) => setPriceBottle(Number(e.target.value))}
                    className="input-field" 
                    style={{ paddingLeft: 45, background: "var(--c-surface-1)" }}
                    disabled={request.status !== 'pending' && request.status !== 'quoted'}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", marginBottom: 8, fontWeight: 500 }}>Biaya Jasa / Ekstra (Rp)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-muted)", fontWeight: 500 }}>Rp</span>
                  <input 
                    type="number" 
                    value={priceService} 
                    onChange={(e) => setPriceService(Number(e.target.value))}
                    className="input-field" 
                    style={{ paddingLeft: 45, background: "var(--c-surface-1)" }}
                    disabled={request.status !== 'pending' && request.status !== 'quoted'}
                  />
                </div>
              </div>
              
              <div style={{ marginTop: 16, padding: "24px", background: "var(--c-surface-1)", borderRadius: "var(--r-md)", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--c-gold-dim)" }}>
                <span style={{ color: "var(--c-ink-dim)", textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "1px", fontWeight: 600 }}>Total Tagihan</span>
                <span style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--c-gold)", fontFamily: "var(--font-display)" }}>
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
            
            {(request.status === 'quoted' || request.status === 'paid' || request.status === 'completed') && (
              <div style={{ marginTop: 24, padding: "20px", background: "var(--c-surface-1)", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)" }}>
                <h4 style={{ fontSize: "0.95rem", color: "var(--c-ink)", marginBottom: 12, fontWeight: 600 }}>Bukti Pembayaran</h4>
                {request.payment_proof ? (
                  <a href={request.payment_proof} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={request.payment_proof} 
                      alt="Bukti Pembayaran" 
                      style={{ width: "100%", maxHeight: 250, objectFit: "contain", borderRadius: "var(--r-sm)", border: "1px solid var(--c-border)", background: "var(--bg-color)", display: "block", cursor: "zoom-in" }} 
                    />
                  </a>
                ) : (
                  <div style={{ padding: "20px", textAlign: "center", background: "var(--glass-bg)", borderRadius: "var(--r-sm)", color: "var(--c-ink-muted)", fontSize: "0.85rem", border: "1px dashed var(--c-border)" }}>
                    {request.status === 'quoted' 
                      ? "Menunggu customer mengunggah bukti pembayaran."
                      : "Tidak ada bukti pembayaran."}
                  </div>
                )}
                
                {request.status === 'quoted' && request.payment_proof && (
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        const res = await fetch(`/api/custom-requests/${id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "paid" })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error);
                        setRequest(data.data);
                        toast.success("Pembayaran terverifikasi!");
                      } catch (err: any) {
                        toast.error(err.message);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    disabled={saving}
                    style={{ width: "100%", padding: "10px", background: "#ca8a04", color: "#fff", border: "none", borderRadius: "var(--r-md)", fontWeight: 600, cursor: "pointer", marginTop: 16 }}
                  >
                    Verifikasi Pembayaran
                  </button>
                )}
              </div>
            )}
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
