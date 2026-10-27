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
const DEFAULT_IMAGE = "https://yearnit.in/og-image.jpg";
const SITE_NAME = "Yearnit";
const DOMAIN = "https://yearnit.in";

function setMetaTag(attrName: "name" | "property", attrVal: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attrName}="${attrVal}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attrName, attrVal);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
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
  image = DEFAULT_IMAGE,
  url = DOMAIN,
  type = "website",
  keywords,
  jsonLd,
}: SEOProps) {
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
  setMetaTag("property", "og:image", image);
  setMetaTag("property", "og:image:alt", title);
  setMetaTag("property", "og:locale", "en_IN");

  // 4. Twitter Card
  setMetaTag("name", "twitter:card", "summary_large_image");
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", image);
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
