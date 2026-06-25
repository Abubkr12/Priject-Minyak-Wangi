"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/page-header";
import { Footer } from "@/components/footer";

function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await requestPasswordReset(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
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
            Lupa Password
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--c-ink-muted)", marginTop: "8px" }}>
            Masukkan email Anda untuk menerima tautan reset password
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ 
              padding: "16px", 
              borderRadius: "var(--r-sm)", 
              background: "rgba(45, 212, 180, 0.1)", 
              color: "var(--c-teal)", 
              fontSize: "0.9rem",
              border: "1px solid rgba(45, 212, 180, 0.2)",
            }}>
              Tautan reset password telah dikirim ke email Anda. Silakan cek kotak masuk atau folder spam.
            </div>
            <Link href="/login" className="btn btn-primary" style={{ justifyContent: "center" }}>
              Kembali ke Login
            </Link>
          </div>
        ) : (
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
              <label htmlFor="email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)", marginBottom: "6px" }}>
                Email
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="input-field" 
                placeholder="nama@email.com"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }} disabled={isPending}>
              {isPending ? "Memproses..." : (
                <>
                  <Mail size={16} />
                  Kirim Tautan
                </>
              )}
            </button>
            
            <Link href="/login" style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px", 
              fontSize: "0.85rem", 
              color: "var(--c-ink-muted)", 
              marginTop: "8px",
              textDecoration: "none" 
            }}>
              <ArrowLeft size={14} />
              Kembali ke Login
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHeader />
      <ForgotPasswordForm />
      <Footer />
    </>
  );
}
