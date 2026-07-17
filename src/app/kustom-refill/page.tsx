"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, Loader2, Image as ImageIcon, X, Package, Grid3X3, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCart } from "@/lib/cart-context";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
};

export default function KustomRefillChatbot() {
  const { totalItems } = useCart();
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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch User
  useEffect(() => {
    const fetchUser = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient(true);
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress image client side
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

  const handleSend = async () => {
    if (!input.trim() && !imageBase64) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim() || "Minta rekomendasi parfum dari gambar ini.",
      image: imageBase64 || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: 64, boxSizing: 'border-box', background: 'var(--c-bg)', color: 'var(--c-ink)', fontFamily: 'var(--font-body)' }}>
      {/* Topbar */}
      <header className="topbar" role="banner">
        <Link href="/" className="topbar__brand" aria-label="Kembali ke beranda">
          <img src="/assets/Ela Parfum.svg" alt="Ela Parfum Logo" style={{ height: "40px", width: "auto" }} />
        </Link>
        <div className="topbar__spacer" />
        <nav className="topbar__nav" aria-label="Navigasi utama">
          <Link href="/" className="topbar__nav-link"><Package size={15} /> Beranda</Link>
          <Link href="/katalog" className="topbar__nav-link"><Grid3X3 size={15} /> Katalog</Link>
          <Link href="/about" className="topbar__nav-link"><Bot size={15} /> Tentang</Link>
        </nav>
        <div className="topbar__actions">
          <ThemeToggle />
          
          {user ? (
            <Link href="/profil" className="btn-icon" aria-label="Profil Saya">
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--c-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                {user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </Link>
          ) : (
            <Link href="/login" className="btn" style={{ padding: '0 16px', height: '36px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.06)' }}>
              Masuk
            </Link>
          )}

          <Link href="/keranjang" className="btn-icon" aria-label={`Keranjang (${totalItems})`} style={{ position: "relative" }}>
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span style={{
                position: "absolute", top: -6, right: -6,
                width: 18, height: 18, borderRadius: "50%",
                background: "var(--c-gold)", color: "#0a0c0b",
                fontSize: "0.65rem", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>

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
                    {msg.content}
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
                  <Loader2 className="animate-spin" size={16} color="var(--c-gold)" />
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
                onClick={handleSend}
                disabled={loading || (!input.trim() && !imageBase64)}
                style={{ 
                  padding: '10px', background: 'transparent', border: 'none', 
                  color: (loading || (!input.trim() && !imageBase64)) ? 'var(--c-ink-dim)' : 'var(--c-gold)', 
                  cursor: (loading || (!input.trim() && !imageBase64)) ? 'not-allowed' : 'pointer' 
                }}
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
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
