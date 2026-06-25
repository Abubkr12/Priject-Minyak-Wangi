// Deploy schema using Supabase Management API (SQL query endpoint)
// This uses the project management API, not the data API

const fs = require("fs");
const path = require("path");
const https = require("https");

// Supabase Management API requires a personal access token
// Alternative: we'll use the SQL API through the project dashboard programmatically

const SUPABASE_URL = "https://sstduefzeufwmltjzknc.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdGR1ZWZ6ZXVmd21sdGp6a25jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDgzMzc3MiwiZXhwIjoyMDk2NDA5NzcyfQ.L-VnRENszyx-qrn1pyFyl12SBodHQFnS51tFZmhmc8E";

// Split schema into individual statements that can be executed via REST
const SCHEMA_STEPS = [
  {
    name: "Create store_settings",
    rpc: null, // These need direct SQL - let's try a different approach
    // We'll create a temporary RPC function first, then use it
  }
];

// First, let's create a temporary SQL execution function via REST
async function makeRequest(url, method, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
    };

    if (postData) {
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function deploy() {
  console.log("=== Minyak Wangi Schema Deployment ===\n");

  // Step 1: Try creating the exec_sql RPC function via REST
  // This won't work directly - Supabase REST API is PostgREST which only does CRUD
  
  // The only way to execute DDL without direct PostgreSQL connection is:
  // 1. Supabase Dashboard SQL Editor (recommended)
  // 2. Supabase CLI (supabase db push)
  // 3. Direct PostgreSQL connection (requires IPv4 or IPv6 support)
  
  // Since direct connection fails (IPv6 only, ISP doesn't support),
  // Let's check if we can at least verify the REST API works
  
  console.log("Checking Supabase API connectivity...");
  const healthCheck = await makeRequest(`${SUPABASE_URL}/rest/v1/`, "GET");
  
  if (healthCheck.status === 200) {
    console.log("Supabase API: OK");
    
    // Check if tables already exist
    const tables = healthCheck.data?.paths ? Object.keys(healthCheck.data.paths) : [];
    const hasData = tables.length > 2; // More than just "/" and "/rpc/..."
    
    if (hasData) {
      console.log("\nTables found in Supabase:");
      tables.filter(t => t !== "/").forEach(t => console.log("  " + t));
      
      // Try to read perfumes
      const perfumes = await makeRequest(`${SUPABASE_URL}/rest/v1/perfumes?select=id,name,slug`, "GET");
      if (perfumes.status === 200 && Array.isArray(perfumes.data)) {
        console.log(`\nPerfumes in DB: ${perfumes.data.length}`);
        perfumes.data.forEach(p => console.log(`  ${p.id}. ${p.name} (${p.slug})`));
      }
    } else {
      console.log("\nNo tables found. Schema needs to be deployed.");
      console.log("\n========================================");
      console.log("CARA DEPLOY SCHEMA:");
      console.log("========================================");
      console.log("1. Buka https://supabase.com/dashboard");
      console.log("2. Login dan pilih project 'minyak wangi'");
      console.log("3. Klik 'SQL Editor' di sidebar kiri");
      console.log("4. Klik '+ New query'");
      console.log("5. Copy-paste isi file: supabase/schema.sql");
      console.log("6. Klik tombol 'Run' (Ctrl+Enter)");
      console.log("\nAlternatif: Install Supabase CLI");
      console.log("  npx supabase login");
      console.log("  npx supabase link --project-ref sstduefzeufwmltjzknc");
      console.log("  npx supabase db push");
    }
  } else {
    console.log(`Supabase API Error: ${healthCheck.status}`);
    console.log(healthCheck.data);
  }
}

deploy().catch(console.error);
