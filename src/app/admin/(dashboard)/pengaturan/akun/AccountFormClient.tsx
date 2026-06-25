"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { updateProfile } from "./actions";
import { toast } from "sonner";
import { id } from "date-fns/locale";

export default function AccountFormClient({ profile }: { profile: any }) {
  const [birthDate, setBirthDate] = useState<Date | null>(
    profile.birth_date ? new Date(profile.birth_date) : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    // Add formatted date to formData
    if (birthDate) {
      // Create local date string without timezone shifting
      const tzOffset = birthDate.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(birthDate.getTime() - tzOffset)).toISOString().slice(0, 10);
      formData.set("birth_date", localISOTime);
    } else {
      formData.delete("birth_date");
    }

    try {
      await updateProfile(formData);
      toast.success("Profil berhasil diperbarui");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Readonly fields */}
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 16, marginBottom: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", fontWeight: 500, marginBottom: 8 }}>Alamat Email / Username</label>
          <input type="text" readOnly value={profile.email} style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink-dim)", opacity: 0.7 }} />
        </div>
        <div style={{ width: 150 }}>
          <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink-dim)", fontWeight: 500, marginBottom: 8 }}>Role Akses</label>
          <input type="text" readOnly value={profile.role.toUpperCase()} style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-gold)", fontWeight: 600, opacity: 0.8 }} />
        </div>
      </div>

      {/* Editable fields */}
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Nama Lengkap</label>
        <input type="text" name="full_name" defaultValue={profile.full_name} required style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Tempat Lahir</label>
        <input type="text" name="birth_place" defaultValue={profile.birth_place} style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} />
      </div>

      <div className="custom-datepicker-wrapper">
        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Tanggal Lahir</label>
        <DatePicker
          selected={birthDate}
          onChange={(date: Date | null) => setBirthDate(date)}
          dateFormat="dd MMMM yyyy"
          locale={id}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          placeholderText="Pilih tanggal lahir..."
          customInput={
            <input 
              style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} 
            />
          }
        />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Jenis Kelamin</label>
        <select name="gender" defaultValue={profile.gender} style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }}>
          <option value="">-- Pilih --</option>
          <option value="Laki-laki">Laki-laki</option>
          <option value="Perempuan">Perempuan</option>
        </select>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.85rem", color: "var(--c-ink)", fontWeight: 500, marginBottom: 8 }}>Agama</label>
        <input type="text" name="religion" defaultValue={profile.religion} style={{ width: "100%", padding: "10px 16px", background: "var(--bg-color)", border: "1px solid var(--c-border)", borderRadius: "var(--r-md)", color: "var(--c-ink)" }} />
      </div>

      <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: 200, padding: "12px", background: "var(--c-gold)", color: "#000", border: "none", borderRadius: "var(--r-md)", fontSize: "0.95rem", fontWeight: 600, cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1 }}
        >
          <Save size={18} /> {isSubmitting ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </div>

      <style jsx global>{`
        .custom-datepicker-wrapper .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker {
          font-family: var(--font-sans);
          border-color: var(--c-border);
          background-color: var(--c-surface-1);
          color: var(--c-ink);
        }
        .react-datepicker__header {
          background-color: var(--c-surface-2);
          border-bottom-color: var(--c-border);
        }
        .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
          color: var(--c-ink);
        }
        .react-datepicker__day {
          color: var(--c-ink);
        }
        .react-datepicker__day:hover {
          background-color: var(--c-surface-2);
        }
        .react-datepicker__day--selected {
          background-color: var(--c-gold) !important;
          color: #000 !important;
          font-weight: bold;
        }
        .react-datepicker__day-name {
          color: var(--c-ink-dim);
        }
        .react-datepicker__month-select, .react-datepicker__year-select {
          background: var(--bg-color);
          color: var(--c-ink);
          border: 1px solid var(--c-border);
          border-radius: 4px;
          padding: 2px 4px;
        }
      `}</style>
    </form>
  );
}
