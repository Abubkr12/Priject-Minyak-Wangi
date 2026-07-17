import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Function to read AI Config from Supabase Database
async function getAiConfigs() {
  const supabase = createAdminClient();
  let apiKeys: string[] = [];
  let availableModels: string[] = [];
  
  try {
    const { data: keysData, error: keysError } = await supabase.from('ai_api_keys').select('api_key');
    if (!keysError && keysData && keysData.length > 0) {
      apiKeys = keysData.map(k => k.api_key);
    }
    
    const { data: modelsData, error: modelsError } = await supabase.from('ai_models').select('model_name').eq('is_active', true);
    if (!modelsError && modelsData && modelsData.length > 0) {
      availableModels = modelsData.map(m => m.model_name);
    }
  } catch (error: any) {
    console.error("Gagal membaca AI Config dari Supabase:", error);
  }
  
  // Fallbacks if Database reading fails or is empty
  if (apiKeys.length === 0) apiKeys = [process.env.GEMINI_API_KEY || ""];
  if (availableModels.length === 0) availableModels = ["gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-1.5-flash", "gemini-1.5-pro"];
  
  return { apiKeys, availableModels, configError: "" };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionId, message } = body;
    const supabase = createAdminClient();
    
    let currentSessionId = sessionId;
    let history: any[] = [];
    
    // 1. Manajamen Sesi (Tarik Riwayat dari Database)
    if (currentSessionId) {
      const { data: messagesData } = await supabase
        .from('ai_chat_messages')
        .select('role, content')
        .eq('session_id', currentSessionId)
        .order('created_at', { ascending: true });
      if (messagesData) {
        history = messagesData.map(m => ({ 
          role: m.role === 'assistant' ? 'model' : m.role, 
          parts: [{ text: m.content }] 
        }));
      }
    } else {
      // Buat sesi baru
      const { data: newSession, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .insert({})
        .select()
        .single();
        
      if (newSession) currentSessionId = newSession.id;
    }
    
    // Simpan pesan user ke database
    if (currentSessionId && message) {
      await supabase.from('ai_chat_messages').insert({
        session_id: currentSessionId,
        role: 'user',
        content: message.content
      });
    }

    // 2. Pencarian Data Bibit (Katalog)
    // Ambil data bibit dari DB
    const { data: bibitList } = await supabase
      .from('bibit')
      .select('name, intensity, main_accord, stock_ml')
      .eq('is_active', true);
      
    // Kelompokkan bibit untuk prompt
    let catalogueText = "Katalog Bibit yang Tersedia (JANGAN rekomendasikan di luar ini!):\n";
    if (bibitList) {
      const soft = bibitList.filter(b => b.intensity === 'Soft').map(b => b.name).join(", ");
      const medium = bibitList.filter(b => b.intensity === 'Medium').map(b => b.name).join(", ");
      const strong = bibitList.filter(b => b.intensity === 'Strong').map(b => b.name).join(", ");
      const uncategorized = bibitList.filter(b => !b.intensity).map(b => b.name).join(", ");
      
      catalogueText += `- Intensity Soft (Woody/Earthy): ${soft}\n`;
      catalogueText += `- Intensity Medium (Floral/Romantic): ${medium}\n`;
      catalogueText += `- Intensity Strong (Fresh/Calm): ${strong}\n`;
      if (uncategorized) catalogueText += `- Lain-lain: ${uncategorized}\n`;
    }

    // 3. Rakit Prompt Utuh
    const SYSTEM_PROMPT = `Lu adalah Nove, Asisten Toko (Master Perfumer) dari Ela Parfum.
Tugas lu adalah melayani pelanggan secara interaktif dan ramah, tapi JAWABLAH DENGAN SINGKAT DAN PADAT (hemat kuota).

ATURAN KETAT RACIKAN KUSTOM:
1. Lu HANYA BOLEH merekomendasikan parfum dari "Katalog Bibit yang Tersedia" di bawah ini. JANGAN HALUSINASI menyebut merk lain.
2. Rasio pencampuran (Kekuatan Aroma) yang diizinkan HANYA ADA 2:
   - 50/50 (Eau De Parfum)
   - 70/30 (Extrait De Parfum)
   JANGAN pernah memberikan atau menyetujui rasio lain (misal 60/40, dilarang!). Jika user meminta di luar itu, tolak dengan sopan dan tawarkan 2 opsi tersebut.
3. Tanya preferensi user secara bertahap jika belum jelas. Jika sudah jelas, berikan rekomendasi racikan yang pas.
4. Jika user mengunggah gambar, cobalah menebak notes parfum dari botol/gambar tersebut lalu cocokkan dengan bibit yang kita punya.

${catalogueText}`;

    const promptContents: any[] = [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Baik, saya mengerti aturannya." }] }
    ];
    
    // Masukkan riwayat
    promptContents.push(...history);
    
    // Masukkan pesan user terbaru
    const userParts: any[] = [{ text: message.content }];
    if (message.image) {
      const matches = message.image.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        userParts.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }
    promptContents.push({ role: "user", parts: userParts });

    // 4. Eksekusi API dengan Rotasi
    const { apiKeys, availableModels, configError: cfgErr } = await getAiConfigs();
    
    let resultText = "";
    let success = false;
    let lastError = "";
    
    for (let keyIdx = 0; keyIdx < apiKeys.length; keyIdx++) {
      for (let modIdx = 0; modIdx < availableModels.length; modIdx++) {
        try {
          const ai = new GoogleGenAI({ apiKey: apiKeys[keyIdx] });
          const response = await ai.models.generateContent({
            model: availableModels[modIdx],
            contents: promptContents,
            config: {
              temperature: 0.7
            }
          });
          
          resultText = response.text || '';
          success = true;
          break; // Berhasil, keluar dari loop model
        } catch (e: any) {
          console.log(`Model ${availableModels[modIdx]} pada key ${keyIdx} gagal:`, e.message);
          lastError = e.message;
          // Lanjut ke model berikutnya
        }
      }
      if (success) break; // Berhasil, keluar dari loop key
    }
    
    if (!success) {
      return NextResponse.json({ error: "Semua kuota API LLM telah habis. Coba lagi besok.", details: lastError, configError: cfgErr }, { status: 500 });
    }

    // 5. Simpan Respons AI ke Database
    if (currentSessionId) {
      await supabase.from('ai_chat_messages').insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: resultText
      });
    }

    // Kembalikan ke Frontend
    return NextResponse.json({ 
      sessionId: currentSessionId,
      reply: resultText 
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan server" }, { status: 500 });
  }
}
