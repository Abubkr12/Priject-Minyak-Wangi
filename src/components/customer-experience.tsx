"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  ChevronRight,
  ClipboardList,
  Filter,
  ImageUp,
  MessageCircle,
  Package,
  Search,
  Send,
  ShoppingBag,
  Sparkles,
  X
} from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { getMinPrice, formatRupiah } from "@/lib/types";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

const initialMessages: ChatMessage[] = [
  {
    role: "assistant",
    text: "Selamat datang. Saya siap bantu temukan aroma yang cocok untuk Anda — cukup ceritakan suasana, aktivitas, atau parfum yang pernah Anda suka."
  }
];

import type { User } from "@supabase/supabase-js";

export function CustomerExperience({ user, serverPerfumes = [], serverFamilies = [] }: { user?: User | null, serverPerfumes?: any[], serverFamilies?: any[] }) {
  const { totalItems: cartCount } = useCart();
  const [activeFamily, setActiveFamily] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [requestText, setRequestText] = useState("");
  const [selectedSize, setSelectedSize] = useState("30ml");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const heroImages = useMemo(() => [
    "/images/perfume-hero.png",
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=2000",
    "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=2000"
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const filteredPerfumes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return serverPerfumes.filter((p) => {
      const familyName = p.family?.label || "Uncategorized";
      const matchFamily = activeFamily === "All" || familyName === activeFamily;
      const notes = Array.isArray(p.notes) ? p.notes : [];
      const searchable = [p.name, p.collection, familyName, p.mood, ...notes].join(" ").toLowerCase();
      return matchFamily && (!q || searchable.includes(q));
    });
  }, [activeFamily, query, serverPerfumes]);

  const selectedPerfume = filteredPerfumes[0] ?? serverPerfumes[0] ?? null;

  // Auto-scroll chat log
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  async function handleChatSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = chatInput.trim();
    if (!clean || isTyping) return;

    const userMsg: ChatMessage = { role: "user", text: clean };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.text },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Maaf, ada kendala teknis. Silakan coba lagi." },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleRequestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = requestText.trim();
    if (!clean) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        text: `Request custom berhasil dicatat untuk ukuran ${selectedSize}${uploadedFile ? " dengan gambar referensi" : ""}. Admin akan segera merespons dan menghubungi Anda.`
      }
    ]);
    setRequestText("");
    setUploadedFile(null);
  }



  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file.name);
  }

  return (
    <div className="customer-page">
      {/* TOPBAR */}
      <header className="topbar" role="banner">
        <div className="topbar__brand" style={{ textDecoration: "none", cursor: "default" }}>
          <span className="brand-mark">EP</span>
          <div>
            <div className="brand-name">Ela Parfum</div>
            <div className="brand-sub">Parfum Isi Ulang</div>
          </div>
        </div>

        <div className="topbar__spacer" />

        <nav className="topbar__nav" aria-label="Navigasi utama">
          <a href="#catalog" className="topbar__nav-link">
            <Package size={15} />
            Katalog
          </a>
          <a href="#assistant" className="topbar__nav-link">
            <Bot size={15} />
            Konsultasi AI
          </a>
          <a href="#request" className="topbar__nav-link">
            <ClipboardList size={15} />
            Custom Request
          </a>
        </nav>

        <div className="topbar__actions">
          <ThemeToggle />
          {user ? (
            <Link href="/profil" className="btn-icon" aria-label="Profil Saya">
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
          ) : (
            <Link href="/login" className="btn" style={{ padding: '0 16px', height: '36px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.06)' }}>
              Masuk
            </Link>
          )}
          <Link href="/keranjang" className="btn-icon" aria-label={`Keranjang (${cartCount})`} style={{ position: "relative" }}>
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                width: 18, height: 18, borderRadius: "50%",
                background: "var(--c-gold)", color: "#0a0c0b",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" aria-label="Hero section">
        <div className="hero__bg">
          {heroImages.map((src, idx) => (
            <Image
              key={src}
              src={src}
              alt="Koleksi parfum isi ulang premium"
              fill
              priority={idx === 0}
              className="hero__bg-image"
              sizes="100vw"
              style={{
                opacity: idx === heroIndex ? 1 : 0,
                transition: "opacity 1.5s ease-in-out"
              }}
            />
          ))}
          <div className="hero__overlay" />
          <div className="hero__ambient" />
        </div>

        <div className="hero__content">
          <div className="hero__copy animate-fade-up">
            <div className="hero__kicker">
              <span className="hero__kicker-line" />
              <span className="eyebrow">Spesialis Parfum Refill Custom</span>
            </div>

            <h1 className="hero__title">
              Ciptakan<br />
              <em>Aroma</em><br />
              Khasmu
            </h1>

            <p className="hero__desc">
              Pilih dari ratusan bibit unggul kami atau biarkan AI Master Perfumer meracik formula refill khusus berdasarkan kepribadian dan referensi favoritmu.
            </p>

            <div className="hero__actions">
              <Link href="/kustom-refill" className="btn btn-primary">
                <Sparkles size={17} />
                Racik Refill Custom
              </Link>
              <a href="#catalog" className="btn btn-ghost">
                <Package size={17} />
                Katalog Reguler
              </a>
            </div>
          </div>

          <div className="hero__metrics" aria-label="Statistik toko">
            <div className="hero__metric">
              <span className="hero__metric-value">{serverPerfumes.length}+</span>
              <span className="hero__metric-label">Racikan tersedia</span>
            </div>
            <div className="hero__metric">
              <span className="hero__metric-value">{serverFamilies.length}</span>
              <span className="hero__metric-label">Keluarga aroma</span>
            </div>
            <div className="hero__metric">
              <span className="hero__metric-value">30ml</span>
              <span className="hero__metric-label">Ukuran favorit</span>
            </div>
          </div>
        </div>
      </section>

      {/* CATALOG + SIDEBAR */}
      <div className="workspace" id="catalog">
        <div className="workspace-grid">

          {/* LEFT: Catalog */}
          <div className="catalog-col">
            {/* Search + filter bar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20, alignItems: "center" }}>
              <label className="search-wrapper" style={{ flex: 1 }}>
                <Search size={16} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari rose, oud, vanilla, fresh..."
                  aria-label="Cari parfum"
                />
              </label>
              <button className="btn btn-ghost btn-sm">
                <Filter size={15} />
                Filter
              </button>
            </div>

            {/* Aroma tabs */}
            <div className="aroma-filters" role="tablist" aria-label="Filter keluarga aroma">
              <button
                role="tab"
                aria-selected={activeFamily === "All"}
                className={`aroma-tab ${activeFamily === "All" ? "active" : ""}`}
                onClick={() => setActiveFamily("All")}
              >
                <Sparkles size={13} />
                Semua
              </button>
              {serverFamilies.map((fam) => (
                <button
                  key={fam.id}
                  role="tab"
                  aria-selected={activeFamily === fam.label}
                  className={`aroma-tab ${activeFamily === fam.label ? "active" : ""}`}
                  onClick={() => setActiveFamily(fam.label)}
                >
                  {fam.label}
                </button>
              ))}
            </div>

            {/* Section heading */}
            <div style={{ marginBottom: 16 }}>
              <span className="eyebrow">Katalog</span>
              <h2 style={{
                fontFamily: "var(--font-display)", fontSize: "1.8rem",
                fontWeight: 400, color: "var(--c-ink)", marginTop: 4
              }}>
                Pilih arah wanginya
              </h2>
            </div>

            {/* Perfume grid */}
            {filteredPerfumes.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--c-ink-muted)" }}>
                Tidak ada parfum yang cocok. Coba kata kunci lain.
              </div>
            ) : (
              <div className="perfume-grid">
                {filteredPerfumes.map((p) => {
                  const familyName = p.family?.name || "fresh";
                  return (
                  <article className={`perfume-card ${familyName}`} key={p.id}>
                    <div className="perfume-card__thumb" style={{ overflow: "hidden" }}>
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", background: "var(--c-surface-2)" }} />
                      ) : (
                        <>
                          <div className="perfume-card__bottle" />
                          <div className="perfume-card__glow" />
                        </>
                      )}
                    </div>
                    <div className="perfume-card__body">
                      <div className="perfume-card__meta">
                        <span className="perfume-card__collection">{p.collection}</span>
                        <span className="perfume-card__strength">{p.strength}</span>
                      </div>
                      <h3 className="perfume-card__name">{p.name}</h3>
                      <p className="perfume-card__mood">{p.mood}</p>
                      <div className="note-pills">
                        {(Array.isArray(p.notes) ? p.notes : []).slice(0, 3).map((n) => (
                          <span className="note-pill" key={n}>{n}</span>
                        ))}
                      </div>
                      <div className="perfume-card__footer">
                        <span className="perfume-card__price">{formatRupiah(getMinPrice(p.sizes))}</span>
                        <Link
                          href={`/parfum/${p.slug || p.name.toLowerCase().replace(/\s+/g, "-")}`}
                          className="btn btn-primary btn-sm"
                          aria-label={`Pilih ${p.name}`}
                        >
                          <Sparkles size={14} />
                          Pilih
                        </Link>
                      </div>
                    </div>
                  </article>
                )})}
              </div>
            )}
          </div>

          {/* RIGHT: AI + Request */}
          <aside className="sidebar-col" id="assistant" aria-label="Panel asisten dan request">

            {/* AI Assistant */}
            <div className="assistant-card">
              <div className="assistant-header">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 2 }}>AI Assistant</div>
                  <div className="assistant-title">Scent Advisor</div>
                </div>
                <div className="ai-status">
                  <span className="ai-status-dot" />
                  Online
                </div>
              </div>

              <div className="match-preview">
                <div className="match-preview__kicker">Rekomendasi aktif</div>
                <div className="match-preview__name">{selectedPerfume?.name || "Belum ada produk"}</div>
                <div className="match-preview__desc">{selectedPerfume?.match || "AI akan menyesuaikan dengan preferensi Anda"}</div>
                <div className="match-chips">
                  <span className="chip chip-active">{selectedPerfume?.family?.label || "Uncategorized"}</span>
                  <span className="chip">{selectedPerfume?.longevity || "Ketahanan"}</span>
                  <span className="chip">Stok {selectedPerfume?.stock || 0}</span>
                </div>
              </div>

              <div className="chat-log" ref={chatLogRef} aria-live="polite" aria-label="Riwayat percakapan">
                {messages.map((msg, i) => (
                  <div
                    key={`${msg.role}-${i}`}
                    className={msg.role === "assistant" ? "bubble bubble-ai" : "bubble bubble-user"}
                  >
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="bubble bubble-ai" style={{ color: "var(--c-ink-muted)", fontSize: "0.8rem" }}>
                    Mengetik...
                  </div>
                )}
              </div>

              <form className="chat-input-row" onSubmit={handleChatSubmit}>
                <input
                  className="chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Contoh: suka aroma manis untuk sehari-hari..."
                  aria-label="Tulis pesan ke AI"
                />
                <button type="submit" className="btn-icon btn-icon-sm" aria-label="Kirim pesan">
                  <Send size={16} />
                </button>
              </form>
            </div>

            {/* Custom Request */}
            <form className="request-card" onSubmit={handleRequestSubmit} id="request">
              <div className="request-card__header">
                <div>
                  <span className="eyebrow">Custom Request</span>
                  <div className="request-card__title">Brief Racikan</div>
                </div>
                <button
                  type="button"
                  className="btn-icon btn-icon-sm"
                  aria-label="Upload gambar referensi"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageUp size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  aria-label="Upload gambar parfum referensi"
                />
              </div>

              {uploadedFile && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", background: "var(--c-gold-dim)",
                  border: "1px solid rgba(201,168,76,0.25)", borderRadius: "var(--r-sm)",
                  fontSize: "0.8rem", color: "var(--c-gold-light)"
                }}>
                  <span>{uploadedFile}</span>
                  <button type="button" onClick={() => setUploadedFile(null)} aria-label="Hapus file">
                    <X size={14} />
                  </button>
                </div>
              )}

              {!uploadedFile && (
                <button
                  type="button"
                  className="upload-zone"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload gambar parfum referensi"
                >
                  <ImageUp size={20} style={{ color: "var(--c-gold)", opacity: 0.7 }} />
                  <span style={{ fontWeight: 500, color: "var(--c-ink-muted)" }}>Upload foto parfum referensi</span>
                  <span style={{ fontSize: "0.74rem", color: "var(--c-ink-dim)" }}>
                    JPG, PNG — kami akan mencoba mencocokan aromanya
                  </span>
                </button>
              )}

              <div>
                <div style={{ fontSize: "0.78rem", color: "var(--c-ink-muted)", marginBottom: 8, fontWeight: 500 }}>
                  Ukuran botol
                </div>
                <div className="size-tabs">
                  {["10ml", "30ml", "50ml", "100ml"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`size-tab ${selectedSize === s ? "active" : ""}`}
                      onClick={() => setSelectedSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                className="textarea-field"
                value={requestText}
                onChange={(e) => setRequestText(e.target.value)}
                placeholder="Tulis brief: karakter aroma, referensi parfum, acara, seberapa manis/kuat yang Anda inginkan..."
                rows={4}
                aria-label="Deskripsi request racikan"
              />

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                <ChevronRight size={17} />
                Kirim Request
              </button>
            </form>

          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
