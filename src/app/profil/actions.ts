'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string

  const { error } = await supabase
    .from('customer_profiles')
    .upsert({
      id: user.id,
      full_name,
      phone,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error('Gagal memperbarui profil')
  }

  revalidatePath('/profil')
}

export async function updateAvatarUrl(avatar_url: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('customer_profiles')
    .update({ avatar_url })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating avatar:', error)
    throw new Error('Gagal menyimpan avatar')
  }

  revalidatePath('/profil')
}
