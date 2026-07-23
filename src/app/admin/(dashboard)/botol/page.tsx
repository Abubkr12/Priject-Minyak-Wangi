"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, Search, Plus, Edit, Trash2, Loader2, Cylinder, X } from 'lucide-react';
import { saveBotol, deleteBotol } from './actions';

export default function KatalogBotol() {
  const supabase = createClient(true);
  const [bottles, setBottles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    capacity_ml: 0,
    price: 0,
    stock: 0
  });

  useEffect(() => {
    fetchBottles();
  }, []);

  async function fetchBottles() {
    setLoading(true);
    const { data, error } = await supabase
      .from('bottles')
      .select('*')
      .order('capacity_ml', { ascending: true });
      
    if (error) {
      console.error(error);
    } else {
      setBottles(data || []);
    }
    setLoading(false);
  }

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ id: '', name: '', capacity_ml: 0, price: 0, stock: 0 });
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setModalMode('edit');
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus botol ini?')) {
      const res = await deleteBotol(id);
      if (!res.success) {
        alert('Gagal menghapus botol: ' + res.error);
      }
      fetchBottles();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      capacity_ml: Number(formData.capacity_ml),
      price: Number(formData.price),
      stock: Number(formData.stock)
    };

    let res;
    if (modalMode === 'add') {
      res = await saveBotol(payload);
    } else {
      res = await saveBotol(payload, formData.id);
    }
    
    if (!res.success) {
      alert('Gagal menyimpan botol: ' + res.error);
      return;
    }

    setIsModalOpen(false);
    fetchBottles();
  };

  const filteredBottles = bottles.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--c-ink)", fontWeight: 400, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <Cylinder color="var(--c-gold)" size={28}/> Katalog Botol Kosong
          </h1>
          <p style={{ color: "var(--c-ink-dim)" }}>Kelola data stok dan harga botol parfum.</p>
        </div>
        <button 
          onClick={openAddModal}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "var(--c-gold)", color: "#000", fontWeight: 600, borderRadius: "var(--r-md)", transition: "all 0.2s", border: 'none', cursor: 'pointer' }}
        >
          <Plus size={18} /> Tambah Botol
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--c-border)', paddingBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 300, flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-ink-dim)' }} />
          <input 
            placeholder="Cari kapasitas botol..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '10px 16px 10px 36px', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', background: 'var(--c-surface-1)', color: 'var(--c-ink)' }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto', background: 'var(--c-surface-1)', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'var(--c-surface-2)', borderBottom: '1px solid var(--c-border)' }}>
            <tr>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--c-ink-dim)', fontSize: '0.85rem' }}>Nama Botol</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--c-ink-dim)', fontSize: '0.85rem' }}>Kapasitas (ml)</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--c-ink-dim)', fontSize: '0.85rem' }}>Harga Modal</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--c-ink-dim)', fontSize: '0.85rem' }}>Stok</th>
              <th style={{ padding: '16px 24px', fontWeight: 600, color: 'var(--c-ink-dim)', fontSize: '0.85rem', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '64px', textAlign: 'center', color: 'var(--c-gold)' }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} />
                  </div>
                </td>
              </tr>
            ) : filteredBottles.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--c-ink-dim)' }}>
                  Belum ada data botol.
                </td>
              </tr>
            ) : (
              filteredBottles.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: 500, color: 'var(--c-ink)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Package size={16} color="var(--c-gold)" />
                    {item.name}
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--c-ink-dim)' }}>{item.capacity_ml} ml</td>
                  <td style={{ padding: '16px 24px', color: 'var(--c-ink-dim)' }}>Rp {item.price.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: 999, 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      background: item.stock > 10 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                      color: item.stock > 10 ? '#34d399' : '#f87171'
                    }}>
                      {item.stock} pcs
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => openEditModal(item)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-ink-dim)' }}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ padding: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'red' }}>
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

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: 'var(--c-bg)', width: '100%', maxWidth: 500, borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--c-border)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{modalMode === 'add' ? 'Tambah Botol' : 'Edit Botol'}</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-ink-dim)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Nama Botol</label>
                <input 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)', background: 'var(--c-surface-1)', color: 'var(--c-ink)' }}
                  placeholder="Contoh: TOLA 3ML"
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Kapasitas (ml)</label>
                  <input 
                    required
                    type="number"
                    value={formData.capacity_ml}
                    onChange={(e) => setFormData({...formData, capacity_ml: Number(e.target.value)})}
                    style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)', background: 'var(--c-surface-1)', color: 'var(--c-ink)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Stok (pcs)</label>
                  <input 
                    required
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)', background: 'var(--c-surface-1)', color: 'var(--c-ink)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: '0.9rem' }}>Harga Modal (Rp)</label>
                <input 
                  required
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)', background: 'var(--c-surface-1)', color: 'var(--c-ink)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)', background: 'transparent', color: 'var(--c-ink)', cursor: 'pointer', fontWeight: 500 }}>
                  Batal
                </button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: 'var(--r-sm)', border: 'none', background: 'var(--c-gold)', color: '#000', cursor: 'pointer', fontWeight: 600 }}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
