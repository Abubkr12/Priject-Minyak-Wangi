"use client";

import { PageHeader } from "@/components/page-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, FileImage, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RefillLandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="customer-page" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="topbar" role="banner" style={{ borderBottom: "1px solid var(--c-border)", background: "var(--glass-bg)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <Link href="/" className="topbar__brand">
          <img src="/assets/Ela Parfum.svg" alt="Ela Parfum Logo" style={{ height: "40px", width: "auto" }} />
        </Link>
        <div className="topbar__spacer" />
        <ThemeToggle />
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px" }}>
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          style={{ maxWidth: 900, width: "100%", textAlign: "center" }}
        >
          <motion.div variants={itemVariants} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 100, background: "rgba(201, 168, 76, 0.1)", color: "var(--c-gold)", marginBottom: 24, fontSize: "0.9rem", fontWeight: 500 }}>
            <Sparkles size={16} />
            Layanan Refill Parfum
          </motion.div>
          
          <motion.h1 variants={itemVariants} style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--c-ink)", marginBottom: 24, lineHeight: 1.1, letterSpacing: "-1px" }}>
            Pilih Cara Refill Parfum Anda
          </motion.h1>
          
          <motion.p variants={itemVariants} style={{ fontSize: "1.1rem", color: "var(--c-ink-dim)", maxWidth: 600, margin: "0 auto 48px auto", lineHeight: 1.6 }}>
            Kami menyediakan dua cara mudah untuk meracik dan memesan refill parfum sesuai selera Anda. Pilih metode yang paling nyaman bagi Anda.
          </motion.p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, textAlign: "left" }}>
            
            {/* Opsi 1: Form / AI Advisor */}
            <motion.div variants={itemVariants}>
              <Link href="/kustom-refill" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 32, borderRadius: "var(--r-lg)", background: "var(--c-surface-1)", border: "1px solid var(--c-border)", textDecoration: "none", transition: "all 0.3s ease", position: "relative", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
                className="hover-card"
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "rgba(201, 168, 76, 0.1)", color: "var(--c-gold)", marginBottom: 24 }}>
                  <FileImage size={32} />
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--c-ink)", marginBottom: 12 }}>Refill via AI & Gambar</h3>
                <p style={{ color: "var(--c-ink-dim)", marginBottom: 32, lineHeight: 1.6, flex: 1 }}>
                  Unggah gambar botol parfum referensi Anda atau deskripsikan wangi yang diinginkan. AI kami akan meracik komposisi terbaik untuk Anda.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--c-gold)", fontWeight: 600, marginTop: "auto" }}>
                  Mulai Meracik <ArrowRight size={18} />
                </div>
              </Link>
            </motion.div>

            {/* Opsi 2: Chat */}
            <motion.div variants={itemVariants}>
              <button 
                onClick={() => {
                  document.getElementById('chatbot-toggle')?.click();
                }}
                style={{ width: "100%", display: "flex", flexDirection: "column", height: "100%", padding: 32, borderRadius: "var(--r-lg)", background: "var(--c-surface-1)", border: "1px solid var(--c-border)", textDecoration: "none", transition: "all 0.3s ease", position: "relative", overflow: "hidden", textAlign: "left", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
                className="hover-card"
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", marginBottom: 24 }}>
                  <MessageSquare size={32} />
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--c-ink)", marginBottom: 12 }}>Refill via Live Chat</h3>
                <p style={{ color: "var(--c-ink-dim)", marginBottom: 32, lineHeight: 1.6, flex: 1 }}>
                  Konsultasikan langsung wangi yang Anda cari dengan asisten ahli kami melalui chat. Proses cepat, mudah, dan interaktif.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#3b82f6", fontWeight: 600, marginTop: "auto" }}>
                  Mulai Chat <ArrowRight size={18} />
                </div>
              </button>
            </motion.div>

          </div>
        </motion.div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hover-card:hover {
          transform: translateY(-4px);
          border-color: var(--c-gold);
          box-shadow: 0 12px 30px rgba(201, 168, 76, 0.15) !important;
        }
        button.hover-card:hover {
          border-color: #3b82f6;
          box-shadow: 0 12px 30px rgba(59, 130, 246, 0.15) !important;
        }
      `}} />
    </div>
  );
}
