'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAddress(data: {
  label: string;
  recipient_name: string;
  phone: string;
  region_code: string;
  maps_latitude: number;
  maps_longitude: number;
  address: string;
  village_name: string;
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Check if they already have addresses. If not, make this one default
  const { count } = await supabase
    .from('customer_addresses')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)

  const isDefault = count === 0;

  const { error } = await supabase
    .from('customer_addresses')
    .insert({
      customer_id: user.id,
      label: data.label,
      recipient_name: data.recipient_name,
      phone: data.phone,
      region_code: data.region_code,
      maps_latitude: data.maps_latitude,
      maps_longitude: data.maps_longitude,
      full_address: data.address,
      is_default: isDefault
    })

  if (error) {
    console.error('Error adding address:', error)
    throw new Error(`Gagal menyimpan alamat: ${error.message}`)
  }

  revalidatePath('/profil')
  revalidatePath('/checkout')
}

export async function deleteAddress(addressId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('customer_addresses')
    .delete()
    .match({ id: addressId, customer_id: user.id })

  if (error) throw new Error(error.message)
  
  revalidatePath('/profil')
  revalidatePath('/checkout')
}

export async function setDefaultAddress(addressId: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // First, set all to false
  await supabase
    .from('customer_addresses')
    .update({ is_default: false })
    .eq('customer_id', user.id)

  // Then set the selected to true
  const { error } = await supabase
    .from('customer_addresses')
    .update({ is_default: true })
    .match({ id: addressId, customer_id: user.id })

  if (error) throw new Error(error.message)

  revalidatePath('/profil')
  revalidatePath('/checkout')
}
