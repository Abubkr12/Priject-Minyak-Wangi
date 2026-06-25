'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function markChatAsRead(chatId: string) {
  const supabase = await createClient(true);
  
  // Semua pesan di chat ini dari customer ditandai sebagai sudah dibaca
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('chat_id', chatId)
    .eq('sender_type', 'customer');

  if (error) {
    console.error('Error markAsRead:', error);
  }
}

export async function archiveChat(chatId: string) {
  const supabase = await createClient(true);

  const { error } = await supabase
    .from('chats')
    .update({ is_archived: true, status: 'closed' })
    .eq('id', chatId);

  if (error) {
    console.error('Error archiveChat:', error);
    throw new Error('Gagal mengarsipkan chat');
  }

  revalidatePath('/admin/chat');
}
