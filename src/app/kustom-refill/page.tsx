"use client";

import { useState, useRef, useEffect, Fragment } from "react";
import { Send, Sparkles, User, Bot, Loader2, Image as ImageIcon, X, Package, Grid3X3, ShoppingBag, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/lib/cart-context";
import { PageHeader } from "@/components/page-header";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
};

export default function KustomRefillChatbot() {
  const { totalItems } = useCart();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Halo! Saya Master Perfumer dari Ela Parfum. Ceritakan parfum impian Anda, atau sebutkan aroma yang Anda suka (misal: vanilla, segar, kayu). Anda juga bisa mengunggah gambar referensi parfum!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [bibitList, setBibitList] = useState<any[]>([]);
  const [botolList, setBotolList] = useState<any[]>([]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch User & Catalog
  useEffect(() => {
    const fetchInit = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: bibit } = await supabase.from('bibit').select('*').eq('is_active', true);
      const { data: botol } = await supabase.from('botol').select('*').eq('is_active', true);
      if (bibit) setBibitList(bibit);
      if (botol) setBotolList(botol);
    };
    fetchInit();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setImageBase64(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input.trim();
    if (!textToSend && !imageBase64) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend || "Minta rekomendasi parfum dari gambar ini.",
      image: imageBase64 || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput("");
    setImageBase64(null);
    setLoading(true);

    try {
      const res = await fetch("/api/refill-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          sessionId: sessionId,
          message: userMessage
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendapatkan respons AI");

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err: any) {
      toast.error(err.message);
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCheckout = async (perfumeId: string, ratio: string, bottleId: string) => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk memesan");
      router.push("/login?redirect=/kustom-refill");
      return;
    }
    const perfume = bibitList.find(b => b.id.toString() === perfumeId);
    const botol = botolList.find(b => b.id.toString() === bottleId);
    if (!perfume || !botol) {
      toast.error("Data parfum atau botol tidak valid");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: user.user_metadata?.full_name || "Pelanggan Ela",
          customer_whatsapp: user.user_metadata?.phone || "08000000000",
          base_note: perfume.name,
          description: `Rasio: ${ratio}, Botol: ${botol.name}`,
          volume_ml: botol.capacity_ml,
          ai_recipe: `Parfum: ${perfume.name}\nRasio: ${ratio}\nBotol: ${botol.name}\nIntensitas: ${perfume.intensity}`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Pesanan berhasil dibuat!");
      router.push(`/checkout/custom/${data.data.id}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat pesanan");
    } finally {
      setLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
    const regex = /(\[PERFUME_CARD:id=[^\]]+\]|\[BOTTLE_CARD:id=[^\]]+\]|\[CHECKOUT_BUTTON:[^\]]+\])/g;
    const parts = content.split(regex);
    
    return parts.map((part, index) => {
      if (part.startsWith('[PERFUME_CARD:id=')) {
        const id = part.match(/id=([^\]]+)/)?.[1];
        const bibit = bibitList.find(b => b.id.toString() === id);
        if (!bibit) return null;
        return (
          <div key={index} style={{ border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', padding: 12, marginTop: 12, marginBottom: 12, background: 'var(--c-surface-2)', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, color: 'var(--c-gold)', fontSize: '1.05rem', fontWeight: 600 }}>{bibit.name}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-dim)', marginTop: 4 }}>Intensitas: {bibit.intensity} | Akord: {bibit.main_accord}</div>
            </div>
            <button onClick={() => handleSend(`Saya memilih parfum: ${bibit.name}`)} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', height: 'auto' }}>Pilih Parfum</button>
          </div>
        );
      }
      if (part.startsWith('[BOTTLE_CARD:id=')) {
        const id = part.match(/id=([^\]]+)/)?.[1];
        const botol = botolList.find(b => b.id.toString() === id);
        if (!botol) return null;
        return (
          <div key={index} style={{ border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', padding: 12, marginTop: 12, marginBottom: 12, background: 'var(--c-surface-2)', display: 'flex', alignItems: 'center', gap: 16 }}>
            {botol.image_url ? (
              <img src={botol.image_url} alt={botol.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: 4, background: 'var(--c-surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--c-border)' }}>
                <Package size={20} color="var(--c-ink-dim)" />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, color: 'var(--c-gold)', fontSize: '1.05rem', fontWeight: 600 }}>{botol.name}</h4>
              <div style={{ fontSize: '0.85rem', color: 'var(--c-ink-dim)', marginTop: 4 }}>Kapasitas: {botol.capacity_ml}ml | Rp{botol.price.toLocaleString('id-ID')}</div>
            </div>
            <button onClick={() => handleSend(`Saya memilih botol: ${botol.name}`)} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '0.85rem', height: 'auto' }}>Pilih Botol</button>
          </div>
        );
      }
      if (part.startsWith('[CHECKOUT_BUTTON:')) {
        const paramsStr = part.match(/\[CHECKOUT_BUTTON:([^\]]+)\]/)?.[1];
        if (!paramsStr) return null;
        const paramArr = paramsStr.split('|').map(s => s.split('='));
        const params: any = {};
        paramArr.forEach(([k,v]) => { if(k&&v) params[k]=v; });
        
        return (
          <div key={index} style={{ marginTop: 24, marginBottom: 12 }}>
            <button onClick={() => handleCheckout(params.perfumeId, params.ratio, params.bottleId)} className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }}>
              <ShoppingCart size={18} style={{ marginRight: 8 }} /> Pesan Sekarang
            </button>
          </div>
        );
      }
      return <Fragment key={index}>{part}</Fragment>;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: 64, boxSizing: 'border-box', background: 'var(--c-bg)', color: 'var(--c-ink)', fontFamily: 'var(--font-body)' }}>
      {/* Topbar */}
      <PageHeader />

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
      <div style={{ 
        width: 260, 
        background: 'var(--c-surface-1)', 
        borderRight: '1px solid var(--c-border)', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Sparkles size={24} color="var(--c-gold)" />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Ela Perfumer AI</h1>
        </div>
        <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--c-ink-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
            Obrolan Baru
          </div>
          <button 
            onClick={() => { setMessages([messages[0]]); setSessionId(null); }} 
            style={{ 
              width: '100%', textAlign: 'left', padding: '10px 12px', background: 'var(--c-surface-2)', 
              border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', color: 'var(--c-ink)', 
              cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 
            }}
          >
            <Sparkles size={16} color="var(--c-gold)" /> Mulai Konsultasi Baru
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 20px 140px', scrollBehavior: 'smooth' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', gap: 16, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-surface-2)', border: '1px solid var(--c-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={20} color="var(--c-gold)" />
                  </div>
                )}
                
                <div style={{ 
                  maxWidth: '85%', 
                  background: msg.role === 'user' ? 'var(--c-gold)' : 'var(--c-surface-1)', 
                  color: msg.role === 'user' ? '#fff' : 'var(--c-ink)',
                  padding: '16px 20px',
                  borderRadius: 'var(--r-lg)',
                  borderTopRightRadius: msg.role === 'user' ? 4 : 'var(--r-lg)',
                  borderTopLeftRadius: msg.role === 'assistant' ? 4 : 'var(--r-lg)',
                  border: msg.role === 'assistant' ? '1px solid var(--c-border)' : 'none',
                  boxShadow: msg.role === 'user' ? '0 4px 12px rgba(59,130,246,0.3)' : 'none'
                }}>
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 'var(--r-md)', marginBottom: 12, objectFit: 'contain' }} />
                  )}
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
                    {msg.role === 'assistant' ? renderMessageContent(msg.content) : msg.content}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-surface-2)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={20} color="var(--c-ink)" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--c-surface-2)', border: '1px solid var(--c-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={20} color="var(--c-gold)" />
                </div>
                <div style={{ background: 'var(--c-surface-1)', color: 'var(--c-ink)', padding: '16px 20px', borderRadius: 'var(--r-lg)', borderTopLeftRadius: 4, border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="loader" style={{ width: '20px', height: '20px' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--c-ink-dim)' }}>Master Perfumer sedang meracik...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div style={{ 
          position: 'absolute', bottom: 0, left: 0, right: 0, 
          padding: '24px 20px 32px', 
          background: 'linear-gradient(to top, var(--c-bg) 70%, transparent)',
          pointerEvents: 'none'
        }}>
          <div style={{ maxWidth: 800, margin: '0 auto', pointerEvents: 'auto' }}>
            {imageBase64 && (
              <div style={{ marginBottom: 12, position: 'relative', display: 'inline-block' }}>
                <img src={imageBase64} alt="Preview" style={{ height: 80, borderRadius: 'var(--r-sm)', border: '1px solid var(--c-border)' }} />
                <button 
                  onClick={() => setImageBase64(null)}
                  style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', padding: 4, cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}
            
            <div style={{ 
              display: 'flex', alignItems: 'flex-end', background: 'var(--c-surface-1)', 
              border: '1px solid var(--c-border)', borderRadius: 'var(--r-lg)', 
              boxShadow: 'var(--shadow-float)', padding: '8px 12px', transition: 'border 0.2s'
            }}>
              <label style={{ padding: '8px', cursor: 'pointer', color: 'var(--c-ink-muted)' }}>
                <ImageIcon size={20} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Konsultasi tentang parfum..."
                disabled={loading}
                rows={1}
                style={{ 
                  flex: 1, background: 'transparent', border: 'none', color: 'var(--c-ink)', 
                  padding: '10px', fontSize: '1rem', resize: 'none', outline: 'none', 
                  maxHeight: 120, minHeight: 40, fontFamily: 'inherit'
                }}
              />
              
              <button
                onClick={() => handleSend()}
                disabled={loading || (!input.trim() && !imageBase64)}
                style={{ 
                  padding: '10px', background: 'transparent', border: 'none', 
                  color: (loading || (!input.trim() && !imageBase64)) ? 'var(--c-ink-dim)' : 'var(--c-gold)', 
                  cursor: (loading || (!input.trim() && !imageBase64)) ? 'not-allowed' : 'pointer' 
                }}
              >
                {loading ? <div className="loader" style={{ width: '20px', height: '20px', display: 'inline-grid' }} /> : <Send size={20} />}
              </button>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: '0.75rem', color: 'var(--c-ink-dim)' }}>
              AI dapat melakukan kesalahan. Konsultasikan dengan admin jika ragu.
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
