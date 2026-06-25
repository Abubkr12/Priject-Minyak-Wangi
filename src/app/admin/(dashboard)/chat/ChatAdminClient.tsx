'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Send, User, Archive, CheckCircle2 } from 'lucide-react';
import { markChatAsRead, archiveChat } from './actions';

interface Message {
  id: string;
  content: string;
  sender_type: 'customer' | 'admin';
  created_at: string;
  is_read: boolean;
}

interface Chat {
  id: string;
  status: string;
  customerName: string;
  customerId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export function ChatAdminClient({ initialChats }: { initialChats: Chat[] }) {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const supabase = createClient();

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  // Handle Mark as Read when selecting a chat
  useEffect(() => {
    if (selectedChat && selectedChat.unreadCount > 0) {
      markChatAsRead(selectedChat.id).then(() => {
        setChats(prev => prev.map(c => 
          c.id === selectedChat.id ? { ...c, unreadCount: 0 } : c
        ));
      });
    }
  }, [selectedChat?.id]);

  // Subscribe to Realtime for all chats
  useEffect(() => {
    const channel = supabase.channel('admin_chats')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          
          setChats(prevChats => {
            const chatExists = prevChats.find(c => c.id === payload.new.chat_id);
            if (chatExists) {
              return prevChats.map(c => {
                if (c.id === payload.new.chat_id) {
                  return {
                    ...c,
                    messages: [...c.messages, newMsg],
                    lastMessage: newMsg.content,
                    lastMessageTime: newMsg.created_at,
                    unreadCount: (newMsg.sender_type === 'customer' && selectedChat?.id !== c.id) ? c.unreadCount + 1 : c.unreadCount
                  };
                }
                return c;
              });
            } else {
              // Jika chat baru, kita idealnya re-fetch, tapi untuk sekarang kita biarkan saja atau butuh refresh manual.
              return prevChats;
            }
          });

          if (selectedChat?.id === payload.new.chat_id) {
            setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : prev);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChat?.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChat) return;

    const messageText = input.trim();
    setInput('');
    setLoading(true);

    await supabase.from('chat_messages').insert({
      chat_id: selectedChat.id,
      sender_type: 'admin',
      content: messageText
    });

    setLoading(false);
  };

  const handleArchive = async (chatId: string) => {
    if (!confirm('Apakah Anda yakin ingin mengarsipkan percakapan ini? (Pelanggan tidak akan bisa membalas lagi)')) return;
    
    await archiveChat(chatId);
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (selectedChat?.id === chatId) setSelectedChat(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, height: 'calc(100vh - 180px)', minHeight: 500 }}>
      {/* Sidebar Chat List */}
      <div style={{ background: 'var(--c-surface-1)', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: '1px solid var(--c-border)', background: 'var(--bg-color)' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--c-ink)' }}>Daftar Chat</h3>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--c-ink-dim)', fontSize: '0.9rem' }}>
              Belum ada pesan aktif.
            </div>
          ) : (
            chats.map(chat => (
              <div 
                key={chat.id} 
                onClick={() => setSelectedChat(chat)}
                style={{ 
                  padding: 16, 
                  borderBottom: '1px solid var(--c-border)', 
                  cursor: 'pointer',
                  background: selectedChat?.id === chat.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                  transition: '0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: 'var(--c-ink)' }}>{chat.customerName}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--c-ink-dim)' }}>
                    {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--c-ink-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                    {chat.lastMessage}
                  </span>
                  {chat.unreadCount > 0 && (
                    <div style={{ background: 'var(--c-rose)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: 10, fontWeight: 600 }}>
                      {chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ background: 'var(--c-surface-1)', borderRadius: 'var(--r-lg)', border: '1px solid var(--c-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedChat ? (
          <>
            {/* Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-border)', background: 'var(--bg-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--c-gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-gold)' }}>
                  <User size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--c-ink)' }}>{selectedChat.customerName}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--c-ink-dim)' }}>Online (Sesi 24 Jam)</span>
                </div>
              </div>

              <button 
                onClick={() => handleArchive(selectedChat.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'transparent', border: '1px solid var(--c-border)', borderRadius: 'var(--r-md)', color: 'var(--c-ink-dim)', cursor: 'pointer' }}
              >
                <Archive size={16} /> Arsipkan Chat
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {selectedChat.messages.map(msg => {
                const isAdmin = msg.sender_type === 'admin';
                return (
                  <div key={msg.id} style={{
                    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                    background: isAdmin ? 'var(--c-gold)' : 'var(--bg-color)',
                    color: isAdmin ? '#000' : 'var(--c-ink)',
                    padding: '12px 16px',
                    borderRadius: 'var(--r-md)',
                    borderBottomRightRadius: isAdmin ? 0 : 'var(--r-md)',
                    borderBottomLeftRadius: !isAdmin ? 0 : 'var(--r-md)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    border: !isAdmin ? '1px solid var(--c-border)' : 'none'
                  }}>
                    {msg.content}
                    <div style={{ fontSize: '0.7rem', color: isAdmin ? 'rgba(0,0,0,0.5)' : 'var(--c-ink-dim)', marginTop: 4, textAlign: isAdmin ? 'right' : 'left' }}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={sendMessage} style={{ padding: 16, background: 'var(--bg-color)', borderTop: '1px solid var(--c-border)', display: 'flex', gap: 12 }}>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ketik balasan untuk pelanggan..."
                disabled={loading}
                style={{ flex: 1, padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1px solid var(--c-border)', background: 'var(--c-surface-1)', color: 'var(--c-ink)', outline: 'none' }}
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                style={{ padding: '0 24px', borderRadius: 'var(--r-md)', background: 'var(--c-gold)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', opacity: (loading || !input.trim()) ? 0.5 : 1 }}
              >
                <Send size={18} /> Kirim
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--c-ink-dim)' }}>
            <CheckCircle2 size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
            <p>Pilih obrolan dari daftar untuk mulai membalas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
