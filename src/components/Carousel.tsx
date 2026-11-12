import { useEffect, useState, useMemo } from "react";
import { buildAffiliateUrl } from "../utils/affiliate";
import ProductCard, { Product } from "./ProductCard";
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  TagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { getAllCatalogProducts, syncProductsFromSupabase } from "../data/products";

interface CarouselProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

/**
 * Intelligent category matching helper that maps user category selections
 * (broad categories, sub-categories, price constraints) to catalog products.
 */
function matchesCategoryFilter(product: Product, filterCat: string): boolean {
  if (!filterCat || filterCat.trim() === "") return true;

  const filter = filterCat.trim().toLowerCase();
  if (filter === "all" || filter === "all deals") return true;

  const itemCat = (product.category || "").toLowerCase();
  const itemName = (product.name || "").toLowerCase();
  const itemSummary = (product.summary || "").toLowerCase();
  const itemWho = (product.whoItsFor || "").toLowerCase();

  // Price budget filter ("Under ₹999", "budget")
  if (filter.includes("999") || filter.includes("budget") || filter.includes("under")) {
    const rawPrice = (product.price || "").replace(/[^0-9.]/g, "");
    const numericPrice = parseFloat(rawPrice);
    return !isNaN(numericPrice) && numericPrice <= 999;
  }

  // Broad Electronics filter
  if (filter.includes("electronic")) {
    return (
      itemCat.includes("electronic") ||
      itemCat.includes("tech") ||
      itemCat.includes("audio") ||
      itemCat.includes("mobile") ||
      itemCat.includes("computer") ||
      itemName.includes("phone") ||
      itemName.includes("laptop") ||
      itemName.includes("earbuds") ||
      itemName.includes("headphone") ||
      itemName.includes("watch")
    );
  }

  // Audio / Wearables / Gadgets
  if (
    filter.includes("audio") ||
    filter.includes("gadget") ||
    filter.includes("wearable") ||
    filter.includes("headphone") ||
    filter.includes("earbud")
  ) {
    return (
      itemCat.includes("audio") ||
      itemCat.includes("wearable") ||
      itemName.includes("airdope") ||
      itemName.includes("earbud") ||
      itemName.includes("headphone") ||
      itemName.includes("watch") ||
      itemName.includes("audio")
    );
  }

  // Mobiles & Tech / Smartphones
  if (filter.includes("mobile") || filter.includes("phone") || filter.includes("smartphone")) {
    return (
      itemCat.includes("mobile") ||
      itemName.includes("iphone") ||
      itemName.includes("oneplus") ||
      itemName.includes("samsung") ||
      itemName.includes("phone")
    );
  }

  // Computers & Tech / Laptops
  if (filter.includes("computer") || filter.includes("laptop") || filter.includes("pc")) {
    return (
      itemCat.includes("computer") ||
      itemName.includes("laptop") ||
      itemName.includes("ideapad") ||
      itemName.includes("macbook") ||
      itemName.includes("intel")
    );
  }

  // Home & Kitchen
  if (filter.includes("home") || filter.includes("kitchen") || filter.includes("living")) {
    return (
      itemCat.includes("home") ||
      itemCat.includes("kitchen") ||
      itemName.includes("flask") ||
      itemName.includes("borosil") ||
      itemName.includes("bottle")
    );
  }

  // Books & Mindset
  if (filter.includes("book") || filter.includes("mindset") || filter.includes("read")) {
    return (
      itemCat.includes("book") ||
      itemCat.includes("mindset") ||
      itemName.includes("wealth") ||
      itemName.includes("guide")
    );
  }

  // Fashion / Clothing / Apparel / Footwear
  if (filter.includes("fashion") || filter.includes("clothing") || filter.includes("apparel") || filter.includes("footwear")) {
    return (
      itemCat.includes("fashion") ||
      itemCat.includes("clothing") ||
      itemCat.includes("apparel") ||
      itemCat.includes("footwear") ||
      itemName.includes("shirt") ||
      itemName.includes("shoe")
    );
  }

  // Direct substring fallback
  return (
    itemCat.includes(filter) ||
    itemName.includes(filter) ||
    itemSummary.includes(filter) ||
    itemWho.includes(filter)
  );
}

export default function Carousel({
  selectedCategory = "",
  onSelectCategory,
}: CarouselProps) {
  // Synchronously initialize with cached catalog to avoid blank/spinner on initial render
  const [products, setProducts] = useState<Product[]>(() => {
    const all = getAllCatalogProducts();
    return all.map((p) => ({
      ...p,
      url: buildAffiliateUrl(p.url),
    }));
  });
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [localSearch, setLocalSearch] = useState<string>("");

  const loadProducts = () => {
    const all = getAllCatalogProducts();
    setProducts(
      all.map((p) => ({
        ...p,
        url: buildAffiliateUrl(p.url),
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
    syncProductsFromSupabase();
    const handleUpdate = () => loadProducts();
    window.addEventListener("catalogUpdated", handleUpdate);
    return () => window.removeEventListener("catalogUpdated", handleUpdate);
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // Category filter
        if (selectedCategory && selectedCategory.trim().length > 0) {
          if (!matchesCategoryFilter(item, selectedCategory)) {
            return false;
          }
        }

        // Local search filter
        if (localSearch.trim().length > 0) {
          const query = localSearch.toLowerCase().trim();
          const matches =
            item.name.toLowerCase().includes(query) ||
            (item.summary || "").toLowerCase().includes(query) ||
            (item.whoItsFor || "").toLowerCase().includes(query) ||
            (item.category || "").toLowerCase().includes(query);
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        return 0; // featured default
      });
  }, [products, selectedCategory, localSearch, sortBy]);

  return (
    <section id="featured-catalog" className="w-full px-3 sm:px-6 lg:px-12 py-6 sm:py-8 font-poppins">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 border-b border-gray-200/80 pb-4 sm:pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-900 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full mb-1">
            <SparklesIcon className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
            <span>Independent Editorial Reviews</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Curated Buyer Guides & Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Honest evaluations with key strengths, limitations, and audience suitability. All product links connect directly to official Amazon India product listings with transparent affiliate disclosure.
          </p>

          {/* Active Filter Notification Badge */}
          {selectedCategory && (
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200 text-xs font-medium">
                <span>Filter: <strong>{selectedCategory}</strong></span>
                <span className="text-slate-400">({filteredProducts.length} results)</span>
                <button
                  type="button"
                  onClick={() => onSelectCategory && onSelectCategory("")}
                  className="ml-1 p-0.5 hover:bg-orange-200/60 rounded text-orange-700 cursor-pointer"
                  title="Remove category filter"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Toolbar: Sort & Search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Quick Filter Search */}
          <div className="relative flex-1 sm:flex-initial">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search guides..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 pr-2.5 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs w-full sm:w-48 md:w-52"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            id="sort-products"
            name="sort-products"
            aria-label="Sort product catalog"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm rounded-xl px-2.5 sm:px-3 py-1.5 outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs cursor-pointer flex-shrink-0"
          >
            <option value="featured">Featured Picks</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-16 sm:py-20">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <TagIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
          <h3 className="text-sm sm:text-base font-bold text-gray-800">
            No matching product guides found
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Try adjusting your search criteria or resetting filters.
          </p>
          <button
            onClick={() => {
              setLocalSearch("");
              if (onSelectCategory) onSelectCategory("");
            }}
            className="mt-3 sm:mt-4 px-4 py-2 bg-gradient-to-r from-[#FF6B20] to-[#F15000] hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
