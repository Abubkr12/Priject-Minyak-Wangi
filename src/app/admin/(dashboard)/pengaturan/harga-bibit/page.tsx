"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, Beaker } from "lucide-react";
import { getStoreSettings, saveStoreSetting } from "../api/actions";

export default function HargaBibitSettings() {
  const [hargaBibit, setHargaBibit] = useState("");
  const [hargaPelarut, setHargaPelarut] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getStoreSettings();
      const settingsMap: Record<string, string> = {};
      data.forEach((s: any) => settingsMap[s.key] = s.value);
      setHargaBibit(settingsMap.HARGA_BIBIT_PER_ML || "1500");
      setHargaPelarut(settingsMap.HARGA_PELARUT_PER_ML || "500");
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    
    await saveStoreSetting("HARGA_BIBIT_PER_ML", hargaBibit);
    await saveStoreSetting("HARGA_PELARUT_PER_ML", hargaPelarut);
    
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
        <Loader2 className="animate-spin" color="var(--c-gold)" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--c-ink)", marginBottom: 8 }}>Harga Bahan</h1>
          <p style={{ color: "var(--c-ink-dim)" }}>Atur harga modal bibit dan pelarut per mililiter (ML).</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ padding: "10px 20px", borderRadius: "var(--r-md)", background: success ? "#10b981" : "var(--c-gold)", color: "#fff", border: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "background 0.2s" }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? "Menyimpan..." : success ? "Tersimpan" : "Simpan Perubahan"}
        </button>
      </div>

      <div style={{ display: "grid", gap: 24, maxWidth: 600 }}>
        <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", background: "rgba(167, 139, 250, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a78bfa" }}>
              <Beaker size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)" }}>Bibit Parfum (Extract)</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--c-ink-muted)" }}>Harga per 1 ML bibit murni</p>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, color: "var(--c-ink-dim)" }}>Rp</span>
            <input 
              type="number"
              value={hargaBibit}
              onChange={(e) => setHargaBibit(e.target.value)}
              style={{ flex: 1, padding: "12px 16px", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-ink)", fontSize: "1rem" }}
            />
            <span style={{ color: "var(--c-ink-dim)" }}>/ ML</span>
          </div>
        </div>

        <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--r-sm)", background: "rgba(56, 189, 248, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#38bdf8" }}>
              <Beaker size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)" }}>Pelarut (Absolute/Solvent)</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--c-ink-muted)" }}>Harga per 1 ML pelarut</p>
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, color: "var(--c-ink-dim)" }}>Rp</span>
            <input 
              type="number"
              value={hargaPelarut}
              onChange={(e) => setHargaPelarut(e.target.value)}
              style={{ flex: 1, padding: "12px 16px", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", background: "var(--c-bg)", color: "var(--c-ink)", fontSize: "1rem" }}
            />
            <span style={{ color: "var(--c-ink-dim)" }}>/ ML</span>
          </div>
        </div>
      </div>
    </div>
  );
}
