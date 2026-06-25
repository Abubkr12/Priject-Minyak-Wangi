"use client";

import { useState } from "react";
import { Sparkles, Upload, Image as ImageIcon, Beaker, ShoppingBag, X } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useCart } from "@/lib/cart-context";
import { getSupabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function KustomRefillPage() {
  const [baseNote, setBaseNote] = useState("Bebas (Pilihkan untuk saya)");
  const [customBaseNote, setCustomBaseNote] = useState("");
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Custom Order Form state
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerWA, setCustomerWA] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  
  const { dispatch } = useCart();
  const router = useRouter();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);

    // Compress image client side
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 JPEG
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setImageBase64(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!description && !imageBase64) {
      toast.error("Mohon isi deskripsi atau unggah gambar referensi.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/refill-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          baseNote: baseNote === "Lainnya (Ketik Sendiri)" ? customBaseNote : baseNote, 
          description, 
          imageBase64 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendapatkan rekomendasi");

      setResult(data);
      toast.success("Rekomendasi racikan berhasil dibuat!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async () => {
    const supabase = getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast.error("Silakan login terlebih dahulu untuk memesan.");
      router.push("/login?next=/kustom-refill");
      return;
    }
    
    if (session.user?.user_metadata?.full_name) {
      setCustomerName(session.user.user_metadata.full_name);
    }
    
    setShowOrderForm(true);
  };

  const handleSubmitOrder = async () => {
    if (!customerName || !customerWA) {
      toast.error("Nama dan Nomor WhatsApp harus diisi.");
      return;
    }
    
    setSubmittingOrder(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_whatsapp: customerWA,
        base_note: baseNote === "Lainnya (Ketik Sendiri)" ? customBaseNote : baseNote,
        description,
        ai_recipe: result
      };
      
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Gagal mengirim pesanan");
      
      toast.success("Pesanan berhasil dikirim! Admin akan segera menghubungi Anda.");
      setResult(null);
      setShowOrderForm(false);
      setCustomerName("");
      setCustomerWA("");
      setDescription("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: "100px" }}>
      <PageHeader 
        title="Kustom Refill Parfum" 
        subtitle="Racik aroma unik Anda sendiri dengan bantuan Master Perfumer AI kami."
      />

      <div className="container" style={{ maxWidth: 800, margin: "0 auto", marginTop: 40 }}>
        
        <div style={{ background: "var(--c-surface-1)", padding: 32, borderRadius: "var(--r-lg)", border: "1px solid var(--c-border)", marginBottom: 40 }}>
          
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>
              Base Note Utama
            </label>
            <select 
              value={baseNote} 
              onChange={(e) => setBaseNote(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", borderRadius: "var(--r-md)", background: "var(--c-surface-2)", border: "1px solid var(--c-border)", color: "var(--c-ink)", fontSize: "1rem" }}
            >
              {["Bebas (Pilihkan untuk saya)", "Fresh & Clean", "Floral & Romantic", "Woody & Earthy", "Citrus & Zesty", "Sweet & Gourmand", "Aquatic & Ocean", "Spicy & Bold", "Musky & Sensual", "Lainnya (Ketik Sendiri)"].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            {baseNote === "Lainnya (Ketik Sendiri)" && (
              <input
                type="text"
                placeholder="Ketik base note yang Anda inginkan (contoh: Leather, Coffee)..."
                value={customBaseNote}
                onChange={(e) => setCustomBaseNote(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", borderRadius: "var(--r-md)", background: "var(--c-surface-2)", border: "1px solid var(--c-border)", color: "var(--c-ink)", fontSize: "1rem", marginTop: "12px" }}
              />
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>
              Ceritakan Keinginan Anda
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Saya ingin parfum yang cocok untuk kencan malam, aromanya manis tapi tidak bikin pusing, ada sentuhan mawar dan vanilla..."
              rows={4}
              style={{ width: "100%", padding: "14px 16px", borderRadius: "var(--r-md)", background: "var(--c-surface-2)", border: "1px solid var(--c-border)", color: "var(--c-ink)", fontSize: "0.95rem", resize: "vertical" }}
            />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>
              Gambar Referensi (Opsional)
            </label>
            
            {!imageBase64 ? (
              <label 
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px", background: "var(--c-surface-2)", border: "1px dashed var(--c-border)", borderRadius: "var(--r-md)", cursor: "pointer", transition: "all 0.2s" }}
              >
                <Upload size={24} color="var(--c-ink-dim)" style={{ marginBottom: 12 }} />
                <span style={{ fontSize: "0.9rem", color: "var(--c-ink)" }}>Klik untuk unggah foto parfum referensi</span>
                <span style={{ fontSize: "0.8rem", color: "var(--c-ink-muted)", marginTop: 4 }}>JPG, PNG (Maks 5MB)</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
              </label>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 16, padding: 16, background: "var(--c-surface-2)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)" }}>
                <div style={{ width: 60, height: 60, borderRadius: "var(--r-sm)", overflow: "hidden", border: "1px solid var(--c-border)" }}>
                  <img src={imageBase64} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--c-ink)" }}>{imageName}</p>
                  <p style={{ fontSize: "0.8rem", color: "var(--c-gold)" }}>Gambar siap dianalisis</p>
                </div>
                <button 
                  onClick={() => { setImageBase64(null); setImageName(""); }}
                  style={{ background: "transparent", border: "none", color: "var(--c-ink-muted)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            style={{ 
              width: "100%", 
              padding: "16px", 
              borderRadius: "var(--r-md)", 
              background: "var(--c-gold)", 
              color: "#fff", 
              border: "none", 
              fontWeight: 600, 
              fontSize: "1rem", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 8,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "all 0.2s"
            }}
          >
            {loading ? (
              <>Menganalisis Aroma...</>
            ) : (
              <><Sparkles size={18} /> Racik Aroma dengan AI</>
            )}
          </button>
        </div>

        {/* Hasil AI */}
        {result && (
          <div className="animate-fade-up" style={{ background: "linear-gradient(145deg, var(--c-surface-1), var(--c-surface-2))", padding: 32, borderRadius: "var(--r-lg)", border: "1px solid var(--c-gold-dim)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, opacity: 0.05, transform: "translate(20%, -20%)" }}>
              <Beaker size={200} />
            </div>
            
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "var(--c-gold-dim)", color: "var(--c-gold)", borderRadius: "var(--r-pill)", fontSize: "0.8rem", fontWeight: 600, marginBottom: 16 }}>
                <Sparkles size={14} /> AI Master Perfumer
              </div>
              
              <h3 style={{ fontSize: "2rem", fontFamily: "var(--font-display)", color: "var(--c-ink)", marginBottom: 24, lineHeight: 1.2 }}>
                {result.name_suggestion}
              </h3>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--c-ink-dim)", marginBottom: 8, fontWeight: 600 }}>Gambaran Aroma</h4>
                <p style={{ fontSize: "1.1rem", color: "var(--c-ink)", lineHeight: 1.6, fontStyle: "italic" }}>
                  "{result.customer_description}"
                </p>
              </div>

              {/* Note for seller, hidden visually but sent in order, or we can show it as technical notes */}
              <div style={{ padding: 16, background: "rgba(0,0,0,0.2)", borderRadius: "var(--r-md)", border: "1px dashed var(--c-border)", marginBottom: 32 }}>
                <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--c-ink-muted)", marginBottom: 8, fontWeight: 600 }}>Technical Recipe (For Seller)</h4>
                <p style={{ fontSize: "0.9rem", color: "var(--c-ink-muted)", fontFamily: "monospace" }}>
                  {result.admin_recipe}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 24, borderTop: "1px solid var(--c-border)" }}>
                <div>
                  <p style={{ fontSize: "0.85rem", color: "var(--c-ink-muted)" }}>Status</p>
                  <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--c-gold)" }}>Menunggu Konfirmasi Admin</p>
                </div>
                
                {!showOrderForm ? (
                  <button 
                    onClick={handleOrderClick}
                    style={{ padding: "14px 28px", borderRadius: "var(--r-full)", background: "var(--c-ink)", color: "var(--c-bg)", border: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "transform 0.2s" }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    <ShoppingBag size={18} /> Pesan Racikan Ini
                  </button>
                ) : null}
              </div>

              {showOrderForm && (
                <div className="animate-fade-up" style={{ marginTop: 24, background: "var(--c-surface-2)", padding: 24, borderRadius: "var(--r-md)", border: "1px solid var(--c-gold-dim)" }}>
                  <h4 style={{ marginBottom: 16, fontSize: "1.1rem", color: "var(--c-ink)" }}>Lengkapi Data Pesanan</h4>
                  
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: 8, color: "var(--c-ink-dim)" }}>Nama Pemesan</label>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="input-field"
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: "0.85rem", marginBottom: 8, color: "var(--c-ink-dim)" }}>Nomor WhatsApp</label>
                    <input 
                      type="tel" 
                      value={customerWA}
                      onChange={(e) => setCustomerWA(e.target.value)}
                      placeholder="Contoh: 081234567890"
                      className="input-field"
                    />
                    <p style={{ fontSize: "0.8rem", color: "var(--c-ink-muted)", marginTop: 8 }}>Admin akan menghubungi nomor ini untuk rincian harga (botol, dll) dan pembayaran.</p>
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button 
                      onClick={() => setShowOrderForm(false)}
                      style={{ flex: 1, padding: "12px", borderRadius: "var(--r-md)", background: "transparent", color: "var(--c-ink)", border: "1px solid var(--c-border)", cursor: "pointer" }}
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleSubmitOrder}
                      disabled={submittingOrder}
                      style={{ flex: 2, padding: "12px", borderRadius: "var(--r-md)", background: "var(--c-gold)", color: "#fff", border: "none", fontWeight: 600, cursor: submittingOrder ? "not-allowed" : "pointer", opacity: submittingOrder ? 0.7 : 1 }}
                    >
                      {submittingOrder ? "Mengirim..." : "Kirim Pesanan ke Admin"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
