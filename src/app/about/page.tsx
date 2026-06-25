import type { Metadata } from "next";
import {
  Gem,
  Sparkles,
  BrainCircuit,
  BadgeDollarSign,
  Eye,
  Target,
  Droplets,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Tentang Kami — Ela Parfum",
  description:
    "Kenali visi, misi, dan nilai-nilai yang menjadikan Ela Parfum toko parfum isi ulang pilihan Anda.",
};

const values = [
  {
    icon: Gem,
    title: "Kualitas Premium",
    desc: "Setiap tetes menggunakan bahan baku parfum grade tertinggi — essential oil impor dan komposisi yang dikurasi ketat.",
  },
  {
    icon: Sparkles,
    title: "Racikan Personal",
    desc: "Bukan sekadar isi ulang. Kami meracik aroma berdasarkan preferensi unik setiap pelanggan, menjadikan setiap botol benar-benar milik Anda.",
  },
  {
    icon: BrainCircuit,
    title: "AI Konsultasi",
    desc: "Asisten AI kami menganalisis selera Anda dan merekomendasikan aroma yang paling cocok — tanpa trial-error yang memakan waktu.",
  },
  {
    icon: BadgeDollarSign,
    title: "Harga Terjangkau",
    desc: "Aroma setara merek ternama dengan harga yang bersahabat. Kualitas tidak harus mahal.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader />

      <main style={{ paddingTop: "64px" }}>
        {/* ── Hero ── */}
        <section
          style={{
            padding: "80px 0 56px",
            background:
              "linear-gradient(180deg, rgba(201,168,76,0.04) 0%, transparent 100%)",
            borderBottom: "1px solid var(--c-border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient glow */}
          <div
            style={{
              position: "absolute",
              top: "-30%",
              right: "-10%",
              width: "50%",
              height: "100%",
              background:
                "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div className="section" style={{ padding: "0", position: "relative", zIndex: 1 }}>
            <span className="eyebrow">Tentang Kami</span>
            <div className="gold-line" />
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
                fontWeight: 300,
                lineHeight: 1.08,
                marginTop: "12px",
                color: "var(--c-ink)",
              }}
            >
              Aroma yang{" "}
              <em style={{ fontStyle: "italic", color: "var(--c-gold-light)" }}>Mendefinisikan</em>{" "}
              Anda
            </h1>
            <p
              style={{
                marginTop: "20px",
                fontSize: "1.05rem",
                color: "var(--c-ink-muted)",
                lineHeight: 1.72,
                maxWidth: "580px",
              }}
            >
              Ela Parfum hadir sebagai destinasi parfum isi ulang yang menggabungkan keahlian
              tradisional peracik aroma dengan teknologi AI modern — menciptakan pengalaman
              wewangian yang personal dan terjangkau.
            </p>
          </div>
        </section>

        {/* ── Visi ── */}
        <section
          className="section"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "48px",
            alignItems: "center",
            paddingTop: "72px",
            paddingBottom: "72px",
          }}
        >
          <div>
            <span className="eyebrow">Visi Kami</span>
            <div className="gold-line" />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 400,
                lineHeight: 1.15,
                marginTop: "12px",
                color: "var(--c-ink)",
              }}
            >
              Menjadikan Wewangian Premium Bisa Diakses Semua Orang
            </h2>
            <p
              style={{
                marginTop: "16px",
                fontSize: "0.95rem",
                color: "var(--c-ink-muted)",
                lineHeight: 1.72,
              }}
            >
              Kami percaya setiap orang berhak memiliki aroma yang merepresentasikan
              kepribadiannya — tanpa harus mengeluarkan jutaan rupiah. Visi kami adalah
              mendemokratisasi akses terhadap wewangian berkualitas tinggi melalui inovasi
              dan teknologi.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              placeItems: "center",
              height: "280px",
              borderRadius: "var(--r-lg)",
              background:
                "linear-gradient(135deg, var(--c-surface-2) 0%, var(--c-surface-3) 100%)",
              border: "1px solid var(--c-border)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 30% 60%, rgba(201,168,76,0.08) 0%, transparent 50%)",
              }}
            />
            <Eye
              size={64}
              strokeWidth={1}
              style={{ color: "var(--c-gold)", opacity: 0.5 }}
            />
          </div>
        </section>

        {/* ── Misi (reversed) ── */}
        <section
          style={{
            background: "var(--c-surface-1)",
            borderTop: "1px solid var(--c-border)",
            borderBottom: "1px solid var(--c-border)",
          }}
        >
          <div
            className="section"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "48px",
              alignItems: "center",
              paddingTop: "72px",
              paddingBottom: "72px",
            }}
          >
            <div
              style={{
                display: "grid",
                placeItems: "center",
                height: "280px",
                borderRadius: "var(--r-lg)",
                background:
                  "linear-gradient(135deg, var(--c-surface-2) 0%, var(--c-surface-3) 100%)",
                border: "1px solid var(--c-border)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 70% 40%, rgba(201,168,76,0.08) 0%, transparent 50%)",
                }}
              />
              <Target
                size={64}
                strokeWidth={1}
                style={{ color: "var(--c-gold)", opacity: 0.5 }}
              />
            </div>
            <div>
              <span className="eyebrow">Misi Kami</span>
              <div className="gold-line" />
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                  fontWeight: 400,
                  lineHeight: 1.15,
                  marginTop: "12px",
                  color: "var(--c-ink)",
                }}
              >
                Meracik Keunggulan dalam Setiap Tetes
              </h2>
              <ul
                style={{
                  marginTop: "16px",
                  paddingLeft: "0",
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {[
                  "Menyediakan parfum isi ulang dengan standar kualitas setara merek internasional",
                  "Menghadirkan pengalaman konsultasi aroma berbasis AI yang akurat dan personal",
                  "Menerima permintaan racikan custom untuk setiap kebutuhan pelanggan",
                  "Menjaga harga tetap terjangkau tanpa mengorbankan kualitas bahan",
                ].map((item, i) => (
                  <li
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      fontSize: "0.95rem",
                      color: "var(--c-ink-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    <Droplets
                      size={16}
                      style={{
                        color: "var(--c-gold)",
                        flexShrink: 0,
                        marginTop: "4px",
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Values Grid ── */}
        <section className="section" style={{ paddingTop: "72px", paddingBottom: "80px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="eyebrow">Kenapa Memilih Kami</span>
            <div className="gold-line" style={{ margin: "8px auto" }} />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 400,
                color: "var(--c-ink)",
                marginTop: "12px",
              }}
            >
              Nilai yang Kami Pegang
            </h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {values.map((v) => (
              <div
                key={v.title}
                className="card"
                style={{
                  padding: "28px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  transition: "transform 200ms var(--ease-out), border-color 200ms",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--r-md)",
                    background: "var(--c-gold-dim)",
                    border: "1px solid rgba(201,168,76,0.2)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <v.icon size={22} style={{ color: "var(--c-gold)" }} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.2rem",
                    fontWeight: 500,
                    color: "var(--c-ink)",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.88rem",
                    color: "var(--c-ink-muted)",
                    lineHeight: 1.65,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Closing statement ── */}
        <section
          style={{
            borderTop: "1px solid var(--c-border)",
            background:
              "linear-gradient(180deg, transparent 0%, rgba(201,168,76,0.03) 100%)",
          }}
        >
          <div
            className="section"
            style={{
              textAlign: "center",
              maxWidth: "640px",
              margin: "0 auto",
              paddingTop: "56px",
              paddingBottom: "56px",
            }}
          >
            <Award
              size={32}
              strokeWidth={1.2}
              style={{ color: "var(--c-gold)", margin: "0 auto 16px" }}
            />
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.5rem",
                fontWeight: 400,
                color: "var(--c-ink)",
                marginBottom: "12px",
              }}
            >
              Dibuat dengan Dedikasi di Palembang
            </h2>
            <p
              style={{
                fontSize: "0.92rem",
                color: "var(--c-ink-muted)",
                lineHeight: 1.72,
              }}
            >
              Setiap parfum yang kami racik adalah hasil dari perhatian terhadap detail,
              passion terhadap wewangian, dan komitmen untuk memberikan yang terbaik
              bagi setiap pelanggan kami.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 768px) {
          section .section[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
