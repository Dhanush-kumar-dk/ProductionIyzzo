/**
 * Vercel Serverless Function: /api/og?id=PRODUCT_ID
 *
 * Link-preview bots (WhatsApp, Telegram, Facebook, X, LinkedIn, Discord...) don't run JavaScript,
 * so vercel.json routes their requests for /product/:id here. This returns an HTML
 * page whose Open Graph & Twitter meta tags carry the product's live name, price, and image.
 * Normal visitors never hit this; they get the regular React application.
 */

const SITE = "https://yearnit.in";
const FALLBACK_IMAGE = `${SITE}/logo.png`;

const esc = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const absolute = (src) => {
  if (!src) return FALLBACK_IMAGE;
  const s = String(src).trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `${SITE}${s.startsWith("/") ? "" : "/"}${s}`;
};

export default async function handler(req, res) {
  const rawId = Array.isArray(req.query?.id) ? req.query.id[0] : req.query?.id;
  const id = String(rawId || "").trim();

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_KEY;

  let title = "Yearnit - Independent Product Reviews & Buyer Guides";
  let description =
    "Honest, comprehensive product evaluations with pros, cons, and buyer breakdowns across top electronics and everyday gear.";
  let image = FALLBACK_IMAGE;
  let isProduct = false;

  if (id && supabaseUrl && supabaseKey) {
    try {
      const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
      // exact match first, then case-insensitive
      for (const filter of [`eq.${id}`, `ilike.${id}`]) {
        const r = await fetch(
          `${supabaseUrl}/rest/v1/products?select=*&id=${encodeURIComponent(filter)}&limit=1`,
          { headers }
        );
        if (!r.ok) continue;
        const rows = await r.json();
        const p = Array.isArray(rows) ? rows[0] : null;
        if (p && p.name) {
          title = `${p.name}${p.price ? ` - ₹${p.price}` : ""} | Yearnit`;
          description =
            p.summary || `Price history, review and buyer guide for ${p.name}. Find the best time to buy.`;
          image = absolute(p.image);
          isProduct = true;
          break;
        }
      }
    } catch (err) {
      console.warn("og: product lookup failed", err);
    }
  }

  const url = `${SITE}/product/${encodeURIComponent(id)}`;
  const card = isProduct ? "summary_large_image" : "summary";

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(url)}" />
<meta property="og:site_name" content="Yearnit" />
<meta property="og:type" content="${isProduct ? "product" : "website"}" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:secure_url" content="${esc(image)}" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:locale" content="en_IN" />
<meta name="twitter:card" content="${card}" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
</head>
<body>
<h1>${esc(title)}</h1>
<p>${esc(description)}</p>
<p><a href="${esc(url)}">View on Yearnit</a></p>
</body>
</html>`);
}
