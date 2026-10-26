import { useEffect, useState, useMemo } from "react";
import { buildAffiliateUrl } from "../utils/affiliate";
import ProductCard, { Product } from "./ProductCard";
import {
  SparklesIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

// Curated Yearnit Product Catalog with 100% Original Editorial Reviews & Specifications
const CURATED_FALLBACK_PRODUCTS: Product[] = [
  {
    id: "B09N3ZNHTY",
    name: "boAt Airdopes 141 True Wireless Earbuds with 42H Playtime",
    category: "Audio & Wearables",
    image: "https://m.media-amazon.com/images/I/51HBom8xz7L._SL1100_.jpg",
    image1: "https://m.media-amazon.com/images/I/61KNJav3S9L._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/719ElvXXRBL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09N3ZNHTY",
    editorBadge: "Top Value Pick",
    summary:
      "A rugged, pocket-friendly pair of true wireless earbuds designed for marathon listening sessions. Features 8mm dynamic drivers tuned for energetic bass, ENx environmental noise cancellation for voice calls, and IPX4 water resistance.",
    pros: [
      "Massive 42-hour combined battery backup with pocket charging case",
      "ASAP Charge technology gives 75 minutes of listening from a 5-minute charge",
      "Instant Wake N' Pair (IWP) connects automatically when the lid opens",
    ],
    cons: [
      "Plastic build feel reflects its budget-oriented tier",
      "Bass-forward tuning may slightly overshadow delicate vocal mid-frequencies",
    ],
    whoItsFor:
      "Everyday commuters, college students, and gym-goers seeking reliable audio endurance without spending heavily.",
  },
  {
    id: "B0CHX1W1XY",
    name: "Apple iPhone 15 (128 GB) - Dynamic Island & 48MP Camera",
    category: "Mobiles & Tech",
    image: "https://m.media-amazon.com/images/I/71657TiFeHL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/512lqmUqnIL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/81+m10+aLJL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0CHX1W1XY",
    editorBadge: "Flagship Choice",
    summary:
      "Apple's generation baseline balances flagship ergonomics with high-end photographic capabilities. It incorporates the Dynamic Island interactive notification pill, color-infused back glass with contoured edges, and universal USB-C charging.",
    pros: [
      "48MP main sensor enables sharp 2x optical-quality zoom portraits",
      "USB-C connector enables unified charging with iPads and laptops",
      "A16 Bionic chip delivers effortless computational photography and gaming",
    ],
    cons: [
      "Display refresh rate is capped at standard 60Hz rather than 120Hz ProMotion",
      "Charging speed is capped at 20W wired",
    ],
    whoItsFor:
      "Content creators, mobile photographers, and upgraders wanting top-tier build quality and guaranteed long-term iOS updates.",
  },
  {
    id: "B07P8P2V34",
    name: "Borosil Hydra Coffeemate 300 ml Stainless Steel Insulated Flask",
    category: "Home & Kitchen",
    image: "https://m.media-amazon.com/images/I/61k21r0VbDL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/71Y+K5wV7sL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71F7wW-4+qL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B07P8P2V34",
    editorBadge: "Daily Essential",
    summary:
      "A double-walled, vacuum-insulated food-grade 304 stainless steel travel mug engineered to keep beverages hot for up to 8 hours or iced for up to 14 hours without sweating or flavor transfer.",
    pros: [
      "Copper coating inside insulation chamber maximizes temperature retention",
      "Compact 300ml footprint fits comfortably in automobile cup holders",
      "BPA-free leak-proof lid with ergonomic push-button spout",
    ],
    cons: [
      "300ml volume is tailored for espresso or tea rather than full-day hydration",
      "Hand washing recommended to preserve exterior matte powder coat",
    ],
    whoItsFor:
      "Office professionals, university commuters, and coffee lovers needing spill-free portability.",
  },
  {
    id: "B09V7M6S22",
    name: "The 5 Types of Wealth: Transformative Guide to True Freedom",
    category: "Books & Mindset",
    image: "https://m.media-amazon.com/images/I/71sBtM3Yi5L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/81x2gA596mL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71z7nQZ65ML._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09V7M6S22",
    editorBadge: "Editor Recommended",
    summary:
      "An insightful practical playbook by Sahil Bloom exploring how genuine life fulfillment hinges on balancing five pillars: financial, time, social, mental, and physical wealth.",
    pros: [
      "Actionable frameworks replacing vague motivational rhetoric",
      "Includes self-assessment matrices and habit design exercises",
      "Accessible prose suitable for early career to veteran professionals",
    ],
    cons: [
      "Several concepts overlap with classic productivity literature",
      "Requires consistent long-term journal practice to reap full benefit",
    ],
    whoItsFor:
      "Readers, career professionals, and entrepreneurs seeking holistic personal growth and time mastery.",
  },
  {
    id: "B09G9FPHP6",
    name: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
    category: "Audio & Wearables",
    image: "https://m.media-amazon.com/images/I/61+btxzpfDL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/71pE1+X0eUL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71JcR4gZDEL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09G9FPHP6",
    editorBadge: "Audiophile Pick",
    summary:
      "Sony's premier noise-cancelling over-ear headset utilizes an Integrated Processor V1 and HD Noise Cancelling Processor QN1 with 8 microphones to deliver class-leading silence in chaotic surroundings.",
    pros: [
      "Industry-benchmark active noise cancelling attenuates high-frequency chatter and plane drone",
      "Up to 30 hours of continuous wireless playback with rapid charging",
      "Multipoint Bluetooth connects simultaneously to phone and laptop",
    ],
    cons: [
      "Does not fold into a compact ball like its predecessor XM4",
      "Premium price bracket requires dedicated budget commitment",
    ],
    whoItsFor:
      "Frequent flyers, hybrid office workers, and music lovers demanding pristine isolation and call clarity.",
  },
  {
    id: "B0C7771Z11",
    name: "OnePlus Nord CE 3 Lite 5G (8GB RAM, 128GB Storage)",
    category: "Mobiles & Tech",
    image: "https://m.media-amazon.com/images/I/61QRgOgBx0L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/61Amb0OXrSL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/61g+2Y3y+RL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0C7771Z11",
    editorBadge: "Mid-Range Champ",
    summary:
      "An aggressive mid-tier smartphone featuring a 108MP primary camera, 67W SUPERVOOC high-speed flash charging, dual stereo speakers, and a smooth 120Hz refresh display.",
    pros: [
      "67W fast charging restores 80% battery in approximately 30 minutes",
      "Fluid 120Hz display keeps UI scrolling snappy and responsive",
      "Expandable virtual RAM keeps background apps active without stutter",
    ],
    cons: [
      "Display panel is IPS LCD rather than deep-black AMOLED",
      "Low-light camera processing relies on software sharpening",
    ],
    whoItsFor:
      "Users wanting 5G readiness, stellar battery replenishment, and reliable everyday multitasking on a sensible budget.",
  },
  {
    id: "B0C9J7SML8",
    name: "Lenovo IdeaPad Slim 3 12th Gen Intel Core i5 Laptop (16GB/512GB)",
    category: "Computers & Tech",
    image: "https://m.media-amazon.com/images/I/61q6x-ll5FL._SL1000_.jpg",
    image1: "https://m.media-amazon.com/images/I/71Zp+EwZq0L._SL1000_.jpg",
    image2: "https://m.media-amazon.com/images/I/71Z8Z4W-1vL._SL1000_.jpg",
    url: "https://www.amazon.in/dp/B0C9J7SML8",
    editorBadge: "Productivity Choice",
    summary:
      "A slim, lightweight laptop built for university coursework, coding, and remote workplace tasks. Boasts a 12th Gen Intel Core i5 processor paired with 16GB RAM and a rapid NVMe solid state drive.",
    pros: [
      "Generous 16GB DDR4 memory handles dozens of browser tabs and spreadsheets smoothly",
      "Anti-glare FHD display reduces eye fatigue during extended screen work",
      "Physical webcam privacy shutter for enhanced security",
    ],
    cons: [
      "Keyboard backlighting brightness is basic",
      "Integrated Intel graphics suited for productivity rather than heavy 3D gaming",
    ],
    whoItsFor:
      "Students, corporate telecommuters, and developers seeking dependable compute speed in a 1.6kg portable chassis.",
  },
  {
    id: "B09B8WHR9V",
    name: "Boult Audio Z40 True Wireless Earbuds with 60H Playtime",
    category: "Audio & Wearables",
    image: "https://m.media-amazon.com/images/I/61llZ5vjYnL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/71R56y4vTQL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/714wS5yW+cL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09B8WHR9V",
    editorBadge: "Endurance Pick",
    summary:
      "Engineered for marathon playback, the Boult Audio Z40 offers up to 60 total hours of listening with its Zen Mode ENC quad-mic setup for filtering ambient background noise during calls.",
    pros: [
      "Staggering 60 hours total endurance between recharges",
      "Low-latency 45ms gaming combat mode reduces audio lag",
      "IPX5 sweat and splash resistance protects against heavy workouts",
    ],
    cons: [
      "Touch sensors require precise taps to avoid accidental pauses",
      "Case finish is glossy and prone to micro-scratches",
    ],
    whoItsFor:
      "Heavy podcast listeners, gamers, and mobile callers needing maximum days between charges.",
  },
  {
    id: "B0BHMR195H",
    name: "Noise ColorFit Pulse Grand Smart Watch with 1.69'' HD Display",
    category: "Audio & Wearables",
    image: "https://m.media-amazon.com/images/I/61epn29QG0L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/61k1jYqS1BL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71T8J1yP3QL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0BHMR195H",
    editorBadge: "Fitness Value",
    summary:
      "A feature-packed wellness companion offering continuous 24/7 heart rate monitoring, blood oxygen (SpO2) tracking, 60 sports modes, and customizable watch faces on a vibrant 1.69-inch curved LCD.",
    pros: [
      "Quick charge system yields 25 hours of battery life in only 15 minutes",
      "Lightweight silicone strap ensures comfortable overnight sleep tracking",
      "IP68 waterproof certification withstands sweat, rain, and hand washing",
    ],
    cons: [
      "No standalone GPS; relies on paired smartphone for route mapping",
      "Notification interactions are view-only without keyboard reply",
    ],
    whoItsFor:
      "Fitness beginners, runners, and individuals wanting continuous health telemetry on their wrist.",
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
  const [sortBy, setSortBy] = useState<string>("featured");
  const [localSearch, setLocalSearch] = useState<string>("");

  useEffect(() => {
    // Populate with verified catalog tagged with Associate tracking ID
    setProducts(
      CURATED_FALLBACK_PRODUCTS.map((p) => ({
        ...p,
        url: buildAffiliateUrl(p.url),
      }))
    );
    setLoading(false);
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
          const matches = name.includes(cat) || itemCat.includes(cat);
          if (!matches) return false;
        }

        // Local search filter
        if (localSearch.trim().length > 0) {
          const query = localSearch.toLowerCase();
          const matches =
            item.name.toLowerCase().includes(query) ||
            (item.summary || "").toLowerCase().includes(query) ||
            (item.whoItsFor || "").toLowerCase().includes(query);
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
    <section id="featured-catalog" className="w-full px-3 sm:px-6 lg:px-12 py-8 font-poppins">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-gray-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-1.5">
            <SparklesIcon className="w-3.5 h-3.5" />
            Independent Editorial Reviews
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Curated Buyer Guides & Recommendations
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            Honest evaluations with key strengths, limitations, and audience suitability. All product links connect directly to official Amazon India product listings with transparent affiliate disclosure.
          </p>
        </div>

        {/* Toolbar: Sort & Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Filter Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search evaluations..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm w-40 sm:w-52"
            />
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-400 shadow-sm cursor-pointer"
          >
            <option value="featured">Featured Picks</option>
            <option value="name-asc">Product Name (A-Z)</option>
            <option value="name-desc">Product Name (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <TagIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
