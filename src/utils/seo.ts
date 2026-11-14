/**
 * SEO & Structured Data Management Utility for Yearnit
 * Dynamically manages document title, Open Graph, Twitter cards, and Schema.org JSON-LD
 */

export interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  keywords?: string[];
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_TITLE = "Yearnit - Independent Product Reviews & Buyer Guides";
const DEFAULT_DESCRIPTION =
  "Yearnit provides independent product reviews, in-depth buyer guides, and curated recommendations across electronics, audio, home essentials, and lifestyle.";
const SITE_NAME = "Yearnit";
const DOMAIN = "https://yearnit.in";

/**
 * Fallback preview image (used when a page has no image of its own).
 * To use a wider branded banner, upload e.g. /public/og-default.jpg (1200x630)
 * and change this one line to `${DOMAIN}/og-default.jpg`.
 */
export const DEFAULT_OG_IMAGE = `${DOMAIN}/logo.png`;

/** Turn "/img.jpg" or "//cdn..." into an absolute https URL; leave absolute URLs alone. */
function toAbsoluteUrl(src: string | undefined): string {
  if (!src || !src.trim()) return DEFAULT_OG_IMAGE;
  const s = src.trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `${DOMAIN}${s.startsWith("/") ? "" : "/"}${s}`;
}

function setMetaTag(attrName: "name" | "property", attrVal: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrVal}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrVal);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function removeMetaTag(attrName: "name" | "property", attrVal: string) {
  document.querySelector(`meta[${attrName}="${attrVal}"]`)?.remove();
}

function setCanonical(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

const SCRIPT_ID = "yearnit-dynamic-jsonld";

export function updateSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image,
  url = DOMAIN,
  type = "website",
  keywords,
  jsonLd,
}: SEOProps) {
  const ogImage = toAbsoluteUrl(image);
  const isDefaultImage = ogImage === DEFAULT_OG_IMAGE;

  // 1. Document Title
  document.title = title.includes("Yearnit") ? title : `${title} | Yearnit`;

  // 2. Standard Meta
  setMetaTag("name", "description", description);
  if (keywords && keywords.length > 0) {
    setMetaTag("name", "keywords", keywords.join(", "));
  }
  setMetaTag("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  setCanonical(url);

  // 3. Open Graph
  setMetaTag("property", "og:site_name", SITE_NAME);
  setMetaTag("property", "og:type", type);
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:url", url);
  setMetaTag("property", "og:image", ogImage);
  setMetaTag("property", "og:image:secure_url", ogImage);
  setMetaTag("property", "og:image:alt", title);
  setMetaTag("property", "og:locale", "en_IN");
  // Dimensions/type belong to a specific file, so drop stale values from other pages
  removeMetaTag("property", "og:image:width");
  removeMetaTag("property", "og:image:height");
  removeMetaTag("property", "og:image:type");

  // 4. Twitter Card (square logo -> small card, product photos -> large card)
  setMetaTag("name", "twitter:card", isDefaultImage ? "summary" : "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", ogImage);
  setMetaTag("name", "twitter:image:alt", title);

  // 5. Dynamic JSON-LD injection
  const existingScript = document.getElementById(SCRIPT_ID);
  if (existingScript) {
    existingScript.remove();
  }

  if (jsonLd) {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
  }
}