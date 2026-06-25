import { createClient } from "@/lib/supabase/server";
import { Users, Search, Mail, Calendar } from "lucide-react";

export default async function PelangganPage() {
  const supabase = await createClient(true);
  
  // Ambil data pelanggan dari auth.users dan profiles jika ada
  // Namun, kita tidak bisa langsung query auth.users dari client/server tanpa service role
  // Sebagai gantinya, kita bisa query tabel profiles yang biasanya terkait
  const { data: profiles } = await supabase.from('customer_profiles').select('*').order('created_at', { ascending: false });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--c-ink)", marginBottom: 8 }}>
            Pelanggan
          </h1>
          <p style={{ color: "var(--c-ink-dim)" }}>Kelola data pelanggan dan lihat riwayat aktivitas mereka.</p>
        </div>
      </div>

      <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "var(--c-surface-2)", borderBottom: "1px solid var(--c-border)" }}>
            <tr>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Pelanggan</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>No. Telepon</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Tanggal Lahir</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Bergabung Pada</th>
            </tr>
          </thead>
          <tbody>
            {!profiles || profiles.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "var(--c-ink-dim)" }}>
                  Belum ada data pelanggan.
                </td>
              </tr>
            ) : (
              profiles.map((profile: any) => (
                <tr key={profile.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                  <td style={{ padding: "16px 24px", color: "var(--c-ink)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--glass-bg)", border: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <Users size={16} style={{ color: "var(--c-ink-dim)" }} />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{profile.full_name || "Tanpa Nama"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--c-ink)" }}>{profile.phone || "-"}</td>
                  <td style={{ padding: "16px 24px", color: "var(--c-ink)" }}>
                    {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontSize: "0.9rem" }}>
                    {new Date(profile.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
