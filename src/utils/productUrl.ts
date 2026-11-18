export interface ProductUrlInput {
  id: string;
  name?: string;
}

/**
 * Convert a product title into a clean, lowercase, hyphenated SEO slug.
 * Capped on a word boundary so URLs remain readable and concise.
 */
export function slugifyProductName(name?: string, maxLength: number = 70): string {
  if (!name) return "";
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’"“”`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (normalized.length <= maxLength) return normalized;

  const sliced = normalized.slice(0, maxLength);
  const lastHyphen = sliced.lastIndexOf("-");
  const trimmed = lastHyphen > 20 ? sliced.slice(0, lastHyphen) : sliced;
  return trimmed.replace(/-+$/g, "");
}

/**
 * Build the canonical slug segment for a product: `<product-name-slug>-<product-id>`
 * Falls back to `<product-id>` if the product has no slugifiable name.
 */
export function buildProductSlug(product: ProductUrlInput): string {
  const cleanId = String(product.id || "").trim();
  if (!cleanId) return "";

  const nameSlug = slugifyProductName(product.name);
  if (!nameSlug) return cleanId;

  const lowerSlug = nameSlug.toLowerCase();
  const lowerId = cleanId.toLowerCase();

  if (lowerSlug === lowerId) {
    return cleanId;
  }

  if (lowerSlug.endsWith(`-${lowerId}`)) {
    const prefix = nameSlug.slice(0, nameSlug.length - cleanId.length - 1).replace(/-+$/g, "");
    return prefix ? `${prefix}-${cleanId}` : cleanId;
  }

  return `${nameSlug}-${cleanId}`;
}

/**
 * Return the relative route path for a product detail page: `/product/<name-slug>-<id>`
 */
export function getProductPath(product: ProductUrlInput): string {
  const slug = buildProductSlug(product);
  return `/product/${encodeURIComponent(slug)}`;
}

/**
 * Return the absolute canonical URL for a product detail page.
 */
export function getProductCanonicalUrl(
  product: ProductUrlInput,
  origin: string = "https://yearnit.in"
): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}${getProductPath(product)}`;
}

/**
 * Extract ordered candidate product IDs from a URL param that may be either:
 * - a full SEO slug (`boat-airdopes-141-true-wireless-earbuds-B09N3ZNHTY`)
 * - a slug with a hyphenated ID (`wireless-mouse-PROD-M8K2X1` or UUID)
 * - a legacy raw ID (`B09N3ZNHTY` or `PROD-M8K2X1`)
 */
export function extractProductIdCandidates(slugOrId: string): string[] {
  let clean = String(slugOrId || "").trim();
  try {
    clean = decodeURIComponent(clean).trim();
  } catch {
    // Preserve raw value if malformed URI sequence
  }
  if (!clean) return [];

  const extracted: string[] = [];

  // 1. UUID at the end
  const uuidMatch = clean.match(
    /(?:^|-)([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
  );
  if (uuidMatch) extracted.push(uuidMatch[1]);

  // 2. Prefixed custom IDs such as PROD-XXXXXX, CUSTOM-XXXXXX, SKU-XXXXXX, ITEM-XXXXXX
  const prefixedMatch = clean.match(/(?:^|-)((?:PROD|CUSTOM|ITEM|SKU)-[A-Z0-9_-]+)$/i);
  if (prefixedMatch) extracted.push(prefixedMatch[1]);

  // 3. Standard 10-character Amazon ASIN at the end (contains at least one digit)
  const asinMatch = clean.match(/(?:^|-)([A-Z0-9]{10})$/i);
  if (asinMatch && /\d/.test(asinMatch[1])) {
    extracted.push(asinMatch[1]);
  }

  // 4. Last hyphen-separated token (covers arbitrary non-hyphenated IDs)
  const lastHyphen = clean.lastIndexOf("-");
  if (lastHyphen > 0 && lastHyphen < clean.length - 1) {
    extracted.push(clean.slice(lastHyphen + 1));
  }

  // If the param looks like a multi-word slug ending in an ID, prioritize extracted IDs
  // so Supabase single-row lookups hit on the first query.
  const looksLikeSlug = clean.includes("-") && /[a-z]{3,}/.test(clean) && extracted.length > 0;
  const ordered = looksLikeSlug ? [...extracted, clean] : [clean, ...extracted];

  return Array.from(new Set(ordered.filter(Boolean)));
}
