"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { addEmployee, deleteEmployee } from "./actions";

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setEmployees(data);
    }
    setLoading(false);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    const res = await addEmployee(formData);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Pegawai berhasil ditambahkan");
      setShowAddModal(false);
      fetchEmployees();
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus akses ${name}?`)) {
      const res = await deleteEmployee(id);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("Pegawai berhasil dihapus");
        fetchEmployees();
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "owner": return <span style={{ background: "var(--c-gold)", color: "#000", padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600 }}>Owner</span>;
      case "developer": return <span style={{ background: "#13d7ed", color: "#000", padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600 }}>Developer</span>;
      case "admin": return <span style={{ background: "var(--c-surface-2)", color: "var(--c-ink)", padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600 }}>Admin</span>;
      case "HRD": return <span style={{ background: "var(--c-rose)", color: "#fff", padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600 }}>HRD</span>;
      default: return <span style={{ background: "var(--c-surface-1)", color: "var(--c-ink-dim)", padding: "4px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600, border: "1px solid var(--c-border)" }}>Employee</span>;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--c-ink)", marginBottom: 4 }}>Daftar Karyawan</h1>
          <p style={{ color: "var(--c-ink-dim)", fontSize: "0.9rem" }}>Kelola hak akses dan akun internal perusahaan.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", background: "var(--c-gold)", color: "#000", border: "none", borderRadius: "var(--r-md)", fontWeight: 600, cursor: "pointer" }}
        >
          <Plus size={18} /> Tambah Pegawai
        </button>
      </div>

      <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "var(--glass-bg)", borderBottom: "1px solid var(--c-border)" }}>
              <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Nama Lengkap</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Email / Username</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Role Akses</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)" }}>Status Profil</th>
              <th style={{ padding: "16px", fontSize: "0.85rem", fontWeight: 600, color: "var(--c-ink-dim)", textAlign: "right" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--c-ink-dim)" }}>Memuat data...</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 32, textAlign: "center", color: "var(--c-ink-dim)" }}>Belum ada data pegawai.</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} style={{ borderBottom: "1px solid var(--c-border)" }}>
                  <td style={{ padding: "16px", fontWeight: 500, color: "var(--c-ink)" }}>{emp.full_name}</td>
                  <td style={{ padding: "16px", color: "var(--c-ink-dim)" }}>{emp.email}</td>
                  <td style={{ padding: "16px" }}>{getRoleBadge(emp.role)}</td>
                  <td style={{ padding: "16px", fontSize: "0.85rem", color: "var(--c-ink-dim)" }}>
                    {emp.birth_place || emp.gender ? (
                      <span style={{ color: "var(--c-green)" }}>Lengkap</span>
                    ) : (
                      <span style={{ color: "var(--c-rose)" }}>Belum Lengkap</span>
                    )}
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <button 
                      onClick={() => handleDelete(emp.id, emp.full_name)}
                      style={{ padding: 8, background: "transparent", border: "none", color: "var(--c-rose)", cursor: "pointer", borderRadius: 4 }}
                      title="Hapus Akses"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "var(--c-surface-1)", width: "100%", maxWidth: 500, borderRadius: "var(--r-md)", border: "1px solid var(--c-border)", overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--c-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--c-ink)" }}>Tambah Pegawai Baru</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "transparent", border: "none", color: "var(--c-ink-dim)", cursor: "pointer", fontSize: "1.5rem", lineHeight: 1 }}>&times;</button>
            </div>
            
            <form onSubmit={handleAddSubmit} style={{ padding: 24 }}>
              
              <div style={{ marginBottom: 16, padding: "12px", background: "rgba(224, 185, 118, 0.1)", border: "1px solid var(--c-gold)", borderRadius: "var(--r-sm)", display: "flex", gap: 12 }}>
                <ShieldAlert size={24} color="var(--c-gold)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: "0.85rem", color: "var(--c-ink)", margin: 0 }}>Pegawai akan otomatis terverifikasi. Pastikan password yang diberikan aman.</p>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)" }}>Nama Lengkap</label>
                <input required name="full_name" type="text" style={{ width: "100%", padding: "10px 12px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-sm)", color: "var(--c-ink)", outline: "none" }} placeholder="Cth: Budi Santoso" />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)" }}>Alamat Email (Username)</label>
                <input required name="email" type="email" style={{ width: "100%", padding: "10px 12px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-sm)", color: "var(--c-ink)", outline: "none" }} placeholder="budi@minyakwangi.com" />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)" }}>Password Sementara</label>
                <input required name="password" type="password" style={{ width: "100%", padding: "10px 12px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-sm)", color: "var(--c-ink)", outline: "none" }} placeholder="Minimal 6 karakter" />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 8, fontSize: "0.85rem", fontWeight: 500, color: "var(--c-ink)" }}>Role Akses</label>
                <select required name="role" style={{ width: "100%", padding: "10px 12px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-sm)", color: "var(--c-ink)", outline: "none" }}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                  <option value="HRD">HRD</option>
                  <option value="owner">Owner</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "10px 16px", background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-ink)", borderRadius: "var(--r-sm)", cursor: "pointer", fontWeight: 500 }}>Batal</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: "10px 16px", background: "var(--c-gold)", border: "none", color: "#000", borderRadius: "var(--r-sm)", cursor: "pointer", fontWeight: 600, opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? "Menyimpan..." : "Tambah Pegawai"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
