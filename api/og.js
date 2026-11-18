/**
 * Vercel Serverless Function: /api/og?id=PRODUCT_ID
 *
 * Link-preview bots (WhatsApp, Telegram, Facebook, X/Twitter, LinkedIn, Discord, Slack, iMessage...)
 * do not execute JavaScript. When a user shares a link in any chat platform, vercel.json routes
 * the bot request here. This function returns a fast, server-rendered HTML response with full Open Graph
 * and Twitter Card metadata, embedding the product's live image, title, price, and summary so the chat
 * platform displays a beautiful, rich image preview card.
 */

const SITE = "https://yearnit.in";
const FALLBACK_IMAGE = `${SITE}/og-image.jpg`;

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  "https://zxwfwtagcqwwevnuqber.supabase.co";

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_SECRET_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_KEY ||
  "sb_publishable_Cee7KZOIemSQnwoJh6tW4A_jVB7X0PE";

// Curated products catalog cache for zero-latency, 100% reliable instant bot preview responses
const CURATED_CATALOG = {
  "B09N3ZNHTY": {
    name: "boAt Airdopes 141 True Wireless Earbuds with 42H Playtime",
    price: "1,099",
    image: "https://m.media-amazon.com/images/I/51HBom8xz7L._SL1100_.jpg",
    summary: "Massive 42-hour combined battery backup, ASAP charge (5 min = 75 min), 8mm dynamic drivers, and ENx quad mics."
  },
  "B0CHX1W1XY": {
    name: "Apple iPhone 15 (128 GB) - Dynamic Island & 48MP Camera",
    price: "65,999",
    image: "https://m.media-amazon.com/images/I/71657TiFeHL._SL1500_.jpg",
    summary: "Dynamic Island interactive notification pill, 48MP main sensor with 2x telephoto, A16 Bionic, and universal USB-C."
  },
  "B07P8P2V34": {
    name: "Borosil Hydra Coffeemate 300 ml Stainless Steel Insulated Flask",
    price: "799",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
    summary: "Double-walled vacuum insulated food-grade 304 stainless steel travel flask. Keeps beverages hot for 8 hours or cold for 14 hours."
  },
  "B09V7M6S22": {
    name: "The 5 Types of Wealth: Transformative Guide to True Freedom",
    price: "499",
    image: "https://m.media-amazon.com/images/I/71sBtM3Yi5L._SL1500_.jpg",
    summary: "A practical framework transforming personal finance, time allocation, physical wellness, and relational wealth."
  },
  "B09G9FPHP6": {
    name: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
    price: "28,990",
    image: "https://m.media-amazon.com/images/I/61+btxzpfDL._SL1500_.jpg",
    summary: "Industry-leading noise cancellation with two processors and 8 microphones. Up to 30-hour battery life and ultra-comfortable design."
  },
  "B0C7771Z11": {
    name: "OnePlus Nord CE 3 Lite 5G (8GB RAM, 128GB Storage)",
    price: "17,499",
    image: "https://m.media-amazon.com/images/I/61QRgOgBx0L._SL1500_.jpg",
    summary: "108 MP high-resolution camera, 67W SUPERVOOC fast endurance charging, and smooth 120Hz 6.72-inch FHD+ display."
  },
  "B0C9J7SML8": {
    name: "Lenovo IdeaPad Slim 3 12th Gen Intel Core i5 Laptop (16GB/512GB)",
    price: "46,990",
    image: "https://m.media-amazon.com/images/I/61q6x-ll5FL._SL1000_.jpg",
    summary: "12th Gen Intel Core i5-12450H performance processor, 16GB RAM, 512GB NVMe SSD, and 15.6-inch FHD anti-glare display."
  },
  "B09B8WHR9V": {
    name: "Boult Audio Z40 True Wireless Earbuds with 60H Playtime",
    price: "999",
    image: "https://m.media-amazon.com/images/I/61y2VVWcGBL._SL1500_.jpg",
    summary: "60 hours total playback time, Zen Mode environmental noise cancellation, and lightning-fast low latency gaming audio."
  },
  "B0BHMR195H": {
    name: "Noise ColorFit Pulse Grand Smart Watch with 1.69'' HD Display",
    price: "1,299",
    image: "https://m.media-amazon.com/images/I/61epn29QG0L._SL1500_.jpg",
    summary: "1.69-inch vibrant LCD display, 60 sports modes, 24/7 heart rate and blood oxygen SpO2 monitoring with 7-day battery life."
  }
};

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

  let title = "Yearnit - Independent Product Reviews & Buyer Guides";
  let description =
    "Honest, comprehensive product evaluations with pros, cons, and buyer breakdowns across top electronics and everyday gear.";
  let image = FALLBACK_IMAGE;
  let isProduct = false;

  // 1. Check curated in-memory catalog first (instantaneous response)
  const upperId = id.toUpperCase();
  if (CURATED_CATALOG[upperId]) {
    const item = CURATED_CATALOG[upperId];
    title = `${item.name}${item.price ? ` - ₹${item.price}` : ""} | Yearnit`;
    description = item.summary || `Price history, review and buyer breakdown for ${item.name}.`;
    image = absolute(item.image);
    isProduct = true;
  }

  // 2. Query Supabase for dynamic or custom uploaded products
  if (!isProduct && id) {
    try {
      const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
      for (const filter of [`eq.${id}`, `ilike.${id}`]) {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/products?select=*&id=${encodeURIComponent(filter)}&limit=1`,
          { headers }
        );
        if (!r.ok) continue;
        const rows = await r.json();
        const p = Array.isArray(rows) ? rows[0] : null;
        if (p && p.name) {
          title = `${p.name}${p.price ? ` - ₹${p.price}` : ""} | Yearnit`;
          description =
            p.summary ||
            p.shortDetail ||
            `Price history, review and verified buyer guide for ${p.name}. Find the best deals on Yearnit.`;
          image = absolute(p.image || p.image1);
          isProduct = true;
          break;
        }
      }
    } catch (err) {
      console.warn("og: Supabase product lookup failed", err);
    }
  }

  const url = id ? `${SITE}/product/${encodeURIComponent(id)}` : SITE;
  const imageType = image.endsWith(".png") ? "image/png" : "image/jpeg";
  const imageWidth = isProduct ? "1024" : "1200";
  const imageHeight = isProduct ? "1024" : "630";

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(`<!doctype html>
<html lang="en" prefix="og: http://ogp.me/ns#">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}" />
<link rel="canonical" href="${esc(url)}" />

<!-- Open Graph / Chat Platform Link Preview Metadata (WhatsApp, Telegram, Facebook, LinkedIn, Discord, Slack) -->
<meta property="og:site_name" content="Yearnit" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(description)}" />
<meta property="og:url" content="${esc(url)}" />
<meta property="og:image" content="${esc(image)}" />
<meta property="og:image:secure_url" content="${esc(image)}" />
<meta property="og:image:type" content="${imageType}" />
<meta property="og:image:width" content="${imageWidth}" />
<meta property="og:image:height" content="${imageHeight}" />
<meta property="og:image:alt" content="${esc(title)}" />
<meta property="og:locale" content="en_IN" />

<!-- Twitter Card Metadata (Forces large rich preview image across chat platforms) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@yearnit" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(description)}" />
<meta name="twitter:image" content="${esc(image)}" />
<meta name="twitter:image:alt" content="${esc(title)}" />

<!-- Automatic redirect for human visitors who hit this raw endpoint directly -->
<meta http-equiv="refresh" content="0; url=${esc(url)}" />

<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1459486569390454');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1459486569390454&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
</head>
<body style="font-family: system-ui, -apple-system, sans-serif; background-color: #040D35; color: #FFFFFF; padding: 2rem; text-align: center;">
<h1>${esc(title)}</h1>
<p style="color: #94A3B8; max-width: 600px; margin: 0 auto 1.5rem;">${esc(description)}</p>
<img src="${esc(image)}" alt="${esc(title)}" style="max-width: 400px; max-height: 400px; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.5); margin-bottom: 1.5rem;" />
<p><a href="${esc(url)}" style="color: #38BDF8; text-decoration: underline; font-weight: 600;">View Full Review & Deals on Yearnit &rarr;</a></p>
<script>window.location.replace(${JSON.stringify(url)});</script>
</body>
</html>`);
}
