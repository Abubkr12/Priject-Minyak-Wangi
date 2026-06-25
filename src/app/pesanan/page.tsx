import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, LogOut, Package, Tag, Clock, ArrowRight } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { formatRupiah } from '@/lib/types'
import { TrackingWidget } from './TrackingWidget'

export const metadata = {
  title: 'Riwayat Pesanan — Ela Parfum',
  description: 'Riwayat pesanan Anda',
}

const statusColors: Record<string, { bg: string, text: string, label: string }> = {
  pending: { bg: 'var(--c-gold-dim)', text: 'var(--c-gold-light)', label: 'Menunggu Pembayaran' },
  confirmed: { bg: 'rgba(59, 130, 246, 0.1)', text: 'rgb(59, 130, 246)', label: 'Dikonfirmasi' },
  processing: { bg: 'rgba(168, 85, 247, 0.1)', text: 'rgb(168, 85, 247)', label: 'Diproses' },
  shipped: { bg: 'rgba(14, 165, 233, 0.1)', text: 'rgb(14, 165, 233)', label: 'Dikirim' },
  completed: { bg: 'rgba(34, 197, 94, 0.1)', text: 'rgb(34, 197, 94)', label: 'Selesai' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--c-rose)', label: 'Dibatalkan' }
}

export default async function PesananPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="customer-page">
      <header className="topbar" role="banner">
        <Link href="/" className="topbar__brand">
          <span className="brand-mark">N</span>
          <div>
            <div className="brand-name">Ela Parfum</div>
            <div className="brand-sub">Parfum Isi Ulang</div>
          </div>
        </Link>
        <div className="topbar__spacer" />
        <ThemeToggle />
      </header>

      <main className="workspace" style={{ paddingTop: '100px' }}>
        <div className="workspace-grid" style={{ gridTemplateColumns: '280px 1fr' }}>
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="catalog-col" style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: 'var(--r-lg)', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--c-gold)', marginBottom: '24px' }}>Akun Saya</h3>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link href="/profil" className="topbar__nav-link">
                <User size={18} /> Profil Saya
              </Link>
              <Link href="/pesanan" className="topbar__nav-link" style={{ background: 'rgba(201,168,76,0.1)', color: 'var(--c-gold)' }}>
                <Package size={18} /> Riwayat Pesanan
              </Link>
              <Link href="/voucher" className="topbar__nav-link">
                <Tag size={18} /> Voucher & Promo
              </Link>
              <div style={{ margin: '16px 0', height: '1px', background: 'var(--c-border)' }} />
              
              <form action="/auth/signout" method="post">
                <button type="submit" className="topbar__nav-link" style={{ width: '100%', color: 'var(--c-rose)', justifyContent: 'flex-start' }}>
                  <LogOut size={18} /> Keluar Akun
                </button>
              </form>
            </nav>
          </aside>

          {/* MAIN CONTENT */}
          <div className="catalog-col">
            <div style={{ background: 'var(--glass-bg)', padding: '32px', borderRadius: 'var(--r-lg)', border: '1px solid var(--glass-border)', minHeight: '400px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--c-ink)', marginBottom: '8px' }}>Riwayat Pesanan</h1>
              <p className="text-muted" style={{ marginBottom: '32px' }}>Pantau status dan detail riwayat pembelian Anda.</p>
              
              {(!orders || orders.length === 0) ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', textAlign: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--c-surface-1)', display: 'grid', placeItems: 'center', marginBottom: '16px', color: 'var(--c-ink-dim)' }}>
                    <Package size={28} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--c-ink)', marginBottom: '8px' }}>Belum ada pesanan</h3>
                  <p style={{ color: 'var(--c-ink-muted)', marginBottom: '24px', maxWidth: '300px' }}>Anda belum melakukan pemesanan parfum apapun sejauh ini.</p>
                  <Link href="/#catalog" className="btn btn-primary" style={{ padding: '0 24px', height: '44px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {orders.map((order: any) => {
                    const statusConfig = statusColors[order.status] || { bg: 'var(--c-surface-1)', text: 'var(--c-ink)', label: order.status };
                    
                    return (
                      <div key={order.id} style={{ background: 'var(--c-surface-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', overflow: 'hidden' }}>
                        
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                          <div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-muted)', marginBottom: '4px' }}>
                              {new Date(order.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--c-ink)', fontWeight: 600 }}>
                              {order.order_code}
                            </div>
                          </div>
                          
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <div style={{ padding: '6px 12px', borderRadius: 'var(--r-sm)', fontSize: '0.85rem', fontWeight: 500, background: statusConfig.bg, color: statusConfig.text }}>
                                {statusConfig.label}
                              </div>
                              
                              {order.status === 'pending' && (!order.payment_notes || !order.payment_notes.startsWith('http')) && (
                                <Link href={`/checkout/success?id=${order.id}`} className="btn btn-primary" style={{ padding: '0 16px', height: '36px', fontSize: '0.9rem' }}>
                                  Bayar Sekarang
                                </Link>
                              )}
                              {order.status === 'pending' && order.payment_notes && order.payment_notes.startsWith('http') && (
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <div style={{ padding: '0 16px', height: '36px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', background: 'var(--c-surface-2)', color: 'var(--c-ink-dim)', borderRadius: 'var(--r-sm)', fontWeight: 500, border: '1px solid var(--c-border)' }}>
                                    Menunggu Verifikasi
                                  </div>
                                  <button onClick={() => {
                                      document.getElementById('chatbot-toggle')?.click();
                                  }} className="btn btn-secondary" style={{ padding: '0 12px', height: '36px', fontSize: '0.85rem' }}>
                                    Tanya Status
                                  </button>
                                </div>
                              )}
                            </div>
                        </div>
                        
                        <div style={{ padding: '24px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {order.order_items?.map((item: any) => (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 500, color: 'var(--c-ink)' }}>{item.perfume_name}</div>
                                  <div style={{ fontSize: '0.9rem', color: 'var(--c-ink-muted)' }}>Ukuran: {item.size_label} x {item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: 500, color: 'var(--c-ink)' }}>
                                  {formatRupiah(item.subtotal)}
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ color: 'var(--c-ink-muted)' }}>Total Belanja</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--c-gold)' }}>
                              {formatRupiah(order.total)}
                            </div>
                          </div>

                          {order.waybill_number && order.courier_name && (
                            <div style={{ marginTop: '24px' }}>
                              <TrackingWidget waybill={order.waybill_number} courier={order.courier_name} />
                            </div>
                          )}
                        </div>
                        
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
