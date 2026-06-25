"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn, Fingerprint, ShieldAlert, ArrowRight } from "lucide-react";
import { adminLogin } from "./actions";
import { ThemeToggle } from "@/components/theme-toggle";

function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  async function handleLogin(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await adminLogin(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <main style={{ 
      minHeight: "100vh", 
      width: "100%",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "var(--c-surface-1)",
      backgroundImage: "radial-gradient(circle at 50% 0%, rgba(201,168,76,0.08) 0%, transparent 60%)",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Decorative background elements */}
      <div style={{ position: "absolute", top: "10%", left: "20%", width: 300, height: 300, background: "var(--c-gold)", borderRadius: "50%", filter: "blur(120px)", opacity: 0.1, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "20%", width: 250, height: 250, background: "var(--c-teal)", borderRadius: "50%", filter: "blur(120px)", opacity: 0.05, pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: 32, right: 32, zIndex: 10 }}>
        <ThemeToggle />
      </div>

      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "var(--bg-color)",
        border: "1px solid var(--c-border)",
        borderRadius: "var(--r-xl)",
        padding: "48px 40px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(201,168,76,0.1)",
        position: "relative",
        zIndex: 1,
        backdropFilter: "blur(20px)"
      }}>
        
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ 
            width: 56, 
            height: 56, 
            background: "linear-gradient(135deg, var(--c-gold) 0%, #b8913b 100%)", 
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#000",
            marginBottom: 20,
            boxShadow: "0 8px 16px rgba(201,168,76,0.3)"
          }}>
            <Fingerprint size={28} strokeWidth={1.5} />
          </div>
          <h1 style={{
            fontSize: "1.75rem",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "var(--c-ink)",
            fontFamily: "var(--font-display)"
          }}>
            Akses Terbatas
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--c-ink-dim)", marginTop: "8px", lineHeight: 1.5 }}>
            Masuk dengan kredensial staf Anda untuk mengakses Ruang Komando Internal.
          </p>
        </div>

        <form action={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {(error || errorParam) && (
            <div style={{ 
              padding: "12px 16px", 
              borderRadius: "var(--r-md)", 
              background: "rgba(225, 29, 72, 0.08)", 
              color: "var(--c-rose)", 
              fontSize: "0.85rem",
              border: "1px solid rgba(225, 29, 72, 0.2)",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px"
            }}>
              <ShieldAlert size={16} style={{ marginTop: 2, flexShrink: 0 }} />
              <div>{error || "Akses ditolak. Kredensial tidak valid."}</div>
            </div>
          )}

          <input type="hidden" name="next" value="/admin" />

          <div>
            <label htmlFor="email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)", marginBottom: "8px", letterSpacing: "0.01em" }}>
              Alamat Email (Username)
            </label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              required 
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: "var(--c-surface-1)", 
                border: "1px solid var(--c-border)", 
                borderRadius: "var(--r-md)", 
                color: "var(--c-ink)",
                fontSize: "0.95rem",
                transition: "border-color 0.2s"
              }}
              placeholder="karyawan@minyakwangi.com"
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)", marginBottom: "8px", letterSpacing: "0.01em" }}>
              Password Akses
            </label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              style={{ 
                width: "100%", 
                padding: "12px 16px", 
                background: "var(--c-surface-1)", 
                border: "1px solid var(--c-border)", 
                borderRadius: "var(--r-md)", 
                color: "var(--c-ink)",
                fontSize: "0.95rem",
                transition: "border-color 0.2s"
              }}
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            style={{ 
              width: "100%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 8, 
              padding: "12px", 
              background: "var(--c-gold)", 
              color: "#000", 
              border: "none", 
              borderRadius: "var(--r-md)", 
              fontSize: "0.95rem", 
              fontWeight: 600, 
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.8 : 1,
              marginTop: "8px"
            }}
          >
            {isPending ? "Memverifikasi..." : (
              <>
                <LogIn size={16} />
                Akses Dasbor
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", borderTop: "1px solid var(--c-border)", paddingTop: 24 }}>
          <p style={{ fontSize: "0.75rem", color: "var(--c-ink-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Minyak Wangi Internal System
          </p>
        </div>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--c-surface-1)" }} />}>
      <AdminLoginForm />
    </Suspense>
  );
}
