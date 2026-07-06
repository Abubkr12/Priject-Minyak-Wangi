import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { baseNote, description, ratio, imageBase64 } = body;

    const supabase = createAdminClient();
    
    // Fetch API key
    const { data: settingsData } = await supabase
      .from("store_settings")
      .select("key, value")
      .in("key", ["GEMINI_API_KEY"]);

    const settingsMap: Record<string, string> = {};
    if (settingsData) {
      settingsData.forEach(s => settingsMap[s.key] = s.value);
    }

    const apiKey = settingsMap.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not found" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });

    const SYSTEM_PROMPT = `Kamu adalah 'Master Perfumer' dari Ela Parfum (spesialis parfum isi ulang/refill).
Tugasmu adalah meracik parfum kustom berdasarkan permintaan pelanggan.

INPUT DARI PELANGGAN:
- Base Note Utama: ${baseNote || 'Tidak spesifik'}
- Kekuatan/Rasio Bibit: ${ratio === 'auto' ? 'Pilihkan yang terbaik sesuai deskripsi' : ratio}
- Deskripsi/Keinginan: ${description || 'Tidak ada deskripsi'}
${imageBase64 ? '- Pelanggan juga mengunggah gambar referensi parfum (analisis gambar tersebut).' : ''}

ATURAN KETAT:
1. JANGAN PERNAH membahas topik di luar parfum, refill, dan aroma. Tolak tegas jika ditanya soal MTK, curhat, dsb.
2. Jawab SINGKAT, PADAT, dan JELAS (demi menghemat kuota).

FORMAT OUTPUT (HARUS JSON):
{
  "customer_description": "Gambaran aroma yang puitis tapi singkat (maksimal 2 kalimat) untuk customer.",
  "name_suggestion": "Satu nama unik untuk racikan ini (misal: Midnight Citrus).",
  "admin_recipe": "Instruksi singkat racikan untuk admin/seller (misal: 40% Oud, 30% Rose, 30% Vanilla. Base pelarut 2:1)."
}`;

    const promptContents: any[] = [SYSTEM_PROMPT];

    if (imageBase64) {
      const matches = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        promptContents.push({
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        });
      }
    }

    // Dynamic model selection strategy (Fallback Loop)
    let modelList: string[] = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"];
    try {
      const modelsResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      const modelsData = await modelsResp.json();
      if (modelsData.models) {
        const availableFlashModels = modelsData.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .filter((m: any) => m.name.includes('gemini') && m.name.includes('flash'))
          .filter((m: any) => !m.name.includes('tts') && !m.name.includes('vision') && !m.name.includes('image') && !m.name.includes('embedding') && !m.name.includes('live'))
          .sort((a: any, b: any) => b.name.localeCompare(a.name)); // as in Transkrip Audio
          
        if (availableFlashModels.length > 0) {
          modelList = availableFlashModels.map((m: any) => m.name.replace('models/', ''));
        }
      }
    } catch (e) {
      console.warn("Failed to fetch models dynamically, using default fallback list:", e);
    }

    let lastError: any;
    for (const modelName of modelList) {
      try {
        console.log(`Mencoba menggunakan model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptContents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        });
        
        const resultText = response.text;
        return NextResponse.json(JSON.parse(resultText || "{}"));
      } catch (e: any) {
        console.warn(`Model ${modelName} gagal:`, e.message);
        lastError = e;
        // Continue loop to try the next model
      }
    }

    // If we reach here, all models failed
    throw lastError || new Error("Semua model Gemini gagal dihubungi");

  } catch (error: any) {
    console.error("Refill Advisor API Error:", error);
    return NextResponse.json({ 
      error: "Maaf, sistem racikan sedang sibuk. Silakan coba lagi.",
      details: error.message 
    }, { status: 500 });
  }
}
