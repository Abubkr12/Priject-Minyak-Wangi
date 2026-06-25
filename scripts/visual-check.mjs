import { mkdir } from "node:fs/promises";
import path from "node:path";
import playwright from "playwright";

const { chromium } = playwright;

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outDir = path.join(process.cwd(), "artifacts", "screenshots");

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge",
  headless: true
});

async function openPage(page, route) {
  await page.goto(`${baseUrl}${route}`, {
    waitUntil: "domcontentloaded",
    timeout: 20_000
  });
  await page.waitForTimeout(900);
}

const desktop = await browser.newPage({
  viewport: { width: 1440, height: 1100 },
  deviceScaleFactor: 1
});
await openPage(desktop, "/");
await desktop.screenshot({
  path: path.join(outDir, "customer-desktop-latest.png"),
  fullPage: true
});

const mobile = await browser.newPage({
  viewport: { width: 390, height: 1200 },
  deviceScaleFactor: 1
});
await openPage(mobile, "/");
const mobileMetrics = await mobile.evaluate(() => ({
  innerWidth: window.innerWidth,
  docWidth: document.documentElement.scrollWidth,
  bodyWidth: document.body.scrollWidth,
  heroWidth: document.querySelector(".commerce-hero")?.getBoundingClientRect().width ?? 0,
  catalogWidth: document.querySelector(".catalog-panel")?.getBoundingClientRect().width ?? 0
}));
await mobile.screenshot({
  path: path.join(outDir, "customer-mobile-latest.png"),
  fullPage: true
});

const admin = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1
});
await openPage(admin, "/admin");
await admin.screenshot({
  path: path.join(outDir, "admin-desktop-latest.png"),
  fullPage: true
});

console.log(JSON.stringify({ outDir, mobileMetrics }, null, 2));

await browser.close();
