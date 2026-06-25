import { createClient } from "@/lib/supabase/server";
import ProductForm from "./ProductForm";

export default async function AdminProductFormPage({ searchParams }: { searchParams: Promise<{ id?: string }> | { id?: string } }) {
  const supabase = await createClient(true);
  const params = await searchParams;
  const isEditing = !!params?.id;

  // Fetch scent families for dropdown
  const { data: families } = await supabase.from("scent_families").select("*").order("sort_order");

  let initialData = null;

  if (isEditing) {
    const { data: perfume } = await supabase
      .from("perfumes")
      .select("*, sizes:perfume_sizes(*)")
      .eq("id", params?.id)
      .single();
    
    if (perfume) {
      initialData = perfume;
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--c-ink)", fontWeight: 400, marginBottom: 8 }}>
          {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>Isi detail parfum, unggah foto, dan atur varian ukuran beserta harganya.</p>
      </div>

      <ProductForm initialData={initialData} families={families || []} />
    </div>
  );
}
