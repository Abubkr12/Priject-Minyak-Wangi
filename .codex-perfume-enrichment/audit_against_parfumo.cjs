const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");
const { createClient } = require("@supabase/supabase-js");

const projectRoot = process.argv[2];
const workbookPath = process.argv[3];
const outputPath = process.argv[4];
const sourceUrl = "https://raw.githubusercontent.com/rfordatascience/tidytuesday/main/data/2024/2024-12-10/parfumo_data_clean.csv";

const normalize = (value) => String(value || "")
  .normalize("NFKD")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .replace(/\s+/g, " ");
const compact = (value) => normalize(value).replace(/\s+/g, "");
const words = (value) => new Set(normalize(value).split(" ").filter((word) => word.length >= 1));
const jaccard = (left, right) => {
  const a = words(left);
  const b = words(right);
  const union = new Set([...a, ...b]);
  const shared = [...a].filter((word) => b.has(word)).length;
  return union.size ? shared / union.size : 0;
};
const normalizeNotes = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
};
const profileNotes = (profile) => ["top_notes", "middle_notes", "base_notes"].flatMap((field) =>
  normalizeNotes(profile[field]).map((note) => normalize(typeof note === "string" ? note : note?.name)).filter(Boolean),
);
const parseDatasetNotes = (value) => String(value || "")
  .split(/[,;|]/)
  .map((entry) => normalize(entry.replace(/[\[\]"']/g, "")))
  .filter(Boolean);
const noteSimilarity = (left, right) => {
  const a = new Set(left);
  const b = new Set(right);
  const union = new Set([...a, ...b]);
  const shared = [...a].filter((item) => b.has(item)).length;
  return union.size ? shared / union.size : 0;
};

async function main() {
  const csvResponse = await fetch(sourceUrl);
  if (!csvResponse.ok) throw new Error(`Unable to load Parfumo dataset: ${csvResponse.status}`);
  const csvText = await csvResponse.text();
  const referenceWorkbook = xlsx.read(csvText, { type: "string" });
  const referenceRows = xlsx.utils.sheet_to_json(referenceWorkbook.Sheets[referenceWorkbook.SheetNames[0]], { defval: "" });
  const referenceByCompact = new Map();
  const tokenIndex = new Map();
  referenceRows.forEach((row, index) => {
    const perfumeName = row.Name || row.name || "";
    const brand = row.Brand || row.brand || "";
    const nameKey = compact(perfumeName);
    const combinedKey = compact(`${perfumeName} ${brand}`);
    for (const key of [nameKey, combinedKey]) {
      if (!key) continue;
      if (!referenceByCompact.has(key)) referenceByCompact.set(key, []);
      referenceByCompact.get(key).push(index);
    }
    for (const token of words(`${perfumeName} ${brand}`)) {
      if (!tokenIndex.has(token)) tokenIndex.set(token, []);
      tokenIndex.get(token).push(index);
    }
  });

  const envText = fs.readFileSync(path.join(projectRoot, ".env.local"), "utf8");
  const env = Object.fromEntries(envText.split(/\r?\n/)
    .map((line) => line.match(/^([^=]+)=(.*)$/))
    .filter(Boolean)
    .map((match) => [match[1], match[2]]));
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: profiles, error } = await supabase
    .from("bibit")
    .select("id,name,intensity,top_notes,middle_notes,base_notes")
    .order("id", { ascending: true })
    .range(0, 1999);
  if (error) throw new Error(error.message);
  const profileMap = new Map((profiles || []).map((profile) => [normalize(profile.name), profile]));

  const workbook = xlsx.readFile(workbookPath);
  const inputs = ["Parfum Umum", "Parfum Arab"].flatMap((sheetName) => {
    const field = sheetName === "Parfum Arab" ? "NAMA PARFUM ARAB" : "NAMA PARFUM";
    return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]).map((row) => ({ sheetName, name: row[field] }));
  });

  const audited = inputs.map((input) => {
    const inputKey = normalize(input.name);
    const directIndexes = referenceByCompact.get(compact(input.name)) || [];
    let candidateIndexes = [...directIndexes];
    if (!candidateIndexes.length) {
      const pool = new Set();
      for (const token of words(input.name)) {
        for (const index of tokenIndex.get(token) || []) pool.add(index);
      }
      candidateIndexes = [...pool];
    }
    let best = null;
    for (const index of candidateIndexes) {
      const row = referenceRows[index];
      const perfumeName = row.Name || row.name;
      const combinedName = `${perfumeName} ${row.Brand || row.brand}`;
      const inputTokens = words(input.name);
      const candidateTokens = words(combinedName);
      const sharedTokens = [...inputTokens].filter((token) => candidateTokens.has(token)).length;
      const exactName = compact(perfumeName) === compact(input.name);
      const exactCombined = compact(combinedName) === compact(input.name);
      const score = Math.max(
        exactName || exactCombined ? 1 : 0,
        sharedTokens >= 2 ? jaccard(input.name, perfumeName) : 0,
        sharedTokens >= 2 ? jaccard(input.name, combinedName) : 0,
      );
      if (!best || score > best.score) best = { row, score };
    }
    const profile = profileMap.get(inputKey);
    const referenceNotes = best ? [
      ...parseDatasetNotes(best.row.Top_Notes || best.row.top_notes),
      ...parseDatasetNotes(best.row.Middle_Notes || best.row.middle_notes),
      ...parseDatasetNotes(best.row.Base_Notes || best.row.base_notes),
    ] : [];
    const similarity = best && profile ? noteSimilarity(profileNotes(profile), referenceNotes) : null;
    const status = !best || best.score < 0.8
      ? "unmatched"
      : similarity !== null && similarity < 0.45
        ? "conflict"
        : "consistent";
    return {
      sheetName: input.sheetName,
      name: input.name,
      status,
      matchScore: best ? Number(best.score.toFixed(3)) : null,
      noteSimilarity: similarity === null ? null : Number(similarity.toFixed(3)),
      profile: profile ? {
        intensity: profile.intensity,
        top_notes: normalizeNotes(profile.top_notes),
        middle_notes: normalizeNotes(profile.middle_notes),
        base_notes: normalizeNotes(profile.base_notes),
      } : null,
      reference: best ? {
        name: best.row.Name || best.row.name,
        brand: best.row.Brand || best.row.brand,
        top_notes: best.row.Top_Notes || best.row.top_notes,
        middle_notes: best.row.Middle_Notes || best.row.middle_notes,
        base_notes: best.row.Base_Notes || best.row.base_notes,
        url: best.row.URL || best.row.url || null,
      } : null,
    };
  });
  const summary = audited.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  fs.writeFileSync(outputPath, JSON.stringify({ sourceUrl, summary, audited }, null, 2));
  console.log(JSON.stringify({
    sourceUrl,
    datasetRows: referenceRows.length,
    summary,
    sampleConflicts: audited.filter((item) => item.status === "conflict").slice(0, 15).map((item) => ({
      name: item.name,
      matchScore: item.matchScore,
      noteSimilarity: item.noteSimilarity,
      reference: item.reference?.name,
    })),
    sampleUnmatched: audited.filter((item) => item.status === "unmatched").slice(0, 25).map((item) => item.name),
  }, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
