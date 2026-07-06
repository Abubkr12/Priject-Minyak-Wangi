'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { usePathname } from 'next/navigation';

interface Message {
  id: string;
  sender_type: 'customer' | 'admin';
  content: string;
  created_at: string;
}

export function ChatWidget({ userId }: { userId?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const pathname = usePathname();
  const supabase = createClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Removed early return to prevent hook order mismatch

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!userId || !isOpen) return;

    const fetchChat = async () => {
      // Cari sesi chat aktif (belum diarsipkan, atau dalam 24 jam)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: activeChat, error: chatError } = await supabase
        .from('chats')
        .select('id')
        .eq('customer_id', userId)
        .eq('status', 'open')
        .eq('is_archived', false)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let currentChatId = activeChat?.id;

      if (!currentChatId && !chatError) {
        // Buat sesi baru
        const { data: newChat } = await supabase
          .from('chats')
          .insert({ customer_id: userId })
          .select('id')
          .single();
        if (newChat) currentChatId = newChat.id;
      }

      if (currentChatId) {
        setChatId(currentChatId);
        
        // Fetch pesan
        const { data: msgs } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('chat_id', currentChatId)
          .order('created_at', { ascending: true });
          
        if (msgs) setMessages(msgs);

        // Subscribe to Realtime
        const channel = supabase.channel(`chat_${currentChatId}`)
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${currentChatId}` },
            (payload) => {
              setMessages((prev) => [...prev, payload.new as Message]);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    };

    fetchChat();
  }, [isOpen, userId]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatId || !userId) return;

    const messageText = input.trim();
    setInput('');
    setLoading(true);

    await supabase.from('chat_messages').insert({
      chat_id: chatId,
      sender_type: 'customer',
      content: messageText
    });

    setLoading(false);
  };

  // Harus login untuk chat dan jangan tampilkan di halaman admin
  if (!userId || pathname.startsWith('/admin')) return null;

  return (
    <>
      {/* Tombol Floating */}
      <button 
        id="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--c-gold)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(201, 168, 76, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

      {/* Jendela Chat */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '350px',
          height: '500px',
          background: 'var(--c-surface-1)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--r-lg)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9998,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            background: 'var(--bg-color)',
            borderBottom: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-gold)' }}>
              <User size={20} />
            </div>
            <div>
              <h4 style={{ margin: 0, color: 'var(--c-ink)', fontSize: '1rem', fontWeight: 600 }}>Tanya Admin</h4>
              <p style={{ margin: 0, color: 'var(--c-ink-dim)', fontSize: '0.8rem' }}>Kami siap membantu</p>
            </div>
          </div>

          {/* Pesan */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--c-ink-dim)', marginTop: '40px', fontSize: '0.9rem' }}>
                <MessageCircle size={32} style={{ opacity: 0.5, margin: '0 auto 8px' }} />
                <p>Halo! Ada yang bisa kami bantu seputar pesanan atau konsultasi parfum?</p>
              </div>
            ) : (
              messages.map(msg => {
                const isCustomer = msg.sender_type === 'customer';
                return (
                  <div key={msg.id} style={{
                    alignSelf: isCustomer ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    background: isCustomer ? 'var(--c-gold)' : 'var(--bg-color)',
                    color: isCustomer ? '#000' : 'var(--c-ink)',
                    padding: '10px 14px',
                    borderRadius: 'var(--r-md)',
                    borderBottomRightRadius: isCustomer ? 0 : 'var(--r-md)',
                    borderBottomLeftRadius: !isCustomer ? 0 : 'var(--r-md)',
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                    border: !isCustomer ? '1px solid var(--c-border)' : 'none'
                  }}>
                    {msg.content}
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} style={{
            padding: '12px',
            background: 'var(--bg-color)',
            borderTop: '1px solid var(--c-border)',
            display: 'flex',
            gap: '8px'
          }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan..."
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 'var(--r-full)',
                border: '1px solid var(--c-border)',
                background: 'var(--c-surface-1)',
                color: 'var(--c-ink)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--c-gold)',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: (loading || !input.trim()) ? 0.5 : 1
              }}
            >
              <Send size={18} style={{ marginLeft: '-2px' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
