"use client";

import Link from "next/link";
import {
  BarChart3,
  Bot,
  ClipboardList,
  Gauge,
  Home,
  Package,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users
} from "lucide-react";
import { dashboardStats, perfumes, recentRequests, topAromas } from "@/lib/mock-data";
import { useState } from "react";

const navItems = [
  { icon: Gauge,         label: "Overview",    id: "overview",  badge: null },
  { icon: ClipboardList, label: "Request",     id: "requests",  badge: "4" },
  { icon: Package,       label: "Parfum",      id: "perfumes",  badge: null },
  { icon: Users,         label: "Customer",    id: "customers", badge: null },
  { icon: Bot,           label: "AI Log",      id: "ai",        badge: null },
  { icon: BarChart3,     label: "Statistik",   id: "stats",     badge: null },
  { icon: Settings,      label: "Pengaturan",  id: "settings",  badge: null },
];

const statIcons = [TrendingUp, ClipboardList, Bot, TrendingUp];

export function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("overview");

  return (
    <div className="admin-shell">
      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside className="admin-sidebar" aria-label="Navigasi admin">
        <div className="admin-brand">
          <div className="admin-brand__mark">N</div>
          <div className="admin-brand__text">
            <strong>Ela Parfum</strong>
            <small>Internal</small>
          </div>
        </div>

        <div className="admin-nav-section">
          <div className="admin-nav-label">Menu Utama</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`admin-nav-item ${activeNav === item.id ? "active" : ""}`}
                onClick={() => setActiveNav(item.id)}
                aria-current={activeNav === item.id ? "page" : undefined}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="admin-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "auto", paddingTop: 16 }}>
          <Link href="/" className="admin-nav-item">
            <Home size={17} />
            Customer View
          </Link>
        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────── */}
      <main className="admin-main" id="overview">

        {/* Topbar */}
        <div className="admin-topbar">
          <div className="admin-topbar__title">
            <div className="eyebrow">Internal Dashboard</div>
            <h1>Statistik Toko</h1>
          </div>
          <div className="admin-topbar__actions">
            <label className="search-wrapper" style={{ width: 280 }}>
              <Search size={15} />
              <input placeholder="Cari order, parfum, customer..." aria-label="Cari di dashboard" />
            </label>
            <button className="btn btn-primary btn-sm">
              <Plus size={15} />
              Tambah Parfum
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <section className="stat-grid" aria-label="Ringkasan statistik">
          {dashboardStats.map((stat, i) => {
            const Icon = statIcons[i];
            return (
              <article className="stat-card" key={stat.label}>
                <div className="stat-card__icon">
                  <Icon size={20} />
                </div>
                <div className="stat-card__label">{stat.label}</div>
                <strong className="stat-card__value">{stat.value}</strong>
                <div className="stat-card__trend">{stat.trend} dari bulan lalu</div>
              </article>
            );
          })}
        </section>

        {/* Main Content Grid */}
        <div className="admin-grid" id="requests">

          {/* Recent Requests — full width */}
          <div className="data-panel admin-grid-full">
            <div className="data-panel__header">
              <div>
                <div className="eyebrow">Operasional</div>
                <div className="data-panel__title">Request Terbaru</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost btn-sm">
                  <SlidersHorizontal size={14} />
                  Filter
                </button>
                <button className="btn btn-primary btn-sm">
                  <Plus size={14} />
                  Baru
                </button>
              </div>
            </div>
            <div className="data-table" role="table" aria-label="Tabel request customer">
              <div className="data-table-inner">
                <div className="data-table-head" role="row">
                  <span>ID Request</span>
                  <span>Customer</span>
                  <span>Ringkasan</span>
                  <span>Sumber</span>
                  <span>Status</span>
                  <span>Nilai</span>
                </div>
                {recentRequests.map((req) => {
                  const statusClass =
                    req.status === "Baru" ? "pill-baru" :
                    req.status === "Diproses" ? "pill-diproses" :
                    req.status === "Butuh review" ? "pill-review" :
                    "pill-selesai";
                  return (
                    <div className="data-table-row" role="row" key={req.id}>
                      <span style={{ color: "var(--c-gold)", fontWeight: 600, fontSize: "0.8rem" }}>{req.id}</span>
                      <span style={{ color: "var(--c-ink)", fontWeight: 500 }}>{req.customer}</span>
                      <span style={{ color: "var(--c-ink-muted)" }}>{req.summary}</span>
                      <span>{req.source}</span>
                      <span>
                        <em className={`pill ${statusClass}`}>{req.status}</em>
                      </span>
                      <span style={{ color: "var(--c-ink)", fontWeight: 600 }}>{req.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Aroma Chart */}
          <div className="data-panel" id="stats">
            <div className="data-panel__header">
              <div>
                <div className="eyebrow">Aroma Demand</div>
                <div className="data-panel__title">Top Family</div>
              </div>
              <BarChart3 size={20} style={{ color: "var(--c-gold)" }} />
            </div>
            <div className="bar-list">
              {topAromas.map((item) => (
                <div className="bar-item" key={item.label}>
                  <div className="bar-item__meta">
                    <span className="bar-item__label">{item.label}</span>
                    <span className="bar-item__val">{item.value}%</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock Alert */}
          <div className="data-panel" id="perfumes">
            <div className="data-panel__header">
              <div>
                <div className="eyebrow">Inventory</div>
                <div className="data-panel__title">Stok Kritis</div>
              </div>
              <Package size={20} style={{ color: "var(--c-gold)" }} />
            </div>
            <div className="stock-list">
              {perfumes
                .slice()
                .sort((a, b) => a.stock - b.stock)
                .slice(0, 4)
                .map((p) => (
                  <div className="stock-item" key={p.id}>
                    <div>
                      <div className="stock-item__name">{p.name}</div>
                      <div className="stock-item__meta">{p.family} · {p.variants.join(", ")}</div>
                    </div>
                    <span className="stock-item__count">{p.stock}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* AI Quality Review */}
          <div className="data-panel admin-grid-full" id="ai">
            <div className="data-panel__header">
              <div>
                <div className="eyebrow">AI Quality</div>
                <div className="data-panel__title">Review Jawaban Assistant</div>
              </div>
              <button className="btn btn-ghost btn-sm">
                <Sparkles size={14} />
                Atur Prompt
              </button>
            </div>
            <div className="ai-review-grid">
              <div className="ai-review-card">
                <div className="ai-review-card__icon"><Bot size={20} /></div>
                <div className="ai-review-card__title">Jawaban Aman</div>
                <div className="ai-review-card__desc">
                  AI tidak menjanjikan kemiripan absolut dan selalu menyebut batasan data toko.
                </div>
              </div>
              <div className="ai-review-card">
                <div className="ai-review-card__icon"><Users size={20} /></div>
                <div className="ai-review-card__title">Eskalasi ke Admin</div>
                <div className="ai-review-card__desc">
                  Request kompleks seperti upload gambar atau replika brand diteruskan ke admin.
                </div>
              </div>
              <div className="ai-review-card">
                <div className="ai-review-card__icon"><SlidersHorizontal size={20} /></div>
                <div className="ai-review-card__title">Aturan Blend</div>
                <div className="ai-review-card__desc">
                  Kombinasi aroma dapat diberi aturan cocok, kurang cocok, atau perlu alternatif.
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
