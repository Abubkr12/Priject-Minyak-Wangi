import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parent = searchParams.get('parent')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase.from('wilayah').select('kode, nama').order('nama', { ascending: true })

    if (!parent) {
      // Provinces: exactly 2 characters
      query = query.like('kode', '__')
    } else {
      // If parent is District (8 chars), child is Village (4 chars suffix). Otherwise 2 chars suffix.
      const suffix = parent.length === 8 ? '.____' : '.__'
      query = query.like('kode', `${parent}${suffix}`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error('API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
