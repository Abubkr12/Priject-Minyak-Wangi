import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  // 1. Check if payment-assets bucket exists
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  if (bucketsError) {
    return NextResponse.json({ error: 'Failed to list buckets', details: bucketsError });
  }
  
  const hasProducts = buckets.some(b => b.name === 'payment-assets');
  
  if (!hasProducts) {
    // try to create it
    const { data: createData, error: createError } = await supabase.storage.createBucket('payment-assets', { public: true });
    if (createError) {
      return NextResponse.json({ error: 'Failed to create payment-assets bucket', details: createError, buckets });
    }
  }

  // 2. Try to upload a tiny file
  const buffer = Buffer.from('hello world');
  const fileName = `test-${Date.now()}.txt`;
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-assets')
    .upload(fileName, buffer, {
      contentType: 'text/plain',
      upsert: true
    });
    
  if (uploadError) {
    return NextResponse.json({ error: 'Failed to upload', details: uploadError, hasProducts });
  }
  
  const { data: urlData } = supabase.storage.from('payment-assets').getPublicUrl(fileName);

  return NextResponse.json({
    success: true,
    buckets,
    uploadData,
    publicUrl: urlData.publicUrl
  });
}
