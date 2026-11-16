import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { StarIcon } from "@heroicons/react/20/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { CURATED_PRODUCTS, Product } from "../data/products";
import { buildAffiliateUrl } from "../utils/affiliate";

interface CuratedGuidesProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

interface PastelCardConfig {
  pastelBg: string;
  categoryLabel: string;
  badge: {
    text: string;
    bg: string;
    fg: string;
  };
}

const PASTEL_CONFIGS: PastelCardConfig[] = [
  {
    pastelBg: "#BFE6D3", // Pastel Mint
    categoryLabel: "CARE",
    badge: { text: "HOT", bg: "#FDE4E0", fg: "#C2412D" },
  },
  {
    pastelBg: "#D3E3F4", // Pastel Blue
    categoryLabel: "ORGANIZER",
    badge: { text: "-40%", bg: "#D9F2E3", fg: "#2F7D52" },
  },
  {
    pastelBg: "#DDD5F0", // Pastel Lavender
    categoryLabel: "APPAREL",
    badge: { text: "TREND", bg: "#E8DEF8", fg: "#6B4FB3" },
  },
  {
    pastelBg: "#FADFC8", // Pastel Peach
    categoryLabel: "FOOTWEAR",
    badge: { text: "NEW", bg: "#D5F0F0", fg: "#1F7A7A" },
  },
];

export default function CuratedGuides({
  selectedCategory = "All",
  onSelectCategory,
}: CuratedGuidesProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const navigate = useNavigate();

  // Filter or chunk products
  const products = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") {
      return CURATED_PRODUCTS;
    }
    const cat = selectedCategory.toLowerCase();
    const matched = CURATED_PRODUCTS.filter(
      (p) =>
        (p.category && p.category.toLowerCase().includes(cat)) ||
        p.name.toLowerCase().includes(cat)
    );
    return matched.length > 0 ? matched : CURATED_PRODUCTS;
  }, [selectedCategory]);

  const pageSize = 4;
  const maxPages = Math.ceil(products.length / pageSize);
  const currentChunk = products.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  // Ensure we always have 4 cards for the layout grid
  const displayedCards = currentChunk.length >= 4 ? currentChunk : products.slice(0, 4);

  // Bottom 4 mini list items
  const miniListItems = useMemo(() => {
    // Pick next 4 items or wrap
    const start = (pageIndex * pageSize + 4) % products.length;
    const slice = [];
    for (let i = 0; i < 4; i++) {
      slice.push(products[(start + i) % products.length]);
    }
    return slice;
  }, [pageIndex, products]);

  const handleNext = () => {
    setPageIndex((p) => (p + 1) % maxPages);
  };

  const handlePrev = () => {
    setPageIndex((p) => (p === 0 ? maxPages - 1 : p - 1));
  };

  return (
    <section id="featured-catalog" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Centered Serif Section Title + Affiliated Disclosure Subtitle */}
      <div className="text-center mb-8 sm:mb-10">
        <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#1E2A24] tracking-tight">
          Curated Buyer Guides & Recommendations
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#7B857F] mt-2 max-w-[65ch] mx-auto leading-relaxed">
          Independent product reviews and verified buyer guides. We independently research and test products;
          when you buy through our links, we may earn an affiliate commission at no cost to you.
        </p>
      </div>

      {/* Top Carousel Navigation Arrows at Right */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <button
          onClick={handlePrev}
          aria-label="Previous guide set"
          className="w-8 h-8 rounded-full border border-[#CBD3CB] bg-white hover:bg-[#FAFBF8] text-[#1E2A24] flex items-center justify-center transition shadow-subtle"
        >
          <ChevronLeftIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next guide set"
          className="w-8 h-8 rounded-full border border-[#CBD3CB] bg-white hover:bg-[#FAFBF8] text-[#1E2A24] flex items-center justify-center transition shadow-subtle"
        >
          <ChevronRightIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Row of 4 Pastel Product Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {displayedCards.map((product, idx) => {
          const cfg = PASTEL_CONFIGS[idx % PASTEL_CONFIGS.length];
          const affUrl = buildAffiliateUrl(product.url);

          return (
            <div
              key={product.id + idx}
              style={{ backgroundColor: cfg.pastelBg }}
              className="group rounded-[20px] p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 select-none"
            >
              {/* Top Row: tiny uppercase category label (left) and Prime pill (right) */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#1E2A24]/80">
                  {cfg.categoryLabel}
                </span>
                <span
                  style={{ backgroundColor: cfg.badge.bg, color: cfg.badge.fg }}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                >
                  {cfg.badge.text}
                </span>
              </div>

              {/* Center: Product Image / Illustration Area */}
              <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="w-full h-40 sm:h-44 flex items-center justify-center py-2 cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Bottom: Serif Product Title (2 lines max, ellipsis) */}
              <div className="mt-3 pt-2">
                <h4
                  onClick={() => navigate(`/product/${product.id}`)}
                  title={product.name}
                  className="font-serif font-medium text-sm sm:text-base text-[#1E2A24] leading-snug line-clamp-2 cursor-pointer hover:underline"
                >
                  {product.name}
                </h4>

                {/* Rating with review count in muted micro text */}
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex text-[#E0A83A]">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating || 4.2)
                            ? "fill-current"
                            : "text-[#E0A83A]/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-[#3F4A44]">
                    {product.rating || 4.2}
                  </span>
                  <span className="text-[10px] text-[#7B857F]">
                    ({(product.ratingCount || 1200).toLocaleString()})
                  </span>
                </div>

                {/* Price (bold sans) and small "View Deal →" link right-aligned */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/[0.06]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-sans font-bold text-base sm:text-lg text-[#1E2A24]">
                      ₹{product.price}
                    </span>
                    {product.mrp && (
                      <span className="text-xs text-[#7B857F] line-through">
                        ₹{product.mrp}
                      </span>
                    )}
                  </div>

                  <a
                    href={affUrl}
                    target="_blank"
                    rel="sponsored nofollow noopener"
                    className="font-sans text-xs font-semibold text-[#1E2A24] hover:text-[#4F6F5D] transition flex items-center gap-0.5 text-decoration-none"
                  >
                    <span>View Deal</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Row of 4 Mini Product List Items Below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
        {miniListItems.map((item, idx) => {
          const affUrl = buildAffiliateUrl(item.url);
          return (
            <div
              key={"mini-" + item.id + idx}
              className="bg-white border border-[#E3E8E2] rounded-[12px] p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:border-[#CBD3CB] transition shadow-subtle"
            >
              <div
                onClick={() => navigate(`/product/${item.id}`)}
                className="flex items-center gap-2.5 min-w-0 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FAFBF8] border border-[#E3E8E2] flex items-center justify-center p-1 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#7B857F] tracking-wider block">
                    {item.category?.split(" ")[0] || "TECH"}
                  </span>
                  <p className="text-xs font-medium text-[#1E2A24] truncate max-w-[140px]">
                    {item.name}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-sans font-bold text-xs text-[#1E2A24] block">
                  ₹{item.price}
                </span>
                <a
                  href={affUrl}
                  target="_blank"
                  rel="sponsored nofollow noopener"
                  className="text-[10px] text-[#4F6F5D] hover:underline font-medium"
                >
                  Deal ↗
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Centered Outlined "Explore all items" Button */}
      <div className="text-center mt-10">
        <button
          onClick={() => {
            if (onSelectCategory) onSelectCategory("All");
          }}
          className="px-6 py-2.5 rounded-[10px] bg-white border border-[#CBD3CB] text-[#1E2A24] text-xs sm:text-sm font-medium hover:bg-[#FAFBF8] transition shadow-subtle"
        >
          Explore all items
        </button>
      </div>
    </section>
  );
}
