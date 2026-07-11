import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function checkDb() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, payment_status, paid_at, payment_verified_at")
    .limit(1);

  if (error) {
    console.error("Error querying:", error);
  } else {
    console.log("Success! Columns exist.", data);
  }
}
checkDb();
