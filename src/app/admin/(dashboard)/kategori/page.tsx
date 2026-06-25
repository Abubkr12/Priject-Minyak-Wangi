import { createClient } from "@/lib/supabase/server";
import CategoryClient from "./CategoryClient";
import { Tags } from "lucide-react";

export const metadata = {
  title: "Manajemen Kategori | Admin Minyak Wangi",
};

export default async function KategoriPage() {
  const supabase = await createClient(true);
  
  // Fetch scent_families ordered by sort_order
  const { data: categories } = await supabase
    .from("scent_families")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--c-ink)", fontWeight: 400, marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <Tags size={28} style={{ color: "var(--c-gold)" }} />
          Manajemen Kategori
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>
          Kelola kategori keluarga aroma (Scent Families) yang digunakan untuk mengelompokkan parfum.
        </p>
      </div>

      <CategoryClient initialCategories={categories || []} />
    </div>
  );
}
