const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const SDIR = path.join(__dirname, "screenshots");

async function screenshot(page, name) {
  const fp = path.join(SDIR, name);
  await page.screenshot({ path: fp, fullPage: true });
  console.log("Screenshot: " + name);
}

async function doc(page, label) {
  console.log("\n=== " + label + " ===");
  console.log("Title: " + await page.title());
  console.log("URL: " + page.url());
  try {
    const t = await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map(x => ({tag: x.tagName, text: (x.textContent || "").trim().substring(0, 200)}));
      const v = (document.body.textContent || "").trim().substring(0, 3000);
      return {headings: h, visible: v};
    });
    console.log("Headings: " + JSON.stringify(t.headings, null, 2));
    console.log("Text: " + t.visible.substring(0, 1000));
  } catch(e) { console.log("Error: " + e.message); }
  const lp = await page.evaluate(() => !!(document.querySelector("input[type=email]") || document.querySelector("input[type=password]") || (document.body.textContent||"").toLowerCase().includes("log in") || (document.body.textContent||"").toLowerCase().includes("sign in")));
  if(lp) console.log("LOGIN PAGE DETECTED");
}

(async () => {
  if (!fs.existsSync(SDIR)) fs.mkdirSync(SDIR, { recursive: true });
  const b = await chromium.launch({ headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();

  // 1. Worker main page
  try {
    await p.goto("https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production", { waitUntil: "load", timeout: 45000 });
    await p.waitForTimeout(3000);
    await doc(p, "1. Worker Main Page");
    await screenshot(p, "01-worker-main.png");

    await p.goto("https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production/settings", { waitUntil: "load", timeout: 45000 });
    await p.waitForTimeout(3000);
    await doc(p, "2. Settings");
    await screenshot(p, "02-worker-settings.png");

    await p.goto("https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production/triggers", { waitUntil: "load", timeout: 45000 });
    await p.waitForTimeout(3000);
    await doc(p, "3. Triggers");
    await screenshot(p, "03-worker-triggers.png");

    await p.goto("https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production/settings/variables", { waitUntil: "load", timeout: 45000 });
    await p.waitForTimeout(3000);
    await doc(p, "4. Variables");
    await screenshot(p, "04-worker-variables.png");

    await p.goto("https://dash.cloudflare.com/0b9efca009317f8624843e4fa61d17ed/workers/services/view/siso-api/production/d1", { waitUntil: "load", timeout: 45000 });
    await p.waitForTimeout(3000);
    await doc(p, "5. D1 Databases");
    await screenshot(p, "05-d1-databases.png");
  } catch(e) { console.log("CF Error: " + e.message); }

  // 6. Health endpoint
  try {
    await p.goto("https://siso-api.dr-juliancucalon.workers.dev/health", { waitUntil: "load", timeout: 45000 });
    await p.waitForTimeout(3000);
    await doc(p, "6. Health Endpoint");
    await screenshot(p, "06-health-endpoint.png");
    console.log("Health Response: " + await p.evaluate(() => document.body.innerText));
  } catch(e) { console.log("Health Error: " + e.message); }

  // 7. Store endpoint
  try {
    await p.goto("https://siso-api.dr-juliancucalon.workers.dev/store/siso_test_key", { waitUntil: "load", timeout: 45000 });
    await p.waitForTimeout(3000);
    await doc(p, "7. Store Endpoint");
    await screenshot(p, "07-store-endpoint.png");
    console.log("Store Response: " + await p.evaluate(() => document.body.innerText));
  } catch(e) { console.log("Store Error: " + e.message); }

  console.log("\nDONE! Screenshots in " + SDIR);
  await b.close();
})();
