"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Grid3X3,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Footer } from "@/components/footer";
import { useCart } from "@/lib/cart-context";
import { formatRupiah } from "@/lib/types";

export default function KeranjangPage() {
  const {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
  } = useCart();

  const isEmpty = cart.items.length === 0;

  return (
    <div className="customer-page">
      {/* Topbar */}
      <header className="topbar" role="banner">
        <Link href="/" className="topbar__brand">
          <img src="/assets/Ela Parfum.svg" alt="Ela Parfum Logo" style={{ height: "40px", width: "auto" }} />
        </Link>
        <div className="topbar__spacer" />
        <nav className="topbar__nav">
          <Link href="/" className="topbar__nav-link"><Package size={15} /> Beranda</Link>
          <Link href="/katalog" className="topbar__nav-link"><Grid3X3 size={15} /> Katalog</Link>
        </nav>
        <div className="topbar__actions">
          <ThemeToggle />
          <div className="btn-icon" style={{ position: "relative", color: "var(--c-gold)" }}>
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                width: 18, height: 18, borderRadius: "50%",
                background: "var(--c-gold)", color: "#0a0c0b",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div style={{ padding: "80px 0 0", width: "min(1200px, calc(100% - 32px))", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.8rem", color: "var(--c-ink-dim)", padding: "16px 0" }}>
          <Link href="/" style={{ color: "var(--c-ink-dim)" }}>Beranda</Link>
          <ChevronRight size={12} />
          <span style={{ color: "var(--c-gold)" }}>Keranjang Belanja</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ width: "min(1200px, calc(100% - 32px))", margin: "0 auto", padding: "8px 0 80px", minHeight: "60vh" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 4vw, 2.6rem)",
          fontWeight: 400,
          color: "var(--c-ink)",
          marginBottom: 32,
          textAlign: "center",
        }}>
          Keranjang <em>Belanja</em>
        </h1>

        {isEmpty ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <ShoppingBag size={64} style={{ color: "var(--c-ink-dim)", opacity: 0.25, marginBottom: 20 }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, color: "var(--c-ink-muted)", marginBottom: 8 }}>
              Keranjang belanja Anda kosong
            </h3>
            <p style={{ color: "var(--c-ink-dim)", fontSize: "0.9rem", marginBottom: 24 }}>
              Sepertinya Anda belum menambahkan parfum apapun.
            </p>
            <Link href="/katalog" className="btn btn-primary">
              <ArrowLeft size={16} />
              Mulai Berbelanja
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
            {/* Left — Cart items */}
            <div>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 16,
              }}>
                <span style={{ fontSize: "0.84rem", color: "var(--c-ink-muted)" }}>
                  {totalItems} item di keranjang
                </span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { if (confirm("Hapus semua item dari keranjang?")) clearCart(); }}
                  style={{ color: "var(--c-rose)" }}
                >
                  <Trash2 size={14} />
                  Kosongkan
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cart.items.map((item) => (
                  <div
                    key={item.sizeId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "60px 1fr auto auto auto",
                      gap: 16,
                      alignItems: "center",
                      padding: 16,
                      background: "var(--c-surface-1)",
                      border: "1px solid var(--c-border)",
                      borderRadius: "var(--r-md)",
                    }}
                  >
                    {/* Thumbnail */}
                    <Link
                      href={`/parfum/${item.perfumeSlug}`}
                      style={{
                        width: 60, height: 60,
                        borderRadius: "var(--r-sm)",
                        background: `linear-gradient(135deg, var(--c-surface-3), var(--c-surface-2))`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Package size={24} style={{ color: "var(--c-ink-dim)", opacity: 0.4 }} />
                    </Link>

                    {/* Info */}
                    <div style={{ minWidth: 0 }}>
                      <Link
                        href={`/parfum/${item.perfumeSlug}`}
                        style={{
                          fontWeight: 600, fontSize: "0.92rem", color: "var(--c-ink)",
                          textDecoration: "none", display: "block",
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}
                      >
                        {item.perfumeName}
                      </Link>
                      <div style={{ fontSize: "0.78rem", color: "var(--c-ink-dim)", marginTop: 2 }}>
                        {item.sizeLabel} · {formatRupiah(item.price)}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div style={{
                      display: "flex", alignItems: "center", gap: 0,
                      border: "1px solid var(--c-border)", borderRadius: "var(--r-sm)",
                      overflow: "hidden",
                    }}>
                      <button
                        onClick={() => updateQuantity(item.sizeId, item.quantity - 1)}
                        className="btn-icon"
                        style={{ borderRadius: 0, width: 32, height: 32, fontSize: "0.8rem" }}
                      >
                        <Minus size={13} />
                      </button>
                      <div style={{
                        width: 36, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 600, fontSize: "0.82rem", color: "var(--c-ink)",
                        borderLeft: "1px solid var(--c-border)", borderRight: "1px solid var(--c-border)",
                      }}>
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => updateQuantity(item.sizeId, item.quantity + 1)}
                        className="btn-icon"
                        style={{ borderRadius: 0, width: 32, height: 32, fontSize: "0.8rem" }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div style={{ fontWeight: 600, fontSize: "0.92rem", color: "var(--c-ink)", whiteSpace: "nowrap" }}>
                      {formatRupiah(item.price * item.quantity)}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.sizeId)}
                      className="btn-icon btn-icon-sm"
                      style={{ color: "var(--c-ink-dim)" }}
                      aria-label={`Hapus ${item.perfumeName}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Summary */}
            <div style={{ position: "sticky", top: 100 }}>
              <div style={{
                background: "var(--c-surface-1)",
                border: "1px solid var(--c-border)",
                borderRadius: "var(--r-lg)",
                padding: 24,
              }}>
                <h3 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.2rem",
                  fontWeight: 400,
                  color: "var(--c-ink)",
                  marginBottom: 20,
                }}>
                  Ringkasan Belanja
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                    <span style={{ color: "var(--c-ink-muted)" }}>Subtotal ({totalItems} item)</span>
                    <span style={{ color: "var(--c-ink)" }}>{formatRupiah(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem" }}>
                    <span style={{ color: "var(--c-ink-muted)" }}>Ongkos Kirim</span>
                    <span style={{ color: "var(--c-teal)", fontSize: "0.82rem" }}>Dihitung saat checkout</span>
                  </div>
                </div>

                <div style={{ height: 1, background: "var(--c-border)", marginBottom: 16 }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--c-ink)" }}>Total</span>
                  <span style={{ fontWeight: 700, fontSize: "1.3rem", color: "var(--c-gold)" }}>
                    {formatRupiah(subtotal)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", height: 46 }}
                >
                  <ChevronRight size={17} />
                  Lanjut ke Pembayaran
                </Link>

                <Link
                  href="/katalog"
                  className="btn btn-ghost"
                  style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
                >
                  <ArrowLeft size={15} />
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
