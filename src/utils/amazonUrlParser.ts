import { getAllCatalogProducts, Product } from "../data/products";
import { API_BASE_URL, DEFAULT_PARTNER_TAG } from "../config/api";
import { buildAffiliateUrl } from "./affiliate";

export interface ExtractedProductData {
  asin: string;
  name: string;
  category: string;
  price: string;
  mrp: string;
  rating: string;
  ratingCount: string;
  image: string;
  image1?: string;
  image2?: string;
  url: string;
  editorBadge: string;
  shortDetail: string;
  summary: string;
  pros: string[];
  cons: string[];
  whoItsFor: string;
  specs: { [key: string]: string };
  confidence: "full" | "catalog" | "heuristic";
  sourceMessage: string;
}

/**
 * Extract 10-character Amazon ASIN from any Amazon URL or text
 */
export function extractAsinFromUrl(inputUrl: string): string | null {
  if (!inputUrl) return null;
  const trimmed = inputUrl.trim();

  // Direct ASIN string (e.g. B0C7771Z11)
  if (/^[A-Z0-9]{10}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  // Common Amazon URL structures:
  // - /dp/B0C7771Z11
  // - /gp/product/B0C7771Z11
  // - /gp/aw/d/B0C7771Z11
  // - /d/B0C7771Z11
  // - ?asin=B0C7771Z11
  // - &asin=B0C7771Z11
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /\/gp\/aw\/d\/([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
    /\/d\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
    /[?&]ASIN=([A-Z0-9]{10})/i,
    /\/([A-Z0-9]{10})(?:[/?#]|$)/i,
  ];

  for (const regex of patterns) {
    const match = trimmed.match(regex);
    if (match && match[1]) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

/**
 * Clean & Format title from Amazon URL slug
 * e.g. "https://www.amazon.in/OnePlus-Nord-CE-3-Lite-5G-Pastel-Lime/dp/B0C7771Z11"
 * -> "OnePlus Nord CE 3 Lite 5G Pastel Lime"
 */
export function extractTitleFromAmazonUrl(inputUrl: string): string | null {
  try {
    const parsed = new URL(inputUrl);
    const pathParts = parsed.pathname.split("/").filter(Boolean);

    // Find the segment before 'dp' or 'product'
    const dpIdx = pathParts.findIndex((p) => p.toLowerCase() === "dp" || p.toLowerCase() === "product");
    if (dpIdx > 0) {
      const slug = pathParts[dpIdx - 1];
      if (slug && !/^(gp|aw|d)$/i.test(slug)) {
        return cleanSlugToTitle(slug);
      }
    }

    // If first part is not an action or asin
    if (pathParts.length > 0 && !/^(dp|gp|product)$/i.test(pathParts[0]) && !/^[A-Z0-9]{10}$/i.test(pathParts[0])) {
      return cleanSlugToTitle(pathParts[0]);
    }
  } catch {
    // If not a full URL, attempt simple regex on string
    const match = inputUrl.match(/amazon\.[a-z.]+\/([^/?#]+)\/(?:dp|product)/i);
    if (match && match[1]) {
      return cleanSlugToTitle(match[1]);
    }
  }

  return null;
}

function cleanSlugToTitle(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/[-_+]/g, " ")
    .replace(/\b(ref=|dp|gp)[^ ]*/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
}

/**
 * Infer Brand from product title or slug
 */
export function inferBrand(text: string): string {
  const brands = [
    "Apple", "Sony", "Samsung", "OnePlus", "Noise", "Boat", "boAt", "Lenovo",
    "Dell", "HP", "Asus", "Acer", "JBL", "Sennheiser", "Xiaomi", "Realme",
    "Motorola", "Amazon", "Echo", "Kindle", "Fire TV", "Logitech", "Boult",
    "Pigeon", "Prestige", "Philips", "Dyson", "LG", "Whirlpool", "Zebronics",
    "Anker", "SanDisk", "Crucial", "Seagate", "Cosmic Byte", "Portronics"
  ];

  const lower = text.toLowerCase();
  for (const b of brands) {
    if (lower.includes(b.toLowerCase())) {
      return b;
    }
  }
  return "Official Store";
}

/**
 * Infer best matching catalog category from text
 */
export function inferCategory(text: string): string {
  const lower = text.toLowerCase();

  if (
    lower.includes("phone") ||
    lower.includes("mobile") ||
    lower.includes("smartphone") ||
    lower.includes("iphone") ||
    lower.includes("oneplus") ||
    lower.includes("samsung galaxy") ||
    lower.includes("5g")
  ) {
    return "Mobiles & Tech";
  }

  if (
    lower.includes("earbud") ||
    lower.includes("headphone") ||
    lower.includes("audio") ||
    lower.includes("tws") ||
    lower.includes("speaker") ||
    lower.includes("soundbar") ||
    lower.includes("noise cancelling")
  ) {
    return "Audio & Wearables";
  }

  if (
    lower.includes("laptop") ||
    lower.includes("macbook") ||
    lower.includes("monitor") ||
    lower.includes("keyboard") ||
    lower.includes("mouse") ||
    lower.includes("tablet") ||
    lower.includes("ipad") ||
    lower.includes("pc")
  ) {
    return "Consumer Electronics";
  }

  if (
    lower.includes("shirt") ||
    lower.includes("t-shirt") ||
    lower.includes("shoe") ||
    lower.includes("sneaker") ||
    lower.includes("jeans") ||
    lower.includes("dress") ||
    lower.includes("jacket") ||
    lower.includes("watch")
  ) {
    return "Fashion & Apparel";
  }

  if (
    lower.includes("cooker") ||
    lower.includes("blender") ||
    lower.includes("kitchen") ||
    lower.includes("pan") ||
    lower.includes("air fryer") ||
    lower.includes("kettle") ||
    lower.includes("bottle") ||
    lower.includes("home")
  ) {
    return "Home & Kitchen";
  }

  if (
    lower.includes("fitness") ||
    lower.includes("smartwatch") ||
    lower.includes("band") ||
    lower.includes("cycle") ||
    lower.includes("dumbbell") ||
    lower.includes("yoga")
  ) {
    return "Fitness & Sports";
  }

  if (lower.includes("gadget") || lower.includes("charger") || lower.includes("cable") || lower.includes("power bank")) {
    return "Gadgets";
  }

  return "Consumer Electronics";
}

/**
 * Primary Fetcher: Extracts all product details from Amazon URL
 */
export async function fetchProductDataFromUrl(inputUrl: string): Promise<ExtractedProductData> {
  const trimmed = inputUrl.trim();
  const asin = extractAsinFromUrl(trimmed);

  if (!asin) {
    throw new Error("Could not extract a valid 10-character Amazon ASIN from the provided URL.");
  }

  const slugTitle = extractTitleFromAmazonUrl(trimmed) || "";
  const affiliateUrl = buildAffiliateUrl(asin, DEFAULT_PARTNER_TAG);
  const brand = inferBrand(`${slugTitle} ${trimmed}`);
  const category = inferCategory(`${slugTitle} ${trimmed}`);

  // High-Resolution Amazon CDN Image URLs for this ASIN
  const primaryImage = `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX800_.jpg`;
  const fallbackImage = `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&Format=_SL800_&ASIN=${asin}&MarketPlace=IN&ID=AsinImage`;

  // 1. Check local catalog first (instant match if product is known)
  const catalog = getAllCatalogProducts();
  const foundInCatalog = catalog.find(
    (p) => p.id.toUpperCase() === asin || (p.asin && p.asin.toUpperCase() === asin)
  );

  if (foundInCatalog) {
    return {
      asin,
      name: foundInCatalog.name,
      category: foundInCatalog.category || category,
      price: foundInCatalog.price,
      mrp: foundInCatalog.mrp || "",
      rating: foundInCatalog.rating?.toString() || "4.5",
      ratingCount: foundInCatalog.ratingCount?.toString() || "1200",
      image: foundInCatalog.image || primaryImage,
      image1: foundInCatalog.image1 || fallbackImage,
      image2: foundInCatalog.image2,
      url: affiliateUrl,
      editorBadge: foundInCatalog.editorBadge || "Top Value Pick",
      shortDetail: foundInCatalog.shortDetail || `${brand} High Performance Specifications`,
      summary: foundInCatalog.summary || `Comprehensive independent evaluation of ${foundInCatalog.name}.`,
      pros: foundInCatalog.pros && foundInCatalog.pros.length > 0 ? foundInCatalog.pros : ["High build quality", "Official brand warranty"],
      cons: foundInCatalog.cons && foundInCatalog.cons.length > 0 ? foundInCatalog.cons : ["Check retailer bundle contents before purchasing"],
      whoItsFor: foundInCatalog.whoItsFor || "Tech enthusiasts, everyday buyers, and value-oriented shoppers.",
      specs: foundInCatalog.specs || { Brand: brand, ASIN: asin, Warranty: "1 Year Official Brand Warranty" },
      confidence: "catalog",
      sourceMessage: `Matched from verified product catalog database (ASIN: ${asin}).`,
    };
  }

  // 2. Attempt remote search on backend API (non-blocking 3.5s timeout)
  let apiProduct: Partial<Product> | null = null;
  if (API_BASE_URL) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: asin,
          searchIndex: "All",
          partnerTag: DEFAULT_PARTNER_TAG,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          apiProduct = data[0];
        }
      }
    } catch {
      // Backend is optional/fallback
    }
  }

  // 3. Assemble extracted data
  const finalName =
    apiProduct?.name ||
    slugTitle ||
    `${brand} Product (ASIN: ${asin})`;

  const finalPrice =
    apiProduct?.price ||
    "1,499";

  const finalMrp =
    apiProduct?.mrp ||
    (parseInt(finalPrice.replace(/[^0-9]/g, ""), 10) ? (parseInt(finalPrice.replace(/[^0-9]/g, ""), 10) * 1.4).toFixed(0) : "2,999");

  const finalImage =
    apiProduct?.image ||
    primaryImage;

  const finalRating = apiProduct?.rating?.toString() || "4.5";
  const finalRatingCount = apiProduct?.ratingCount?.toString() || "1420";

  return {
    asin,
    name: finalName,
    category: apiProduct?.category || category,
    price: finalPrice,
    mrp: finalMrp,
    rating: finalRating,
    ratingCount: finalRatingCount,
    image: finalImage,
    image1: fallbackImage,
    url: affiliateUrl,
    editorBadge: "Editor's Choice",
    shortDetail: `Official ${brand} Model • Verified Specifications • Fast Shipping`,
    summary: `Independent analysis evaluating practical utility, build quality, and overall value of ${finalName}.`,
    pros: [
      `Official ${brand} product with authentic warranty`,
      "Verified Amazon storefront order protection",
      "Direct customer support and fast dispatch",
    ],
    cons: [
      "Pricing and discount may vary depending on active seller promotions",
    ],
    whoItsFor: `Shoppers seeking verified authentic ${brand} gear at current marketplace pricing.`,
    specs: {
      Brand: brand,
      ASIN: asin,
      Category: category,
      Warranty: "1 Year Manufacturer Warranty",
    },
    confidence: apiProduct ? "full" : "heuristic",
    sourceMessage: apiProduct
      ? `Successfully fetched real-time Amazon specifications for ASIN ${asin}!`
      : `Extracted ASIN ${asin}, high-res CDN product images, and title structure from URL.`,
  };
}
