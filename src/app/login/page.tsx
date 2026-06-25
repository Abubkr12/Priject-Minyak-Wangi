"use client";

import Link from "next/link";
import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LogIn, ArrowRight } from "lucide-react";
import { login, signInWithGoogle } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/page-header";
import { Footer } from "@/components/footer";

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const errorParam = searchParams.get("error");

  async function handleLogin(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
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
            <span className="eyebrow">Selamat Datang</span>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 400,
              color: "var(--c-ink)",
              marginTop: "8px",
            }}>
              Masuk ke Akun
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--c-ink-muted)", marginTop: "8px" }}>
              Lanjutkan perjalanan aroma Anda
            </p>
          </div>

          <form action={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {message && (
              <div style={{ 
                padding: "12px", 
                borderRadius: "var(--r-sm)", 
                background: "rgba(45, 212, 180, 0.1)", 
                color: "var(--c-teal)", 
                fontSize: "0.85rem",
                border: "1px solid rgba(45, 212, 180, 0.2)",
              }}>
                {message}
              </div>
            )}
            
            {(error || errorParam) && (
              <div style={{ 
                padding: "12px", 
                borderRadius: "var(--r-sm)", 
                background: "rgba(239, 68, 68, 0.1)", 
                color: "#ef4444", 
                fontSize: "0.85rem",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}>
                {error || "Gagal masuk, silakan coba lagi."}
              </div>
            )}

            <input type="hidden" name="next" value={searchParams.get("next") || "/"} />

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

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label htmlFor="password" style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)" }}>
                  Password
                </label>
                <Link href="/lupa-password" style={{ fontSize: "0.8rem", color: "var(--c-gold)", textDecoration: "none" }}>
                  Lupa password?
                </Link>
              </div>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="input-field" 
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: "8px" }} disabled={isPending}>
              {isPending ? "Memproses..." : (
                <>
                  <LogIn size={16} />
                  Masuk
                </>
              )}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--c-border)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--c-ink-dim)" }}>atau</span>
            <div style={{ flex: 1, height: "1px", background: "var(--c-border)" }} />
          </div>

          <form action={signInWithGoogle}>
            <button type="submit" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center", border: "1px solid var(--c-border)" }}>
              <GoogleIcon />
              Login dengan Google
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--c-ink-muted)", marginTop: "8px" }}>
            Belum punya akun?{" "}
            <Link href="/register" style={{ color: "var(--c-gold)", fontWeight: 500, textDecoration: "none" }}>
              Daftar sekarang <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default function LoginPage() {
  return (
    <>
      <PageHeader />
      <Suspense fallback={
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--c-bg)" }}>
          <div style={{ color: "var(--c-gold)" }}>Memuat...</div>
        </main>
      }>
        <LoginForm />
      </Suspense>
      <Footer />
    </>
  );
}
