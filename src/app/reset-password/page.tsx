"use client";

import { useState, useTransition, Suspense } from "react";
import { KeyRound } from "lucide-react";
import { updatePassword } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/page-header";
import { Footer } from "@/components/footer";

function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await updatePassword(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <main style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "120px 24px",
      background: "linear-gradient(180deg, rgba(201,168,76,0.02) 0%, transparent 100%)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        top: "10%",
        right: "10%",
        width: "40%",
        height: "60%",
        background: "radial-gradient(circle at center, rgba(201,168,76,0.04) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="card" style={{
        width: "100%",
        maxWidth: "420px",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ textAlign: "center" }}>
          <span className="eyebrow">Pemulihan Akun</span>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--c-ink)",
            marginTop: "8px",
          }}>
            Reset Password
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--c-ink-muted)", marginTop: "8px" }}>
            Masukkan password baru untuk akun Anda
          </p>
        </div>

        <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {error && (
            <div style={{ 
              padding: "12px", 
              borderRadius: "var(--r-sm)", 
              background: "rgba(239, 68, 68, 0.1)", 
              color: "#ef4444", 
              fontSize: "0.85rem",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)", marginBottom: "6px" }}>
              Password Baru
            </label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              required 
              minLength={6}
              className="input-field" 
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)", marginBottom: "6px" }}>
              Konfirmasi Password Baru
            </label>
            <input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              required 
              minLength={6}
              className="input-field" 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }} disabled={isPending}>
            {isPending ? "Memproses..." : (
              <>
                <KeyRound size={16} />
                Simpan Password Baru
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <PageHeader />
      <Suspense fallback={
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-bg)" }}>
          <div style={{ color: "var(--c-gold)" }}>Memuat...</div>
        </main>
      }>
        <ResetPasswordForm />
      </Suspense>
      <Footer />
    </>
  );
}
