"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Search, X, Check } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "./actions";
import { toast } from "sonner";

export default function CategoryClient({ initialCategories }: { initialCategories: any[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (category: any | null = null) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await createCategory(formData);
        toast.success("Kategori berhasil ditambahkan");
      }
      closeModal();
      // Since revalidatePath is called in the action, 
      // the server component will fetch fresh data on next render/refresh
      window.location.reload(); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    
    try {
      await deleteCategory(id);
      toast.success("Kategori berhasil dihapus");
      setCategories(categories.filter(c => c.id !== id));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div style={{ position: "relative", width: 300 }}>
          <Search size={18} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--c-ink-dim)" }} />
          <input 
            type="text" 
            placeholder="Cari kategori..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px 16px 10px 40px", borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", background: "var(--c-surface-1)", color: "var(--c-ink)" }}
          />
        </div>
        
        <button 
          onClick={() => openModal()}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--c-gold)", color: "#000", border: "none", borderRadius: "var(--r-md)", fontWeight: 600, cursor: "pointer" }}
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "var(--c-surface-2)", borderBottom: "1px solid var(--c-border)" }}>
            <tr>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>ID</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Label Kategori</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Warna Tema</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Urutan</th>
              <th style={{ padding: "16px 24px", color: "var(--c-ink-dim)", fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "var(--c-ink-dim)" }}>
                  Tidak ada kategori ditemukan.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                  <td style={{ padding: "16px 24px", color: "var(--c-ink)" }}>{cat.name}</td>
                  <td style={{ padding: "16px 24px", color: "var(--c-ink)", fontWeight: 500 }}>{cat.label}</td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 16, height: 16, borderRadius: "50%", background: cat.color || "transparent", border: "1px solid var(--c-border)" }} />
                      <span style={{ fontSize: "0.85rem", color: "var(--c-ink)" }}>{cat.color || "-"}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--c-ink)" }}>{cat.sort_order}</td>
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                      <button onClick={() => openModal(cat)} style={{ background: "transparent", border: "none", color: "var(--c-gold)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}>
                        <Edit2 size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(cat.id)} style={{ background: "transparent", border: "none", color: "var(--c-error)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.85rem" }}>
                        <Trash2 size={16} /> Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 500, background: "var(--c-surface-1)", borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--c-border)", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--c-border)", background: "var(--c-surface-1)" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "var(--c-ink)" }}>
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", color: "var(--c-ink)", cursor: "pointer" }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>ID Kategori (Contoh: woody)</label>
                <input type="text" name="name" defaultValue={editingCategory?.name} required style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Label Kategori (Contoh: Woody / Kayu)</label>
                <input type="text" name="label" defaultValue={editingCategory?.label} required style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Deskripsi (Opsional)</label>
                <textarea name="description" defaultValue={editingCategory?.description} rows={3} style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)", resize: "vertical" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Warna Tema (Hex Code)</label>
                  <input type="text" name="color" defaultValue={editingCategory?.color} placeholder="#8B4513" style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Urutan Tampil (Angka)</label>
                  <input type="number" name="sort_order" defaultValue={editingCategory?.sort_order || 0} style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={closeModal} style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid var(--c-border)", background: "transparent", color: "var(--c-ink)", cursor: "pointer", fontWeight: 500 }}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "var(--c-gold)", color: "#000", cursor: isSubmitting ? "not-allowed" : "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 8, opacity: isSubmitting ? 0.7 : 1 }}>
                  <Check size={18} /> {isSubmitting ? "Menyimpan..." : "Simpan Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
