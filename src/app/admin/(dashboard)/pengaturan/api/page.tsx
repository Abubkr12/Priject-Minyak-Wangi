"use client";

import { useState, useEffect } from "react";
import { KeyRound, Shield, AlertCircle, Save, Loader2, CheckCircle2, Eye, EyeOff, Edit2 } from "lucide-react";
import { getStoreSettings, saveStoreSetting } from "./actions";

function MaskedApiInput({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  multiline = false 
}: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void, 
  placeholder?: string,
  multiline?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showValue, setShowValue] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--c-ink)" }}>{label}</label>
        <div style={{ display: "flex", gap: 8 }}>
          {value && !isEditing && (
            <button 
              type="button" 
              onClick={() => setShowValue(!showValue)}
              style={{ background: "transparent", border: "none", color: "var(--c-ink-dim)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}
            >
              {showValue ? <><EyeOff size={14}/> Sembunyikan</> : <><Eye size={14}/> Lihat</>}
            </button>
          )}
          {!isEditing ? (
            <button 
              type="button" 
              onClick={() => setIsEditing(true)}
              style={{ background: "transparent", border: "none", color: "var(--c-gold)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 500 }}
            >
              <Edit2 size={14} /> Edit
            </button>
          ) : (
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              style={{ background: "transparent", border: "none", color: "var(--c-ink)", cursor: "pointer", fontSize: "0.8rem" }}
            >
              Selesai
            </button>
          )}
        </div>
      </div>
      
      {multiline ? (
        <textarea
          value={!isEditing && !showValue && value ? "••••••••••••••••••••••••••••••••" : value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={!isEditing}
          rows={4}
          style={{ 
            width: "100%", 
            padding: "12px 16px", 
            fontFamily: (isEditing || showValue) ? "monospace" : "inherit", 
            background: isEditing ? "var(--bg-color)" : "var(--c-surface-1)",
            border: `1px solid ${isEditing ? "var(--c-gold)" : "var(--c-border)"}`,
            borderRadius: "var(--r-md)",
            color: (isEditing || showValue) ? "var(--c-ink)" : "var(--c-ink-muted)",
            opacity: isEditing ? 1 : 0.7,
            resize: "vertical"
          }}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={!isEditing && !showValue ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={!isEditing}
          style={{ 
            flex: 1, 
            width: "100%",
            padding: "12px 16px",
            fontFamily: (isEditing || showValue) ? "monospace" : "inherit", 
            background: isEditing ? "var(--bg-color)" : "var(--c-surface-1)",
            border: `1px solid ${isEditing ? "var(--c-gold)" : "var(--c-border)"}`,
            borderRadius: "var(--r-md)",
            color: (isEditing || showValue) ? "var(--c-ink)" : "var(--c-ink-muted)",
            opacity: isEditing ? 1 : 0.7
          }}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

export default function ApiSettingsPage() {
  const [keys, setKeys] = useState({
    GEMINI_API_KEY: "",
    GEMINI_SYSTEM_PROMPT: "Anda adalah asisten AI dari toko Minyak Wangi. Jawab dengan ramah, informatif, dan membantu.",
    MIDTRANS_IS_PRODUCTION: "false",
    MIDTRANS_SERVER_KEY_SANDBOX: "",
    MIDTRANS_CLIENT_KEY_SANDBOX: "",
    MIDTRANS_SERVER_KEY_PRODUCTION: "",
    MIDTRANS_CLIENT_KEY_PRODUCTION: "",
    BITESHIP_API_KEY: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    async function load() {
      const settings = await getStoreSettings();
      const newKeys = { ...keys };
      settings.forEach((s: any) => {
        if (s.key in newKeys) {
          (newKeys as any)[s.key] = s.value || "";
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
      setMessage({ text: "Pengaturan API berhasil disimpan.", type: "success" });
    } else {
      setMessage({ text: "Beberapa kunci gagal disimpan.", type: "error" });
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

  const isProduction = keys.MIDTRANS_IS_PRODUCTION === "true";

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--c-ink)", marginBottom: 8 }}>
          Pengaturan Integrasi API
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>
          Kelola kunci akses untuk pihak ketiga (AI, Payment Gateway, Ekspedisi).
        </p>
      </div>

      <div style={{ background: "var(--c-surface-1)", borderRadius: "var(--r-lg)", border: "1px solid var(--c-border)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--r-md)", background: "var(--glass-bg)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--c-gold)" }}>
            <KeyRound size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--c-ink)" }}>Konfigurasi API Keys</h2>
            <div style={{ fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>Sistem menyimpan kredensial dengan aman di database.</div>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ background: "rgba(234, 179, 8, 0.1)", border: "1px solid rgba(234, 179, 8, 0.2)", borderRadius: "var(--r-md)", padding: "16px", marginBottom: "32px", display: "flex", gap: "12px", color: "var(--c-ink)" }}>
            <Shield size={20} style={{ color: "#eab308", flexShrink: 0 }} />
            <div style={{ fontSize: "0.9rem", lineHeight: 1.5 }}>
              <strong>Area Keamanan:</strong> Kunci-kunci di bawah ini memberikan akses penuh ke layanan terkait. Klik 'Edit' untuk mengubah nilai. Jangan pernah menunjukkannya di layar publik.
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            
            {/* GEMINI AI */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--c-gold)", borderBottom: "1px solid var(--c-border)", paddingBottom: 8 }}>Google Gemini AI</h3>
              
              <MaskedApiInput 
                label="API Key Gemini" 
                value={keys.GEMINI_API_KEY} 
                onChange={(val) => updateKey("GEMINI_API_KEY", val)} 
                placeholder="AIzaSy..." 
              />
            </div>

            {/* MIDTRANS */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--c-border)", paddingBottom: 8 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--c-gold)", margin: 0 }}>Midtrans Payment Gateway</h3>
                
                {/* Environment Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.85rem", color: isProduction ? "var(--c-ink-dim)" : "var(--c-ink)", fontWeight: isProduction ? 400 : 600 }}>Sandbox</span>
                  <button 
                    type="button"
                    onClick={() => updateKey("MIDTRANS_IS_PRODUCTION", isProduction ? "false" : "true")}
                    style={{ 
                      width: 44, height: 24, borderRadius: 12, border: "none", 
                      background: isProduction ? "var(--c-gold)" : "var(--c-border)",
                      position: "relative", cursor: "pointer", transition: "0.3s"
                    }}
                  >
                    <div style={{
                      position: "absolute", top: 2, left: isProduction ? 22 : 2,
                      width: 20, height: 20, borderRadius: "50%", background: "#fff",
                      transition: "0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }} />
                  </button>
                  <span style={{ fontSize: "0.85rem", color: isProduction ? "var(--c-ink)" : "var(--c-ink-dim)", fontWeight: isProduction ? 600 : 400 }}>Production</span>
                </div>
              </div>

              <div style={{ background: "var(--bg-color)", padding: 16, borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ padding: "4px 8px", background: isProduction ? "rgba(201,168,76,0.1)" : "rgba(100,100,100,0.1)", color: isProduction ? "var(--c-gold)" : "var(--c-ink)", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600 }}>
                    {isProduction ? "MODE PRODUCTION" : "MODE SANDBOX"}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)" }}>
                    {isProduction ? "Transaksi uang asli (Live)." : "Gunakan untuk testing."}
                  </span>
                </div>

                {isProduction ? (
                  <>
                    <MaskedApiInput 
                      label="Server Key (Production)" 
                      value={keys.MIDTRANS_SERVER_KEY_PRODUCTION} 
                      onChange={(val) => updateKey("MIDTRANS_SERVER_KEY_PRODUCTION", val)} 
                      placeholder="Mid-server-..." 
                    />
                    <MaskedApiInput 
                      label="Client Key (Production)" 
                      value={keys.MIDTRANS_CLIENT_KEY_PRODUCTION} 
                      onChange={(val) => updateKey("MIDTRANS_CLIENT_KEY_PRODUCTION", val)} 
                      placeholder="Mid-client-..." 
                    />
                  </>
                ) : (
                  <>
                    <MaskedApiInput 
                      label="Server Key (Sandbox)" 
                      value={keys.MIDTRANS_SERVER_KEY_SANDBOX} 
                      onChange={(val) => updateKey("MIDTRANS_SERVER_KEY_SANDBOX", val)} 
                      placeholder="SB-Mid-server-..." 
                    />
                    <MaskedApiInput 
                      label="Client Key (Sandbox)" 
                      value={keys.MIDTRANS_CLIENT_KEY_SANDBOX} 
                      onChange={(val) => updateKey("MIDTRANS_CLIENT_KEY_SANDBOX", val)} 
                      placeholder="SB-Mid-client-..." 
                    />
                  </>
                )}
              </div>
            </div>

            {/* BITESHIP */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--c-gold)", borderBottom: "1px solid var(--c-border)", paddingBottom: 8 }}>Biteship Logistics</h3>
              
              <MaskedApiInput 
                label="API Key Biteship" 
                value={keys.BITESHIP_API_KEY} 
                onChange={(val) => updateKey("BITESHIP_API_KEY", val)} 
                placeholder="biteship_live_..." 
              />
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
                    <><Save size={18} /> Simpan Perubahan</>
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
