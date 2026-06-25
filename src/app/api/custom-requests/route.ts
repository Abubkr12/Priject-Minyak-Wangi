import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { customer_name, customer_whatsapp, base_note, description, ai_recipe } = body;

    if (!customer_name || !customer_whatsapp || !base_note || !description || !ai_recipe) {
      return NextResponse.json({ error: "Semua data harus diisi" }, { status: 400 });
    }

    // Gunakan user.id untuk validasi jika ingin dikaitkan (tambahkan kolom user_id jika ada, atau cukup biarkan gini)
    const { data, error } = await supabase
      .from("custom_requests")
      .insert([
        {
          customer_name,
          customer_whatsapp,
          base_note,
          description,
          ai_recipe
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Check if admin (optional check, assuming only admin access this, or use specific admin validation)
    // For now we just return all
    const { data, error } = await supabase
      .from("custom_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
