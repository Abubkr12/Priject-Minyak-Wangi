import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, email, telepon, subjek, pesan } = body;

    if (!nama || !email || !pesan) {
      return NextResponse.json(
        { error: "Nama, email, dan pesan wajib diisi" },
        { status: 400 }
      );
    }

    // For now, log the message (Supabase integration later)
    console.log("[Contact Message]", { nama, email, telepon, subjek, pesan, timestamp: new Date().toISOString() });

    return NextResponse.json({ success: true, message: "Pesan berhasil dikirim" });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
