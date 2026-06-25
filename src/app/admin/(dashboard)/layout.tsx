"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Package, LayoutDashboard, Users, Settings, LogOut, MessageCircle } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { 
      name: "Pesanan", 
      href: "/admin/pesanan", 
      icon: Package,
      subItems: [
        { name: "Pesanan Reguler", href: "/admin/pesanan" },
        { name: "Pesanan Kustom", href: "/admin/pesanan-kustom" },
      ]
    },
    { name: "Chat", href: "/admin/chat", icon: MessageCircle },
    { 
      name: "Katalog", 
      href: "/admin/produk", 
      icon: Package,
      subItems: [
        { name: "Produk", href: "/admin/produk" },
        { name: "Kategori", href: "/admin/kategori" },
        { name: "Voucher", href: "/admin/voucher" },
      ]
    },
    { name: "Pelanggan", href: "/admin/pelanggan", icon: Users },
    { name: "Karyawan", href: "/admin/karyawan", icon: Users },
    { 
      name: "Pengaturan", 
      href: "/admin/pengaturan", 
      icon: Settings,
      subItems: [
        { name: "Personalisasi AI", href: "/admin/pengaturan/ai" },
        { name: "Integrasi API", href: "/admin/pengaturan/api" },
        { name: "Metode Pembayaran", href: "/admin/pengaturan/pembayaran" },
        { name: "Akun Saya", href: "/admin/pengaturan/akun" },
      ]
    },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg-color)" }}>
      {/* Sidebar */}
      <aside style={{ width: 260, flexShrink: 0, background: "var(--c-surface-1)", borderRight: "1px solid var(--c-border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 24px", borderBottom: "1px solid var(--c-border)" }}>
          <Link href="/admin" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ background: "var(--c-gold)", color: "#000", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--r-sm)", fontWeight: "bold", fontFamily: "var(--font-display)" }}>
              N
            </span>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "var(--c-ink)" }}>Ruang Komando</div>
              <div style={{ fontSize: "0.75rem", color: "var(--c-ink-dim)" }}>Admin Dasbor</div>
            </div>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: "24px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {navItems.map((item) => {
            const isActive = item.href === "/admin" 
              ? pathname === "/admin" 
              : item.subItems
                ? item.subItems.some(sub => pathname.startsWith(sub.href)) || pathname.startsWith(item.href)
                : pathname.startsWith(item.href);
              
            const Icon = item.icon;
            
            return (
              <div key={item.name} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Link
                  href={item.subItems ? item.subItems[0].href : item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 16px",
                    borderRadius: "var(--r-md)",
                    background: isActive && !item.subItems ? "var(--glass-bg)" : "transparent",
                    color: isActive ? "var(--c-gold)" : "var(--c-ink-dim)",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: "0.9rem",
                    transition: "all 0.2s"
                  }}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
                
                {item.subItems && isActive && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 40, marginTop: 4 }}>
                    {item.subItems.map(sub => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          style={{
                            padding: "8px 12px",
                            borderRadius: "var(--r-sm)",
                            background: isSubActive ? "var(--glass-bg)" : "transparent",
                            color: isSubActive ? "var(--c-gold)" : "var(--c-ink-dim)",
                            fontSize: "0.85rem",
                            fontWeight: isSubActive ? 600 : 400,
                            transition: "all 0.2s"
                          }}
                        >
                          {sub.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div style={{ padding: 24, borderTop: "1px solid var(--c-border)" }}>
          <button 
            onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--c-rose)", background: "transparent", border: "none", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500, width: "100%", padding: "10px 16px" }}
          >
            <LogOut size={18} />
            Keluar Dasbor
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 72, background: "var(--c-surface-1)", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px" }}>
          <div style={{ fontWeight: 500, color: "var(--c-ink)" }}>
            {navItems.find(n => pathname === n.href || pathname.startsWith(n.href + "/"))?.name || "Dashboard"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ThemeToggle />
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink)" }}>
              A
            </div>
          </div>
        </header>
        
        <div style={{ padding: 32, flex: 1, overflowY: "auto", background: "var(--bg-color)" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
