// Pre-launch SEO audit. Crawls every URL in /sitemap.xml and checks what
// search engines see. Exits 1 if any check fails, so it can gate a launch.
//
// Usage:  npm run seo:audit -- https://www.yourstore.com
//         npm run seo:audit -- http://localhost:3000        (after npm run build && npm start)
// Checks: status 200, title present and ≤ 60 chars, description 70–160 chars,
// canonical matches the URL, no noindex on sitemap URLs, exactly one <h1>,
// JSON-LD parses, Product pages carry offers + shipping details, every <img>
// has alt, no duplicate titles/descriptions, every internal link resolves,
// sitemap images load.

const base = (process.argv[2] || "http://localhost:3000").replace(/\/+$/, "");
const get = async (url, init) => {
  for (let i = 0; ; i++) {
    try {
      return await fetch(url, init);
    } catch (e) {
      if (i === 2) throw e;
      await new Promise((r) => setTimeout(r, 800));
    }
  }
};

const sitemap = await (await get(`${base}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const images = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1]);
const unescape = (s) => s?.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');

const problems = [];
const flag = (path, msg) => problems.push(`${path}: ${msg}`);
const titles = new Map();
const descs = new Map();
const internal = new Set();
let ms = [];

for (const path of urls) {
  const t0 = Date.now();
  const r = await get(base + path, { headers: { accept: "text/html" } });
  ms.push(Date.now() - t0);
  const html = await r.text();
  const pick = (re) => unescape((html.match(re) || [])[1]);
  if (r.status !== 200) flag(path, `status ${r.status}`);
  const title = pick(/<title>([^<]*)<\/title>/);
  const desc = pick(/<meta name="description" content="([^"]*)"/);
  const canonical = pick(/<link rel="canonical" href="([^"]*)"/);
  if (!title) flag(path, "missing <title>");
  else if (title.length > 60) flag(path, `title ${title.length} chars (max 60)`);
  if (!desc) flag(path, "missing meta description");
  else if (desc.length > 160 || desc.length < 70) flag(path, `description ${desc.length} chars (want 70–160)`);
  if (!canonical || new URL(canonical).pathname.replace(/\/$/, "") !== path.replace(/\/$/, "")) flag(path, `canonical ${canonical ?? "missing"}`);
  if (/<meta name="robots" content="[^"]*noindex/.test(html)) flag(path, "noindex on a sitemap URL");
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) flag(path, `${h1} <h1> tags`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      for (const n of j["@graph"] || [j]) {
        if (n["@type"] === "Product") {
          if (!n.offers) flag(path, "Product without offers");
          else if (!n.offers.shippingDetails?.length) flag(path, "Product offer without shippingDetails");
          if (n.aggregateRating || n.review) flag(path, "rating/review markup present — only allowed from verified buyers");
        }
      }
    } catch {
      flag(path, "JSON-LD does not parse");
    }
  }
  const noAlt = [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\balt="/.test(m[0])).length;
  if (noAlt) flag(path, `${noAlt} <img> without alt`);
  if (title) titles.set(title, [...(titles.get(title) ?? []), path]);
  if (desc) descs.set(desc, [...(descs.get(desc) ?? []), path]);
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const href = m[1].split("?")[0];
    if (!/^\/(_next|api)\//.test(href)) internal.add(href);
  }
}

for (const [t, paths] of titles) if (paths.length > 1) problems.push(`duplicate title "${t}": ${paths.join(", ")}`);
for (const [, paths] of descs) if (paths.length > 1) problems.push(`duplicate description: ${paths.join(", ")}`);

for (const href of internal) {
  const r = await get(base + href, { headers: { accept: "text/html" }, redirect: "manual" });
  if (r.status >= 400) problems.push(`broken internal link ${href} (${r.status})`);
}
for (const u of images) {
  const r = await get(u, { method: "HEAD" });
  if (r.status !== 200) problems.push(`sitemap image ${u} (${r.status})`);
}

ms = ms.sort((a, b) => a - b);
console.log(`Audited ${urls.length} sitemap URLs, ${internal.size} internal links, ${images.length} sitemap images on ${base}`);
console.log(`Response time: median ${ms[Math.floor(ms.length / 2)]} ms, slowest ${ms.at(-1)} ms`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const p of problems) console.log(" - " + p);
  process.exit(1);
}
console.log("All checks passed.");
