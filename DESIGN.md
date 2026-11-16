# DESIGN.md — Yearnit Design System

Source: homepage screenshot of **Yearnit**, an independent product-review and curated buyer-guide site (electronics, appliances, lifestyle; affiliate-supported).
All values are visual estimates from the screenshot. Treat them as tokens to tune, not as measured specs.

## 1. Design Intent

- **Mood:** calm, editorial, trustworthy, lab-tested. It feels like a quiet magazine, not a loud deals site.
- **Personality:** muted sage-green neutrals, generous whitespace, soft rounded surfaces, refined serif headlines.
- **Color is used sparingly.** The page is mostly desaturated sage and off-white. Saturated color appears only in product-card pastels, tiny status badges, and the primary button.
- **Voice in UI copy:** factual and restrained ("Lab-tested", "Independent evaluation", "Benchmarked for durability"). No hype, no exclamation marks.

## 2. Color Tokens

```css
:root {
  /* Surfaces */
  --bg-page:        #FAFBF8;  /* near-white, faint green tint */
  --bg-section-alt: #F1F4EF;  /* e.g. "Benefits" band */
  --surface-card:   #FFFFFF;
  --surface-muted:  #E6EAE5;  /* spotlight/image panels */
  --surface-sage:   #B5BEB5;  /* hero + category tiles */
  --surface-sage-deep: #A3AEA3; /* tile hover / image placeholders */
  --surface-mint:   #D7EBDF;  /* newsletter panel */

  /* Brand / actions */
  --brand-700: #4F6F5D;       /* primary button, dark feature card */
  --brand-600: #5E7F6C;       /* primary hover/default variant */
  --brand-100: #DCE8E0;       /* tinted chips */

  /* Text */
  --text-strong: #1E2A24;     /* headings */
  --text-body:   #3F4A44;
  --text-muted:  #7B857F;     /* subtitles, captions, meta */
  --text-on-brand: #FFFFFF;

  /* Borders */
  --border-subtle: #E3E8E2;
  --border-strong: #CBD3CB;

  /* Product-card pastels (category color coding) */
  --pastel-mint:     #BFE6D3;  /* Care */
  --pastel-blue:     #D3E3F4;  /* Organizer */
  --pastel-lavender: #DDD5F0;  /* Apparel */
  --pastel-peach:    #FADFC8;  /* Footwear */

  /* Status badges */
  --badge-hot-bg:    #FDE4E0; --badge-hot-fg:    #C2412D;
  --badge-deal-bg:   #D9F2E3; --badge-deal-fg:   #2F7D52;  /* -40% */
  --badge-trend-bg:  #E8DEF8; --badge-trend-fg:  #6B4FB3;
  --badge-new-bg:    #D5F0F0; --badge-new-fg:    #1F7A7A;
  --badge-budget-bg: #FDE9D2; --badge-budget-fg: #B8661A;

  /* Rating */
  --star: #E0A83A;
}
```

Rules:
- Page background is always `--bg-page`. Alternate sections with `--bg-section-alt` for rhythm.
- Placeholder/image areas use a flat sage gray (`--surface-sage` or `--surface-muted`) with centered serif or small sans label.
- Never use pure black. Darkest text is `--text-strong`.
- Pastels belong to product cards only. Do not use them as section backgrounds.

## 3. Typography

| Role | Family | Style |
|---|---|---|
| Display / headings | Elegant high-contrast serif (Playfair Display, Cormorant Garamond, or Fraunces) | Regular weight (400–500) |
| Body / UI | Clean geometric sans (Inter or DM Sans) | 400 / 500 / 600 |
| Eyebrows / micro-labels | Same sans | Uppercase, tracking +0.08em, 10–11px |

**Signature move: serif headline with an italic accent line.** The hero H1 is two lines: the first upright, the second *italic* and uppercase (e.g. "Top-Rated Electronics" / *MOBILE, TV & APPLIANCES*). Use this on hero titles and key feature headings only.

Scale (desktop):

| Token | Size / line-height | Use |
|---|---|---|
| `display` | 56–64 / 1.05 | Hero H1 |
| `h2` | 36–40 / 1.15 | Section titles (centered) |
| `h3` | 28–32 / 1.2 | Feature-card titles, newsletter title |
| `h4` | 18–20 / 1.3 | Product titles (serif, medium) |
| `body` | 15–16 / 1.6 | Paragraphs |
| `small` | 13–14 / 1.5 | Subtitles, descriptions |
| `micro` | 10–11 / 1.4 | Eyebrows, badges, meta |

Section titles are **centered serif**, followed by a one-line muted sans subtitle (max ~60ch, centered).

## 4. Spacing, Layout, Grid

- **Container:** max-width ~1200px, centered, side padding 24px (mobile) to 32px (desktop).
- **Section vertical rhythm:** 80–96px between major sections. Title-to-content gap ~40px; title-to-subtitle ~8–12px.
- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96.
- **Gaps in grids:** 16–24px.
- **Corner radii:**
  - Hero, large feature panels, newsletter: **24–28px**
  - Cards and tiles: **16–20px**
  - Inputs, small buttons: **8–10px**
  - Pills and badges: **9999px**
- **Shadows:** nearly none. Use flat surfaces with subtle 1px borders. If a shadow is needed: `0 1px 2px rgba(30,42,36,.06)`.

## 5. Page Structure (top to bottom)

1. **Navbar:** logo (small outlined square icon + serif caps wordmark "YEARNIT"), centered text links (Home active with underline, Guides, Electronics, Audio & Wearables, Home & Kitchen, Fashion, Gadgets, Reviews), right-aligned icon buttons (search, bookmark with count badge, profile). Height ~64px, white/transparent, no heavy border.
2. **Hero banner:** full-width rounded 28px sage panel inset from the page edge. Contains: small pill eyebrow ("● Independent curation & lab audits"), serif display H1 with italic second line, short paragraph (max ~50ch), two buttons (solid green "Shop the Latest" + outlined white "Certified & Warranty Protected"), three-stat row (e.g. "2,400+ Hrs / 100% / 0 Paid") with tiny labels, circular prev/next arrows at left/right edges, carousel dots at bottom center.
3. **Explore by Category:** two-column layout. Left: slim sidebar with search input and vertical category list, each row with a right-aligned mini badge (HOT, -40%, TREND, NEW, BUDGET), plus a small green "All Categories →" button. Right: 2-column mosaic of flat sage tiles (serif title centered, tiny muted caption), first tile marked "Flagship lab tested" with a white pill CTA.
4. **Curated Buyer Guides:** centered title + subtitle (affiliate-disclosure line). Row of **4 pastel product cards**, then a compact row of 4 mini product list items below (thumbnail chip, name, price). Carousel arrows at right; centered outlined "Explore all items" button.
5. **Editorial Spotlight:** two-column. Left: large rounded muted image panel with centered icon + caption, product title (serif), stars, price with struck-through original and green "% OFF" pill, solid green CTA ("Check Amazon Pricing ↗"). Right: small uppercase "Editorial verdict" label, paragraph, and a bordered list of 3 compact product rows (tiny category chip, name, stars, price).
6. **Research feature row:** 4 cards of mixed width: one **dark sage-green feature card** (white serif title, light body text, outlined link + circular arrows), one light gray card with white pill button, and two sage cards with serif titles and tiny muted captions.
7. **Benefits:** full-width tinted band (`--bg-section-alt`). Centered serif title, then **4 columns**, each with a small circular icon (line icon, tinted circle), bold serif/sans subhead, and 2–3 lines of muted text.
8. **Testimonials:** centered title/subtitle. Large quote layout: rounded gray avatar square on left with a pastel quote glyph, quote text (serif or large sans) right, name/role below in small muted text. Thin horizontal divider with "Read all testimonials →" link right-aligned.
9. **Newsletter:** one rounded 28px panel split 50/50. Left: sage gray with envelope icon and "Every Thursday" caption. Right: mint (`--surface-mint`) with serif title ("Yearnit Weekly Product Digest"), body text, email input (white, 10px radius) and solid green "Subscribe" button, tiny fine-print line.
10. **Footer:** white. Left: logo, short blurb, social icon circles, small address block. Right: four link columns (Popular Guides, Buyer Resources, Company, Legal & Trust) with bold small headings and muted links. Below: small-print affiliate disclosure paragraph, divider, copyright row.

## 6. Components

### Buttons
| Variant | Style |
|---|---|
| Primary | bg `--brand-700`, text white, radius 10px, padding 10×20, 13–14px/500, optional trailing arrow/icon. Hover: `--brand-600`. |
| Secondary | white bg, 1px `--border-strong`, text `--text-strong`, same radius; may include a leading small icon. |
| Ghost/pill on dark | white bg, dark text, radius pill (used on sage tiles). |
| Icon button | 36–40px circle, white or translucent, centered chevron (carousel). |

### Cards
- **Product card (pastel):** radius 20px, background one of the four pastels, padding 16–20px. Top row: tiny uppercase category label (left) and white "Prime" pill (right). Center: product icon/illustration on a transparent area. Below: serif product title (2 lines max, ellipsis), star rating with count in muted text, then price (bold sans) and a small "View Deal →" link aligned right.
- **Mini list item:** white, 1px border, radius 12px, small category chip + name + price in a row.
- **Tile (category/feature):** radius 20px, flat sage fill, centered content, no border.
- **Feature card (dark):** `--brand-700` fill, white text, radius 20px.

### Pills, Badges, Chips
- Eyebrow pill: radius pill, white or translucent bg, 11px text, 6px leading dot in green.
- Status badge: radius pill, padding 2×8, 10px uppercase semibold, colors from badge tokens.
- Discount pill: `--badge-deal-bg` / `--badge-deal-fg`.

### Inputs
White bg, 1px `--border-subtle`, radius 10px, height 40–44px, placeholder in `--text-muted`, leading search icon where applicable. Focus ring: 2px `--brand-600` at 30% opacity.

### Ratings
Five small stars in `--star`, followed by numeric rating and `(count reviews)` in muted micro text.

### Carousel controls
Circular prev/next buttons and 3–5 dot pagination (active dot elongated, dark sage; inactive dots light).

### Dividers
1px `--border-subtle`, full container width. Section ends sometimes use a divider with a right-aligned text link.

## 7. Iconography & Imagery

- Line icons, ~1.5px stroke, rounded caps (Lucide-style). Size 16–20px in UI, 24px in benefit circles.
- Product imagery: simple, centered, on pastel or neutral backgrounds. Where a photo is missing, show a flat sage placeholder with an icon and short caption, never a stock gradient.
- No heavy photography overlays or gradients. Backgrounds are flat color.

## 8. Motion

- Subtle only: 150–200ms ease-out on hover (button darken, card lift of 2px, link underline).
- Carousel transitions: 300–400ms fade or slide.
- Respect `prefers-reduced-motion`.

## 9. Responsive Behavior

- **≥1024px:** layouts as described above.
- **768–1023px:** category sidebar moves above the tile grid; product cards go to 2 columns; benefits 2×2.
- **<768px:** single column; navbar collapses to logo + icons + menu button; hero H1 scales to ~36px; stat row wraps; newsletter panel stacks (image/icon panel on top); footer columns stack in 2×2 then 1 column.
- Hero and large panels keep their rounded corners at all sizes (reduce to 20px on mobile).

## 10. Do / Don't

**Do**
- Pair a serif display face with a quiet sans body.
- Use italic uppercase serif for one accent line in hero-style headings.
- Keep surfaces flat, rounded, and low-contrast.
- Reserve pastels for product cards and saturated color for tiny badges.
- Leave generous whitespace between sections.

**Don't**
- Don't add drop shadows, gradients, or glassmorphism.
- Don't use bright primary colors for backgrounds.
- Don't use bold sans for section titles (serif only).
- Don't crowd more than 4 columns on desktop.
- Don't write promotional, all-caps, or urgency-driven copy.

## 11. Quick Tailwind Mapping

```js
// tailwind.config.js (extend)
colors: {
  page: '#FAFBF8', alt: '#F1F4EF', muted: '#E6EAE5',
  sage: { DEFAULT: '#B5BEB5', deep: '#A3AEA3' },
  mint: '#D7EBDF',
  brand: { 600: '#5E7F6C', 700: '#4F6F5D', 100: '#DCE8E0' },
  ink: { strong: '#1E2A24', body: '#3F4A44', muted: '#7B857F' },
  line: { subtle: '#E3E8E2', strong: '#CBD3CB' },
  pastel: { mint: '#BFE6D3', blue: '#D3E3F4', lavender: '#DDD5F0', peach: '#FADFC8' },
},
fontFamily: {
  serif: ['"Playfair Display"', 'Georgia', 'serif'],
  sans: ['Inter', 'system-ui', 'sans-serif'],
},
borderRadius: { card: '20px', panel: '28px', input: '10px' },
```

## 12. Agent Instructions

When generating any new page or component for this project:
1. Read this file first and use only the tokens above. Do not invent new colors or fonts.
2. Start every page with the navbar and end with the footer described in section 5.
3. Center all section titles in serif with a muted one-line subtitle.
4. Build card grids with the radii, paddings, and pastel mapping in section 6.
5. Keep sections separated by 80–96px and alternate `--bg-page` and `--bg-section-alt` when a section needs visual separation.
6. If a needed pattern is not covered here, choose the closest existing component and keep the flat, soft, sage-toned style.
