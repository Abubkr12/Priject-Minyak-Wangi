import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
  try {
    // Lakukan query super ringan ke database untuk trigger aktivitas API
    // Limit 1 agar tidak memberatkan server
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Keep-alive ping error:', error.message);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }

    console.log('Keep-alive ping success. Supabase is active.');
    return NextResponse.json({ 
      status: 'success', 
      message: 'Supabase kept alive', 
      timestamp: new Date().toISOString() 
    }, { status: 200 });

  } catch (error: any) {
    console.error('Unexpected keep-alive error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}
