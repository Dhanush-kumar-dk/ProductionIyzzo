import { useState } from "react";
import { MagnifyingGlassIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ExploreByCategoryProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
  onExploreAll?: () => void;
}

interface CategoryItem {
  id: string;
  name: string;
  badge?: {
    text: string;
    bg: string;
    fg: string;
  };
}

const CATEGORY_ITEMS: CategoryItem[] = [
  { id: "All", name: "All Deals", badge: { text: "HOT", bg: "#FDE4E0", fg: "#C2412D" } },
  { id: "Electronics", name: "Electronics", badge: { text: "-40%", bg: "#D9F2E3", fg: "#2F7D52" } },
  { id: "Clothing", name: "Fashion & Apparel", badge: { text: "TREND", bg: "#E8DEF8", fg: "#6B4FB3" } },
  { id: "Home", name: "Home & Kitchen" },
  { id: "Audio", name: "Gadgets & Audio", badge: { text: "NEW", bg: "#D5F0F0", fg: "#1F7A7A" } },
  { id: "Footwear", name: "Footwear" },
  { id: "Personal Care", name: "Personal Care" },
  { id: "Under 999", name: "Under ₹999", badge: { text: "BUDGET", bg: "#FDE9D2", fg: "#B8661A" } },
];

interface CategoryTile {
  id: string;
  category: string;
  title: string;
  caption: string;
  flagship?: boolean;
  ctaText?: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    id: "tile-1",
    category: "Electronics",
    title: "Mobiles & Tablets",
    caption: "Lab benchmarked flagships",
    flagship: true,
    ctaText: "Explore Top Picks",
  },
  {
    id: "tile-2",
    category: "Audio",
    title: "Wireless & Audio",
    caption: "Lab benchmarked sound",
  },
  {
    id: "tile-3",
    category: "Home",
    title: "Home & Smart Appliances",
    caption: "Tested for Indian kitchens",
  },
  {
    id: "tile-4",
    category: "Gadgets",
    title: "Wearables & Smart Tech",
    caption: "Battery & sensor accuracy",
  },
  {
    id: "tile-5",
    category: "Footwear",
    title: "Footwear & Footcare",
    caption: "Ergonomics & comfort trials",
  },
  {
    id: "tile-6",
    category: "Home",
    title: "Kitchen & Daily Tools",
    caption: "Durability & safety tested",
  },
];

export default function ExploreByCategory({
  selectedCategory = "All",
  onSelectCategory,
  onExploreAll,
}: ExploreByCategoryProps) {
  const [filterQuery, setFilterQuery] = useState("");

  const filteredCategories = CATEGORY_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleTileClick = (tile: CategoryTile) => {
    if (onSelectCategory) {
      onSelectCategory(tile.category);
    }
    const el = document.getElementById("featured-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleListClick = (cat: CategoryItem) => {
    if (onSelectCategory) {
      onSelectCategory(cat.id);
    }
    const el = document.getElementById("featured-catalog");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="categories" className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Centered Serif Section Title */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="font-serif font-normal text-3xl sm:text-4xl text-[#1E2A24] tracking-tight">
          Explore by Category
        </h2>
        <p className="font-sans text-xs sm:text-sm text-[#7B857F] mt-2 max-w-[60ch] mx-auto">
          Navigate independent evaluations and lab benchmark protocols grouped by consumer domain.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Slim category sidebar (4 of 12 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[20px] border border-[#E3E8E2] p-4 sm:p-5 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Search Input inside sidebar */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-[#7B857F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search in top categories..."
                className="w-full pl-9 pr-3 py-2 bg-[#FAFBF8] border border-[#E3E8E2] rounded-[10px] text-xs text-[#1E2A24] placeholder-[#7B857F] focus:outline-none focus:border-[#CBD3CB] transition"
              />
            </div>

            {/* Vertical Category List */}
            <div className="divide-y divide-[#E3E8E2]/60 pt-1">
              {filteredCategories.map((item) => {
                const isSelected = selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleListClick(item)}
                    className={`w-full py-2.5 px-2 flex items-center justify-between text-xs font-medium transition rounded-lg ${
                      isSelected
                        ? "bg-[#F1F4EF] text-[#1E2A24] font-semibold"
                        : "text-[#3F4A44] hover:bg-[#FAFBF8] hover:text-[#1E2A24]"
                    }`}
                  >
                    <span>{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      {item.badge ? (
                        <span
                          style={{ backgroundColor: item.badge.bg, color: item.badge.fg }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                        >
                          {item.badge.text}
                        </span>
                      ) : (
                        <ChevronRightIcon className="w-3.5 h-3.5 text-[#7B857F]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="pt-4 mt-2 border-t border-[#E3E8E2]">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory("All");
                if (onExploreAll) onExploreAll();
              }}
              className="w-full py-2.5 px-4 bg-[#4F6F5D] text-white rounded-[10px] text-xs font-medium hover:bg-[#5E7F6C] transition flex items-center justify-center gap-1.5"
            >
              <span>All Categories</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Column: 2-column mosaic of flat sage tiles (8 of 12 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {CATEGORY_TILES.map((tile) => (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              className="group cursor-pointer rounded-[20px] bg-[#B5BEB5] hover:bg-[#A3AEA3] p-6 sm:p-7 min-h-[150px] sm:min-h-[170px] flex flex-col justify-center items-center text-center transition-all duration-200 select-none"
            >
              {tile.flagship && (
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/75 text-[10px] font-medium uppercase tracking-wider text-[#1E2A24] mb-2">
                  Flagship lab tested
                </span>
              )}
              <h3 className="font-serif font-normal text-lg sm:text-xl text-[#1E2A24] group-hover:scale-[1.02] transition-transform">
                {tile.title}
              </h3>
              <p className="font-sans text-xs text-[#3F4A44] mt-1">
                {tile.caption}
              </p>
              {tile.ctaText && (
                <span className="mt-3 inline-block px-4 py-1.5 rounded-full bg-white text-[#1E2A24] text-[11px] font-medium shadow-subtle group-hover:bg-[#FAFBF8] transition">
                  {tile.ctaText}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
