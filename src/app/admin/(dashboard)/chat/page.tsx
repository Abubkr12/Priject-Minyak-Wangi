import { createClient } from '@/lib/supabase/server';
import { ChatAdminClient } from './ChatAdminClient';

export const metadata = {
  title: 'Manajemen Chat Pelanggan',
};

export default async function AdminChatPage() {
  const supabase = await createClient(true);

  // Ambil semua chat yang belum diarsipkan
  const { data: rawChats } = await supabase
    .from('chats')
    .select(`
      id,
      status,
      created_at,
      updated_at,
      customer_id,
      customer:customer_id (
        id,
        raw_user_meta_data
      ),
      messages:chat_messages (
        id,
        content,
        sender_type,
        created_at,
        is_read
      )
    `)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false });

  // Parsing data Supabase Join (karena tipe User bisa di raw_user_meta_data)
  const chats = rawChats?.map((chat: any) => {
    // Ambil pesan terakhir
    const sortedMessages = chat.messages?.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) || [];
    const lastMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null;

    // Hitung unread (pesan dari customer yang is_read == false)
    const unreadCount = sortedMessages.filter((m: any) => m.sender_type === 'customer' && !m.is_read).length;

    // Nama customer
    let customerName = 'Pelanggan';
    if (chat.customer && chat.customer.raw_user_meta_data?.full_name) {
      customerName = chat.customer.raw_user_meta_data.full_name;
    }

    return {
      id: chat.id,
      status: chat.status,
      customerName,
      customerId: chat.customer_id,
      lastMessage: lastMessage?.content || '',
      lastMessageTime: lastMessage?.created_at || chat.created_at,
      unreadCount,
      messages: sortedMessages
    };
  }) || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", color: "var(--c-ink)", marginBottom: 8 }}>
          Virtual Chat
        </h1>
        <p style={{ color: "var(--c-ink-dim)" }}>
          Balas pesan pelanggan secara realtime. Pesan aktif akan hangus dalam 24 jam untuk pelanggan, tapi Anda bisa mengarsipkannya.
        </p>
      </div>

      <ChatAdminClient initialChats={chats} />
    </div>
  );
}
