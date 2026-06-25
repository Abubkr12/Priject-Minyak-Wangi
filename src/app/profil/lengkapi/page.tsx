'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { completeProfile } from './action';
import { toast } from 'sonner';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function LengkapiProfilWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 states
  const [query, setQuery] = useState('');
  const [areas, setAreas] = useState<any[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [selectedArea, setSelectedArea] = useState<any>(null);

  // Step 2 states
  const [position, setPosition] = useState<[number, number]>([-6.1753924, 106.8271528]);
  const [detailAddress, setDetailAddress] = useState('');

  // Debounced search
  useEffect(() => {
    if (!query) {
      setAreas([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoadingAreas(true);
      fetch(`/api/biteship/areas?query=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setAreas(data);
        })
        .finally(() => setLoadingAreas(false));
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  const handleNext = () => {
    if (step === 1 && selectedArea) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!selectedArea || !detailAddress) return;
    setLoading(true);
    try {
      const finalAddress = `${detailAddress}, ${selectedArea.name}`;
      await completeProfile({
        region_code: selectedArea.id,
        maps_latitude: position[0],
        maps_longitude: position[1],
        address: finalAddress,
        village_name: selectedArea.name
      });
      router.push('/checkout');
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', paddingTop: '100px' }}>
      <div style={{ background: 'var(--glass-bg)', width: '100%', maxWidth: '600px', borderRadius: 'var(--r-lg)', border: '1px solid var(--glass-border)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        
        {/* Header */}
        <div style={{ background: 'var(--c-gold-dim)', padding: '24px 32px', borderTopLeftRadius: 'calc(var(--r-lg) - 1px)', borderTopRightRadius: 'calc(var(--r-lg) - 1px)', borderBottom: '1px solid var(--c-gold-glow)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--c-gold-light)', margin: 0 }}>Lengkapi Profil Pengiriman</h2>
          <p style={{ color: 'var(--c-ink-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Pastikan alamat Anda akurat agar pesanan sampai tepat waktu.</p>
        </div>

        <div style={{ padding: '32px' }}>
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', background: step >= 1 ? 'var(--c-gold)' : 'var(--c-surface-1)', color: step >= 1 ? '#fff' : 'var(--c-ink-dim)', border: step >= 1 ? 'none' : '1px solid var(--c-border)' }}>1</div>
            <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--c-gold)' : 'var(--c-surface-1)', margin: '0 8px', borderRadius: '2px' }}></div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', background: step >= 2 ? 'var(--c-gold)' : 'var(--c-surface-1)', color: step >= 2 ? '#fff' : 'var(--c-ink-dim)', border: step >= 2 ? 'none' : '1px solid var(--c-border)' }}>2</div>
          </div>

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--c-ink)', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px', marginBottom: '8px' }}>Cari Kecamatan</h3>
              
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--c-ink-dim)', marginBottom: '8px' }}>Kecamatan / Kode Pos</label>
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ width: '100%', padding: '12px 16px', background: 'var(--c-surface-1)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', color: 'var(--c-ink)' }} 
                  placeholder="Ketik nama kecamatan atau kode pos (contoh: 11540)..." 
                  value={selectedArea ? selectedArea.name : query} 
                  onChange={e => {
                    setQuery(e.target.value);
                    if (selectedArea) setSelectedArea(null);
                  }}
                />
                {!selectedArea && query && areas.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--c-surface-1)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', marginTop: '4px', zIndex: 10, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {areas.map((area, index) => (
                      <div 
                        key={`${area.id}-${index}`} 
                        style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', cursor: 'pointer', color: 'var(--c-ink)' }}
                        onClick={() => {
                          setSelectedArea(area);
                          setQuery('');
                          setAreas([]);
                        }}
                      >
                        {area.name}
                      </div>
                    ))}
                  </div>
                )}
                {loadingAreas && <div style={{ fontSize: '0.8rem', color: 'var(--c-ink-dim)', marginTop: '4px' }}>Mencari...</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button onClick={handleNext} disabled={!selectedArea} className="btn btn-primary" style={{ opacity: selectedArea ? 1 : 0.5 }}>
                  Selanjutnya
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--c-ink)', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px', marginBottom: '8px' }}>Detail Alamat & Lokasi</h3>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--c-ink-dim)', marginBottom: '8px' }}>Alamat Lengkap</label>
                <textarea rows={3} className="input-field" style={{ width: '100%', padding: '12px 16px', background: 'var(--c-surface-1)', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', color: 'var(--c-ink)', resize: 'vertical' }} placeholder="Nama jalan, nomor rumah, RT/RW, patokan..." value={detailAddress} onChange={e => setDetailAddress(e.target.value)}></textarea>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--c-ink-dim)', marginBottom: '4px' }}>Pin Titik Lokasi</label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--c-ink-dim)', fontStyle: 'italic', margin: 0 }}>Klik peta untuk menyesuaikan titik</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      if ("geolocation" in navigator) {
                        toast.loading('Mendeteksi lokasi Anda...', { id: 'gps-toast' });
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setPosition([pos.coords.latitude, pos.coords.longitude]);
                            toast.success('Lokasi berhasil didapatkan!', { id: 'gps-toast' });
                          },
                          (err) => {
                            toast.error('Gagal mendeteksi lokasi. Pastikan GPS aktif dan izin diberikan.', { id: 'gps-toast' });
                          },
                          { enableHighAccuracy: true, timeout: 10000 }
                        );
                      } else {
                        toast.error('Browser Anda tidak mendukung deteksi lokasi.');
                      }
                    }}
                    style={{ background: 'var(--c-gold)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    📍 Gunakan Lokasi Saat Ini
                  </button>
                </div>
                
                <div style={{ border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', overflow: 'hidden', height: '300px' }}>
                   <MapComponent position={position} setPosition={setPosition} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary">
                  Kembali
                </button>
                <button onClick={handleSubmit} disabled={!detailAddress || loading} className="btn btn-primary" style={{ opacity: (!detailAddress || loading) ? 0.5 : 1 }}>
                  {loading ? 'Menyimpan...' : 'Simpan & Lanjut Checkout'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
