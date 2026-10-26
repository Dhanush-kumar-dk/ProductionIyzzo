import { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "../config/api";
import { buildAffiliateUrl } from "../utils/affiliate";
import ProductCard, { Product } from "./ProductCard";
import {
  FunnelIcon,
  ArrowsUpDownIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Fallback high-converting Amazon India catalog with active tracking tags
const CURATED_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "B09N3ZNHTY",
    name: "boAt Airdopes 141 Bluetooth Truly Wireless in Ear Earbuds with 42H Playtime",
    price: "999",
    category: "Wireless Accessories",
    image: "https://m.media-amazon.com/images/I/51HBom8xz7L._SL1100_.jpg",
    image1: "https://m.media-amazon.com/images/I/61KNJav3S9L._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/719ElvXXRBL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09N3ZNHTY",
  },
  {
    id: "B0CHX1W1XY",
    name: "Apple iPhone 15 (128 GB) - Black with Dynamic Island & 48MP Main Camera",
    price: "69999",
    category: "Mobiles & Accessories",
    image: "https://m.media-amazon.com/images/I/71657TiFeHL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/512lqmUqnIL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/81+m10+aLJL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0CHX1W1XY",
  },
  {
    id: "B07P8P2V34",
    name: "Borosil Hydra Coffeemate 300 ml Stainless Steel Travel Mug / Insulated Flask",
    price: "608",
    category: "Kitchen & Dining",
    image: "https://m.media-amazon.com/images/I/61k21r0VbDL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/71Y+K5wV7sL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71F7wW-4+qL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B07P8P2V34",
  },
  {
    id: "B09V7M6S22",
    name: "The 5 Types of Wealth: Transformative Guide to True Freedom and Success",
    price: "408",
    category: "Books",
    image: "https://m.media-amazon.com/images/I/71sBtM3Yi5L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/81x2gA596mL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71z7nQZ65ML._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09V7M6S22",
  },
  {
    id: "B09G9FPHP6",
    name: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones - 30 Hr Battery",
    price: "26990",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/61+btxzpfDL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/71pE1+X0eUL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71JcR4gZDEL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09G9FPHP6",
  },
  {
    id: "B0C7771Z11",
    name: "OnePlus Nord CE 3 Lite 5G (Pastel Lime, 8GB RAM, 128GB Storage)",
    price: "17499",
    category: "Mobiles & Accessories",
    image: "https://m.media-amazon.com/images/I/61QRgOgBx0L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/61Amb0OXrSL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/61g+2Y3y+RL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0C7771Z11",
  },
  {
    id: "B0BY8MCQ9S",
    name: "Echo Dot (5th Gen) Smart Speaker with Alexa, Deeper Bass and Clear Voice",
    price: "4449",
    category: "Smart Home",
    image: "https://m.media-amazon.com/images/I/61EXU8BuGZL._SL1000_.jpg",
    image1: "https://m.media-amazon.com/images/I/71R3yA16u0L._SL1000_.jpg",
    image2: "https://m.media-amazon.com/images/I/71f-0e-3TzL._SL1000_.jpg",
    url: "https://www.amazon.in/dp/B0BY8MCQ9S",
  },
  {
    id: "B0C9J7SML8",
    name: "Lenovo IdeaPad Slim 3 Intel Core i5 12th Gen (16GB/512GB SSD/Win 11/FHD)",
    price: "49990",
    category: "Computers & Laptops",
    image: "https://m.media-amazon.com/images/I/61q6x-ll5FL._SL1000_.jpg",
    image1: "https://m.media-amazon.com/images/I/71Zp+EwZq0L._SL1000_.jpg",
    image2: "https://m.media-amazon.com/images/I/71Z8Z4W-1vL._SL1000_.jpg",
    url: "https://www.amazon.in/dp/B0C9J7SML8",
  },
  {
    id: "B09B8WHR9V",
    name: "Boult Audio Z40 True Wireless in Ear Earbuds with 60H Playtime, Zen ENC Mic",
    price: "1199",
    category: "Wireless Accessories",
    image: "https://m.media-amazon.com/images/I/61llZ5vjYnL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/71R56y4vTQL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/714wS5yW+cL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09B8WHR9V",
  },
  {
    id: "B0BHMR195H",
    name: "Noise ColorFit Pulse Grand Smart Watch with 1.69'' HD Display, 60 Sports Modes",
    price: "1299",
    category: "Electronics",
    image: "https://m.media-amazon.com/images/I/61epn29QG0L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/61k1jYqS1BL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71T8J1yP3QL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0BHMR195H",
  },
];

interface CarouselProps {
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export default function Carousel({
  selectedCategory = "",
  onSelectCategory,
}: CarouselProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [localSearch, setLocalSearch] = useState<string>("");

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/getitems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Remote server unavailable, loading catalog");
      }

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        const updatedProducts: Product[] = data.map((product: Product) => ({
          ...product,
          url: buildAffiliateUrl(product.url),
        }));
        setProducts(updatedProducts);
      } else {
        // Fallback to curated catalog tagged with user partner tag
        setProducts(
          CURATED_FALLBACK_PRODUCTS.map((p) => ({
            ...p,
            url: buildAffiliateUrl(p.url),
          }))
        );
      }
    } catch {
      // Graceful offline/standby fallback with affiliate-tagged links
      setProducts(
        CURATED_FALLBACK_PRODUCTS.map((p) => ({
          ...p,
          url: buildAffiliateUrl(p.url),
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        // Category filter
        if (selectedCategory && selectedCategory.trim().length > 0) {
          const cat = selectedCategory.toLowerCase();
          const name = item.name.toLowerCase();
          const itemCat = (item.category || "").toLowerCase();
          const matches =
            name.includes(cat) ||
            itemCat.includes(cat) ||
            (cat === "fashion" && (name.includes("shirt") || name.includes("shoe") || name.includes("pant") || name.includes("clothing"))) ||
            (cat === "electronics" && (name.includes("pro") || name.includes("cable") || name.includes("watch") || name.includes("phone") || name.includes("ear") || name.includes("usb"))) ||
            (cat === "gadgets" && (name.includes("head") || name.includes("sound") || name.includes("wireless")));
          if (!matches) return false;
        }

        // Local search filter
        if (localSearch.trim().length > 0) {
          const query = localSearch.toLowerCase();
          if (!item.name.toLowerCase().includes(query)) return false;
        }

        // Price range filter
        const priceNum = parseFloat(item.price.replace(/,/g, "")) || 0;
        if (priceRange === "under-999" && priceNum > 999) return false;
        if (priceRange === "1000-2999" && (priceNum < 1000 || priceNum > 2999)) return false;
        if (priceRange === "3000-plus" && priceNum < 3000) return false;

        return true;
      })
      .sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/,/g, "")) || 0;
        const priceB = parseFloat(b.price.replace(/,/g, "")) || 0;
        if (sortBy === "price-low") return priceA - priceB;
        if (sortBy === "price-high") return priceB - priceA;
        return 0; // featured default
      });
  }, [products, selectedCategory, localSearch, priceRange, sortBy]);

  return (
    <section id="featured-catalog" className="w-full px-3 sm:px-6 lg:px-12 py-8 font-poppins">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-gray-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-1.5">
            <SparklesIcon className="w-3.5 h-3.5" />
            Curated Handpicked Selection
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Featured Deals & Best Sellers
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Top discounts currently active with verified affiliate pricing.
          </p>
        </div>

        {/* Toolbar: Sort, Price Filter & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Filter Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter deals..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm w-36 sm:w-44"
            />
          </div>

          {/* Price Range */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              aria-label="Filter by price range"
              className="appearance-none pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            >
              <option value="all">All Prices</option>
              <option value="under-999">Under ₹999</option>
              <option value="1000-2999">₹1,000 - ₹2,999</option>
              <option value="3000-plus">₹3,000 & Above</option>
            </select>
            <FunnelIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="text-[10px] text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              ▼
            </span>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products by"
              className="appearance-none pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <ArrowsUpDownIcon className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <span className="text-[10px] text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(selectedCategory || priceRange !== "all" || localSearch) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap text-xs">
          <span className="text-gray-500 font-medium">Active filters:</span>
          {selectedCategory && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
              Category: {selectedCategory}
              <button
                onClick={() => onSelectCategory && onSelectCategory("")}
                className="hover:text-blue-950 font-bold ml-1"
              >
                ✕
              </button>
            </span>
          )}
          {priceRange !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-800 rounded-full font-semibold">
              Price: {priceRange}
              <button
                onClick={() => setPriceRange("all")}
                className="hover:text-black font-bold ml-1"
              >
                ✕
              </button>
            </span>
          )}
          {localSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-800 rounded-full font-semibold">
              Query: "{localSearch}"
              <button
                onClick={() => setLocalSearch("")}
                className="hover:text-black font-bold ml-1"
              >
                ✕
              </button>
            </span>
          )}
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory("");
              setPriceRange("all");
              setLocalSearch("");
            }}
            className="text-blue-600 hover:underline font-semibold ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Product Grid Area */}
      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-3"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-xl" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
              <div className="h-6 bg-gray-100 rounded w-1/3 mt-2" />
              <div className="h-10 bg-gray-100 rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm max-w-md mx-auto">
          <p className="text-red-500 font-medium mb-3">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          <p className="text-base font-semibold text-gray-800 mb-1">
            No products match your current filters.
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Try adjusting your price range, clearing your search query, or selecting another category.
          </p>
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory("");
              setPriceRange("all");
              setLocalSearch("");
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
