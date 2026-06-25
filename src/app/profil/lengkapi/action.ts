'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeProfile(data: {
  region_code: string;
  maps_latitude: number;
  maps_longitude: number;
  address: string;
  village_name: string; // we can save this into city/province or just address
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('customer_profiles')
    .upsert({
      id: user.id,
      region_code: data.region_code,
      maps_latitude: data.maps_latitude,
      maps_longitude: data.maps_longitude,
      address: data.address,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error(`Gagal menyimpan ke database Supabase: ${error.message} (Hint: Apakah lu udah nge-run SQL ALTER TABLE buat nambahin kolom region_code, maps_latitude, maps_longitude di dashboard Supabase?)`)
  }

  revalidatePath('/profil')
  revalidatePath('/checkout')
}
