"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Tag, Percent, Truck } from "lucide-react";
import { formatRupiah } from "@/lib/types";
import { format } from "date-fns";
import VoucherForm from "./VoucherForm";
import { toggleVoucherActive, deleteVoucher } from "./actions";

export default function VoucherClient({ initialVouchers }: { initialVouchers: any[] }) {
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  function handleAdd() {
    setSelectedVoucher(null);
    setIsFormOpen(true);
  }

  function handleEdit(voucher: any) {
    setSelectedVoucher(voucher);
    setIsFormOpen(true);
  }

  async function handleToggle(id: number, currentStatus: boolean) {
    const res = await toggleVoucherActive(id, !currentStatus);
    if (res.success) {
      setVouchers(vouchers.map(v => v.id === id ? { ...v, is_active: !currentStatus } : v));
    } else {
      alert("Gagal mengubah status voucher");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Yakin ingin menghapus voucher ini?")) return;
    const res = await deleteVoucher(id);
    if (res.success) {
      setVouchers(vouchers.filter(v => v.id !== id));
    } else {
      alert("Gagal menghapus voucher: " + res.error);
    }
  }

  function renderValue(type: string, value: number) {
    if (type === "percentage") return `${value}%`;
    if (type === "fixed") return formatRupiah(value);
    if (type === "free_shipping") return "Gratis Ongkir";
    return value;
  }

  function renderTypeIcon(type: string) {
    if (type === "percentage") return <Percent size={14} />;
    if (type === "fixed") return <Tag size={14} />;
    if (type === "free_shipping") return <Truck size={14} />;
    return null;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--c-ink)" }}>Voucher & Diskon</h1>
          <p style={{ color: "var(--c-ink-muted)", fontSize: "0.9rem" }}>Kelola kode promo dan gratis ongkir untuk pelanggan.</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={16} />
          Tambah Voucher
        </button>
      </div>

      <div style={{ background: "var(--c-surface-1)", border: "1px solid var(--c-border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--c-surface-2)", borderBottom: "1px solid var(--c-border)", textAlign: "left" }}>
              <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--c-ink-muted)", fontWeight: 500 }}>KODE & NAMA</th>
              <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--c-ink-muted)", fontWeight: 500 }}>NILAI</th>
              <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--c-ink-muted)", fontWeight: 500 }}>KUOTA</th>
              <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--c-ink-muted)", fontWeight: 500 }}>MASA BERLAKU</th>
              <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--c-ink-muted)", fontWeight: 500 }}>STATUS</th>
              <th style={{ padding: "12px 16px", fontSize: "0.8rem", color: "var(--c-ink-muted)", fontWeight: 500, textAlign: "right" }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "32px 16px", textAlign: "center", color: "var(--c-ink-dim)" }}>
                  Belum ada voucher. Klik Tambah Voucher untuk memulai.
                </td>
              </tr>
            ) : (
              vouchers.map((v) => (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--c-border)", transition: "background 0.2s" }}>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--c-ink)", fontFamily: "monospace" }}>{v.code}</span>
                      <span style={{ fontSize: "0.8rem", color: "var(--c-ink-muted)" }}>{v.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "var(--c-gold)" }}>{renderTypeIcon(v.type)}</span>
                      <span style={{ fontSize: "0.9rem", color: "var(--c-ink)", fontWeight: 500 }}>{renderValue(v.type, v.value)}</span>
                    </div>
                    {v.min_purchase > 0 && (
                      <div style={{ fontSize: "0.75rem", color: "var(--c-ink-dim)", marginTop: 4 }}>Min. {formatRupiah(v.min_purchase)}</div>
                    )}
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.9rem", color: "var(--c-ink)" }}>
                      {v.used_count} / {v.quota === 0 ? "∞" : v.quota}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--c-ink)" }}>
                      {format(new Date(v.valid_from), "dd MMM yyyy, HH:mm")}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--c-ink-muted)" }}>
                      s/d {format(new Date(v.valid_until), "dd MMM yyyy, HH:mm")}
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={v.is_active}
                        onChange={() => handleToggle(v.id, v.is_active)}
                      />
                      <span className="slider"></span>
                    </label>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button className="btn-icon" onClick={() => handleEdit(v)} aria-label="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-icon" style={{ color: "#ef4444" }} onClick={() => handleDelete(v.id)} aria-label="Hapus">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <VoucherForm
          voucher={selectedVoucher}
          onClose={() => setIsFormOpen(false)}
          onSuccess={() => {
            setIsFormOpen(false);
            window.location.reload(); // Simple refresh to get new data
          }}
        />
      )}
    </div>
  );
}
