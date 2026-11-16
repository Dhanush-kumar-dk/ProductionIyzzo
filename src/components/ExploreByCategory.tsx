import { useState } from "react";
import { MagnifyingGlassIcon, ChevronRightIcon, TagIcon } from "@heroicons/react/24/outline";

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
  { id: "All", name: "All Deals", badge: { text: "HOT", bg: "#FEE2E2", fg: "#DC2626" } },
  { id: "Electronics", name: "Electronics", badge: { text: "-40%", bg: "#DCFCE7", fg: "#15803D" } },
  { id: "Clothing", name: "Fashion & Apparel", badge: { text: "TREND", bg: "#F3E8FF", fg: "#7E22CE" } },
  { id: "Home", name: "Home & Kitchen" },
  { id: "Audio", name: "Gadgets & Audio", badge: { text: "NEW", bg: "#E0F2FE", fg: "#0369A1" } },
  { id: "Footwear", name: "Footwear" },
  { id: "Personal Care", name: "Personal Care" },
  { id: "Under 999", name: "Under ₹999", badge: { text: "BUDGET", bg: "#FFEDD5", fg: "#C2410C" } },
];

interface CategoryTile {
  id: string;
  category: string;
  title: string;
  caption: string;
  flagship?: boolean;
  ctaText?: string;
  icon: string;
}

const CATEGORY_TILES: CategoryTile[] = [
  {
    id: "tile-1",
    category: "Electronics",
    title: "Mobiles & Tablets",
    caption: "Flagship processors, display benchmarks & cameras",
    flagship: true,
    ctaText: "Explore Top Picks",
    icon: "📱",
  },
  {
    id: "tile-2",
    category: "Audio",
    title: "Wireless & Audio",
    caption: "Acoustics & active noise cancellation teardowns",
    icon: "🎧",
  },
  {
    id: "tile-3",
    category: "Home",
    title: "Home & Smart Appliances",
    caption: "Thermal cameras & durability evaluations",
    icon: "🏠",
  },
  {
    id: "tile-4",
    category: "Gadgets",
    title: "Wearables & Smart Tech",
    caption: "Heart rate sensor & battery degradation accuracy",
    icon: "⌚",
  },
  {
    id: "tile-5",
    category: "Footwear",
    title: "Footwear & Ergonomics",
    caption: "Cushioning stress trials & arch support tests",
    icon: "👟",
  },
  {
    id: "tile-6",
    category: "Home",
    title: "Kitchen & Daily Tools",
    caption: "Food-grade stainless steel & safety benchmarks",
    icon: "🍳",
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
    <section id="categories" className="w-full px-3 sm:px-6 lg:px-12 py-8 sm:py-10 font-poppins">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6 border-b border-gray-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-900 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full mb-1">
            <TagIcon className="w-3.5 h-3.5 text-orange-600" />
            <span>Curated Taxonomy</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Explore by Category
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Navigate independent evaluations and lab benchmark protocols grouped by consumer domain.
          </p>
        </div>
        {selectedCategory && selectedCategory !== "All" && (
          <button
            onClick={() => onSelectCategory && onSelectCategory("All")}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            Reset Filters ✕
          </button>
        )}
      </div>

      {/* Two-Column Full-Width Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column: Category Sidebar (4 of 12 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            {/* Vertical List */}
            <div className="divide-y divide-gray-100 pt-1">
              {filteredCategories.map((item) => {
                const isSelected = selectedCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleListClick(item)}
                    className={`w-full py-2.5 px-3 flex items-center justify-between text-xs font-medium transition rounded-xl ${
                      isSelected
                        ? "bg-gradient-to-r from-[#FF6B20] to-[#F15000] text-white font-bold shadow-xs"
                        : "text-gray-700 hover:bg-slate-50 hover:text-gray-950"
                    }`}
                  >
                    <span>{item.name}</span>
                    <div className="flex items-center gap-1.5">
                      {item.badge ? (
                        <span
                          style={{ backgroundColor: item.badge.bg, color: item.badge.fg }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                        >
                          {item.badge.text}
                        </span>
                      ) : (
                        <ChevronRightIcon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-gray-400"}`} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100">
            <button
              onClick={() => {
                if (onSelectCategory) onSelectCategory("All");
                if (onExploreAll) onExploreAll();
              }}
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>All Categories</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Column: 2x3 Mosaic of Category Tiles (8 of 12 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {CATEGORY_TILES.map((tile) => (
            <div
              key={tile.id}
              onClick={() => handleTileClick(tile)}
              className="group cursor-pointer rounded-2xl sm:rounded-3xl bg-white hover:bg-slate-50 border border-gray-200 p-6 sm:p-7 min-h-[150px] flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md hover:border-orange-200 select-none"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{tile.icon}</span>
                  {tile.flagship && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-[10px] font-bold uppercase tracking-wider">
                      Flagship Lab Tested
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  {tile.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {tile.caption}
                </p>
              </div>

              {tile.ctaText && (
                <div className="pt-3">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 group-hover:underline">
                    <span>{tile.ctaText}</span>
                    <span>→</span>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
