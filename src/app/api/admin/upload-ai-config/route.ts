import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import * as xlsx from 'xlsx';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, message: 'Tidak ada file yang diupload' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer, { type: 'buffer' });

    let newKeys: string[] = [];
    let newModels: any[] = [];

    // Parse API Keys
    const apiSheet = workbook.Sheets['API Key List'];
    if (apiSheet) {
      const apiData = xlsx.utils.sheet_to_json(apiSheet, { header: 1 });
      newKeys = apiData.map((row: any) => row[0]).filter((key: any) => typeof key === 'string' && key.trim() !== '');
    }

    // Parse Models
    const modelSheet = workbook.Sheets['Avalaibe for use AI Free Plan'];
    if (modelSheet) {
      const modelData = xlsx.utils.sheet_to_json(modelSheet);
      newModels = modelData
        .filter((row: any) => row['RPM'] && !row['RPM'].includes('0 / 0'))
        .map((row: any) => {
          const name = row['Model'];
          if (!name || name.trim() === '') return null;
          return {
            model_name: name.toLowerCase().replace(/ /g, '-').replace('gemini-2.5', 'gemini-2.5'),
            category: row['Category'] || '',
            rpm: row['RPM'] || '',
            tpm: row['TPM'] || '',
            rpd: row['RPD'] || ''
          };
        })
        .filter(Boolean);
    }

    if (newKeys.length === 0 && newModels.length === 0) {
      return NextResponse.json({ success: false, message: 'File Excel tidak memiliki format yang valid atau kosong' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Reset API Keys
    if (newKeys.length > 0) {
      await supabase.from('ai_api_keys').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const keysToInsert = newKeys.map(k => ({ api_key: k }));
      await supabase.from('ai_api_keys').insert(keysToInsert);
    }

    // Reset Models
    if (newModels.length > 0) {
      await supabase.from('ai_models').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ai_models').insert(newModels);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil import ${newKeys.length} API Keys dan ${newModels.length} Models` 
    });

  } catch (error: any) {
    console.error('Upload config error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Terjadi kesalahan saat memproses file' }, { status: 500 });
  }
}
