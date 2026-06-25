"use client";

import { useState, useEffect } from "react";
import { Bot, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { getStoreSettings, saveStoreSetting } from "../api/actions";

export default function AiSettingsPage() {
  const [keys, setKeys] = useState({
    GEMINI_MODEL: "gemini-3.5-flash",
    GEMINI_SYSTEM_PROMPT: "Kamu adalah asisten AI untuk toko parfum isi ulang premium. Namamu adalah \"Scent Advisor\".\n\nATURAN:\n1. Jawab dalam bahasa Indonesia yang sopan tapi santai.\n2. Rekomendasikan dari katalog toko jika memungkinkan.\n3. Jangan menjanjikan kemiripan 100% dengan merek lain."
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function load() {
      const settings = await getStoreSettings();
      const newKeys = { ...keys };
      settings.forEach((s: any) => {
        if (s.key in newKeys && s.value) {
          (newKeys as any)[s.key] = s.value;
        }
      });
      setKeys(newKeys);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    let success = true;
    for (const [key, value] of Object.entries(keys)) {
      const res = await saveStoreSetting(key, value.trim());
      if (!res.success) success = false;
    }
    if (success) {
      setMessage({ text: "Pengaturan AI berhasil disimpan.", type: "success" });
    } else {
      setMessage({ text: "Beberapa pengaturan gagal disimpan.", type: "error" });
    }
    setSaving(false);
  };

  const updateKey = (key: keyof typeof keys, value: string) => {
    setKeys(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Loader2 className="animate-spin" style={{ color: "var(--c-gold)" }} size={32} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--c-ink)", marginBottom: 8 }}>
          Personalisasi AI Chatbot
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>
          Atur bagaimana AI Scent Advisor berinteraksi dengan pelanggan, gaya bahasa, dan model yang digunakan.
        </p>
      </div>

      <div style={{ background: "var(--c-surface-1)", borderRadius: "var(--r-lg)", border: "1px solid var(--c-border)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--glass-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-gold)" }}>
            <Bot size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)" }}>Konfigurasi Scent Advisor</h2>
            <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>Pastikan API Key Gemini sudah terpasang di Integrasi API.</div>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            
            {/* Preferred Model */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--c-ink)" }}>Model Gemini AI (Default)</label>
              <input
                type="text"
                value={keys.GEMINI_MODEL}
                onChange={(e) => updateKey("GEMINI_MODEL", e.target.value)}
                placeholder="gemini-3.5-flash"
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "var(--bg-color)", border: "1px solid var(--c-border)",
                  borderRadius: "var(--r-md)", color: "var(--c-ink)"
                }}
              />
              <p style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)" }}>
                Model ini akan dicoba pertama kali. Jika limit/kuota habis, sistem akan otomatis mencari model "flash" / "pro" lain di akun Anda.
              </p>
            </div>

            {/* System Prompt */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--c-ink)" }}>System Prompt (Instruksi Dasar)</label>
              <textarea
                value={keys.GEMINI_SYSTEM_PROMPT}
                onChange={(e) => updateKey("GEMINI_SYSTEM_PROMPT", e.target.value)}
                rows={12}
                placeholder="Anda adalah asisten AI..."
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "var(--bg-color)", border: "1px solid var(--c-border)",
                  borderRadius: "var(--r-md)", color: "var(--c-ink)", resize: "vertical",
                  fontFamily: "monospace", fontSize: "0.9rem"
                }}
              />
              <div style={{ padding: "12px", background: "rgba(234, 179, 8, 0.05)", borderRadius: "var(--r-sm)", border: "1px solid rgba(234, 179, 8, 0.1)" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)", margin: 0 }}>
                  <strong>Tip:</strong> Anda tidak perlu memasukkan data katalog manual ke sini. Sistem akan otomatis menarik produk yang "Tersedia" dari Katalog Produk dan menempelkannya di bawah prompt ini secara realtime.
                </p>
              </div>
            </div>

            {/* NOTIFICATION & SUBMIT */}
            <div style={{ borderTop: "1px solid var(--c-border)", paddingTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              {message.text && (
                <div style={{ 
                  padding: 12, 
                  borderRadius: "var(--r-md)", 
                  fontSize: "0.85rem",
                  display: "flex", alignItems: "center", gap: 8,
                  background: message.type === "success" ? "rgba(34, 197, 94, 0.1)" : "rgba(225, 29, 72, 0.1)",
                  color: message.type === "success" ? "#22c55e" : "#e11d48"
                }}>
                  {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {message.text}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: "0.95rem" }}
                >
                  {saving ? (
                    <><Loader2 className="animate-spin" size={18} /> Menyimpan...</>
                  ) : (
                    <><Save size={18} /> Simpan Pengaturan AI</>
                  )}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
