import fs from 'fs';
import path from 'path';

async function main() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  const keys: string[] = [];
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.includes('API_KEY_') && !line.startsWith('#')) {
      const parts = line.split('=');
      if (parts.length >= 2) {
        keys.push(parts[1].trim().replace(/['"]/g, ''));
      }
    }
  }

  if (keys.length === 0) {
    console.log("No keys found.");
    return;
  }
  
  console.log(`Testing with key: ${keys[0].substring(0, 10)}...`);
  
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keys[0]}`);
  const data = await res.json();
  
  if (data.models) {
    console.log("AVAILABLE MODELS FOR THIS KEY:");
    data.models.forEach((m: any) => console.log(m.name));
  } else {
    console.log("ERROR:");
    console.dir(data, {depth: null});
  }
}

main().catch(console.error);
