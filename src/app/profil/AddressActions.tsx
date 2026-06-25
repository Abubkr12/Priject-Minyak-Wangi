'use client';

import { deleteAddress, setDefaultAddress } from './alamat/actions';
import { Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AddressActions({ addressId, isDefault }: { addressId: number, isDefault: boolean }) {
  
  const handleSetDefault = async () => {
    try {
      await setDefaultAddress(addressId);
      toast.success('Alamat utama berhasil diubah');
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus alamat ini?')) return;
    try {
      await deleteAddress(addressId);
      toast.success('Alamat berhasil dihapus');
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {!isDefault && (
        <button onClick={handleSetDefault} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--c-gold)', background: 'transparent', border: '1px solid var(--c-gold)', padding: '6px 12px', borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'all 0.2s' }}>
          <CheckCircle size={14} /> Jadikan Utama
        </button>
      )}
      <button onClick={handleDelete} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#e11d48', background: 'transparent', border: '1px solid #e11d48', padding: '6px 12px', borderRadius: 'var(--r-sm)', cursor: 'pointer', transition: 'all 0.2s' }}>
        <Trash2 size={14} /> Hapus
      </button>
    </div>
  );
}
