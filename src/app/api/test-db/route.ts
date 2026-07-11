import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    
    // Attempt to select the columns to verify they exist
    const { data: cols, error: colError } = await supabaseAdmin
      .from("orders")
      .select("id, status, payment_status, paid_at, payment_verified_at")
      .limit(1);

    if (colError) {
      return NextResponse.json({ success: false, error: "Columns do not exist or query failed: " + colError.message, details: colError });
    }

    // Now try to update the order that has status pending
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("status", "pending")
      .not("payment_proof", "is", null)
      .limit(1);

    if (orders && orders.length > 0) {
      const orderToUpdate = orders[0];
      const { error: updateError } = await supabaseAdmin
        .from("orders")
        .update({
          status: 'processing',
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          payment_verified_at: new Date().toISOString()
        })
        .eq("id", orderToUpdate.id);

      if (updateError) {
        return NextResponse.json({ success: false, error: "Update failed: " + updateError.message, details: updateError });
      }

      return NextResponse.json({ success: true, message: "Order updated successfully", orderId: orderToUpdate.id });
    }

    return NextResponse.json({ success: true, message: "No pending orders with payment proof found.", cols });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
