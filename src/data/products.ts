import { supabase, supabaseUrl, supabaseKey } from "../supabase";

export type CustomerReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified?: boolean;
};

export type Product = {
  id: string;
  name: string;
  category?: string;
  price?: string;
  mrp?: string;
  rating?: number;
  ratingCount?: number;
  image: string;
  image1?: string;
  image2?: string;
  additionalImages?: string[];
  url: string;
  editorBadge?: string;
  shortDetail?: string;
  summary?: string;
  pros?: string[];
  cons?: string[];
  whoItsFor?: string;
  specs?: { [key: string]: string };
  customerReviews?: CustomerReview[];
  priceTimestamp?: string;
  isLivePrice?: boolean;
};

export const CURATED_PRODUCTS: Product[] = [
  {
    id: "B09N3ZNHTY",
    name: "boAt Airdopes 141 True Wireless Earbuds with 42H Playtime",
    category: "Audio & Wearables",
    price: "1,099",
    mrp: "4,490",
    rating: 4.0,
    ratingCount: 198420,
    image: "https://m.media-amazon.com/images/I/51HBom8xz7L._SL1100_.jpg",
    image1: "https://m.media-amazon.com/images/I/61KNJav3S9L._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09N3ZNHTY",
    editorBadge: "Top Value Pick",
    shortDetail: "8mm Dynamic Drivers • 42H Total Playback • ASAP Charge (5 min = 75 min) • ENx Quad Mics",
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
    specs: {
      "Battery Playtime": "Up to 42 Hours total (6 hours per earbud)",
      "Charging Port": "Type-C ASAP Charge",
      "Driver Size": "8mm Dynamic Drivers",
      "Water Resistance": "IPX4 Sweat and Splash Proof",
      "Microphone": "Quad Mics with ENx Environmental Noise Cancellation",
      "Bluetooth Version": "v5.1 with Instant Wake N' Pair (IWP)",
    },
    customerReviews: [
      {
        id: "rev-boat-1",
        author: "Rahul S.",
        rating: 5,
        date: "14 October 2026",
        title: "Unbelievable battery life for daily travel",
        content: "I charge the case once a week and use these for daily metro travel and calls. The sound is punchy with great bass, and calls are very clear.",
        verified: true,
      },
      {
        id: "rev-boat-2",
        author: "Pooja Mehta",
        rating: 4,
        date: "28 September 2026",
        title: "Great value for money",
        content: "Connects instantly as soon as I open the case. Ear fit is comfortable even after 2 hours of gym. Microphone works well in quiet rooms.",
        verified: true,
      },
      {
        id: "rev-boat-3",
        author: "Vikram K.",
        rating: 4,
        date: "12 September 2026",
        title: "Solid budget earbuds",
        content: "High volume, good bass punch. If you want earbuds for running and podcasts under budget, these are a no-brainer.",
        verified: true,
      },
    ],
  },
  {
    id: "B0CHX1W1XY",
    name: "Apple iPhone 15 (128 GB) - Dynamic Island & 48MP Camera",
    category: "Mobiles & Tech",
    price: "65,999",
    mrp: "79,900",
    rating: 4.6,
    ratingCount: 14280,
    image: "https://m.media-amazon.com/images/I/71657TiFeHL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/61bK6PMOC3L._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0CHX1W1XY",
    editorBadge: "Flagship Choice",
    shortDetail: "Dynamic Island • 48MP Main Camera with 2x Telephoto • A16 Bionic • Universal USB-C",
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
    specs: {
      "Display": "6.1-inch Super Retina XDR OLED Display (2000 nits peak)",
      "Processor": "A16 Bionic chip with 5-core GPU",
      "Camera Setup": "Advanced dual-camera (48MP Main + 12MP Ultra Wide)",
      "Connector": "USB-C with USB 2 speeds",
      "Security": "Face ID enabled by TrueDepth camera",
      "Water Resistance": "Rated IP68 (maximum depth of 6 meters up to 30 minutes)",
    },
    customerReviews: [
      {
        id: "rev-ip15-1",
        author: "Aditya Menon",
        rating: 5,
        date: "20 October 2026",
        title: "The 48MP camera and USB-C make this the best iPhone in years",
        content: "Upgraded from iPhone 11 and the difference is night and day. The Dynamic Island is genuinely handy for Spotify and delivery tracking, and USB-C finally means one cable for all my gear.",
        verified: true,
      },
      {
        id: "rev-ip15-2",
        author: "Sneha Nair",
        rating: 5,
        date: "04 October 2026",
        title: "Smooth, gorgeous design and comfortable to hold",
        content: "The contoured glass edge feels wonderful in the hand compared to sharp older models. Photos have incredible detail even in low indoor lighting.",
        verified: true,
      },
    ],
  },
  {
    id: "B07P8P2V34",
    name: "Borosil Hydra Coffeemate 300 ml Stainless Steel Insulated Flask",
    category: "Home & Kitchen",
    price: "799",
    mrp: "1,095",
    rating: 4.3,
    ratingCount: 7850,
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80",
    image1: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80",
    url: "https://www.amazon.in/dp/B07P8P2V34",
    editorBadge: "Daily Essential",
    shortDetail: "Double Wall Vacuum 304 Stainless Steel • 8H Hot / 14H Cold • Leak-Proof Push Spout",
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
    specs: {
      "Capacity": "300 ml",
      "Material": "Food Grade 304 Stainless Steel (Inside & Outside)",
      "Thermal Insulation": "8 Hours Hot, 14 Hours Cold",
      "Lid Mechanism": "100% Leak-Proof Push-Button Sipper Lid",
      "Warranty": "1 Year Manufacturer Warranty on heat retention",
    },
    customerReviews: [
      {
        id: "rev-boro-1",
        author: "Kavita Reddy",
        rating: 5,
        date: "16 October 2026",
        title: "Keeps coffee piping hot throughout the morning commute",
        content: "I pour fresh brewed coffee at 8 AM and it is still steaming hot at 12 PM. Fits snugly in my Honda City cup holder with zero spills.",
        verified: true,
      },
      {
        id: "rev-boro-2",
        author: "Deepak Verma",
        rating: 4,
        date: "02 September 2026",
        title: "High quality steel and compact size",
        content: "Very sleek matte finish. Doesn't leak at all even when tossed inside my backpack. Easy to rinse and clean.",
        verified: true,
      },
    ],
  },
  {
    id: "B09V7M6S22",
    name: "The 5 Types of Wealth: Transformative Guide to True Freedom",
    category: "Books & Mindset",
    price: "499",
    mrp: "799",
    rating: 4.7,
    ratingCount: 3120,
    image: "https://m.media-amazon.com/images/I/71sBtM3Yi5L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/81bsw6fnUiL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09V7M6S22",
    editorBadge: "Editor Recommended",
    shortDetail: "Sahil Bloom's Practical Framework • Time, Money, Health, Relationships & Purpose",
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
    specs: {
      "Format": "Paperback / Hardcover",
      "Author": "Sahil Bloom",
      "Language": "English",
      "Publisher": "Portfolio / Penguin",
      "Print Length": "288 Pages",
    },
    customerReviews: [
      {
        id: "rev-wealth-1",
        author: "Arjun Bhatia",
        rating: 5,
        date: "18 October 2026",
        title: "Life-changing perspective on true success",
        content: "A masterclass in modern life architecture. It forces you to rethink whether chasing pure monetary gains at the cost of your health or family is worth it.",
        verified: true,
      },
    ],
  },
  {
    id: "B09G9FPHP6",
    name: "Sony WH-1000XM5 Wireless Active Noise Cancelling Headphones",
    category: "Audio & Wearables",
    price: "28,990",
    mrp: "34,990",
    rating: 4.5,
    ratingCount: 11400,
    image: "https://m.media-amazon.com/images/I/61+btxzpfDL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/51SKmu2G9FL._SL1500_.jpg",
    image2: "https://m.media-amazon.com/images/I/71o8Q5XJS5L._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B09G9FPHP6",
    editorBadge: "Audiophile Pick",
    shortDetail: "Dual Processor V1 + QN1 • 8 Microphones Auto NC • 30H Battery • LDAC Hi-Res Audio",
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
    specs: {
      "Noise Cancellation": "Dual Processors (QN1 + V1) with 8 Microphones Auto Optimizer",
      "Battery Life": "Up to 30 Hours (NC On) / 40 Hours (NC Off)",
      "Audio Codecs": "LDAC, AAC, SBC (Hi-Res Audio Wireless Certified)",
      "Multipoint Connection": "Yes, seamless dual-device pairing",
      "Weight": "250g Ultra-Comfortable Soft Fit Leather",
    },
    customerReviews: [
      {
        id: "rev-sony-1",
        author: "Manish Chawla",
        rating: 5,
        date: "22 October 2026",
        title: "Pure silence on long flights",
        content: "The noise cancellation is unmatched. Cabin engine noise simply disappears. The mic quality for Zoom meetings is crystal clear.",
        verified: true,
      },
    ],
  },
  {
    id: "B0C7771Z11",
    name: "OnePlus Nord CE 3 Lite 5G (8GB RAM, 128GB Storage)",
    category: "Mobiles & Tech",
    price: "17,499",
    mrp: "19,999",
    rating: 4.2,
    ratingCount: 48900,
    image: "https://m.media-amazon.com/images/I/61QRgOgBx0L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/71K84j2O8wL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0C7771Z11",
    editorBadge: "Mid-Range Champ",
    shortDetail: "108MP Camera with 3x Lossless Zoom • 67W SUPERVOOC • 5000mAh Battery • 120Hz FHD+",
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
    specs: {
      "Display": "6.72-inch 120Hz Adaptive Refresh FHD+ Display",
      "Processor": "Qualcomm Snapdragon 695 5G",
      "Rear Camera": "108MP Main + 2MP Depth + 2MP Macro",
      "Battery & Charge": "5000 mAh with 67W SUPERVOOC fast charging",
      "Audio": "Dual Stereo Speakers with 200% Ultra Volume Mode",
    },
    customerReviews: [
      {
        id: "rev-oneplus-1",
        author: "Kiran Dev",
        rating: 4,
        date: "10 October 2026",
        title: "67W charging is a lifesaver",
        content: "Plug it in for 20 minutes in the morning and you are good for the entire day. Smooth OxygenOS with zero ad spam.",
        verified: true,
      },
    ],
  },
  {
    id: "B0C9J7SML8",
    name: "Lenovo IdeaPad Slim 3 12th Gen Intel Core i5 Laptop (16GB/512GB)",
    category: "Computers & Tech",
    price: "46,990",
    mrp: "68,990",
    rating: 4.1,
    ratingCount: 6200,
    image: "https://m.media-amazon.com/images/I/61q6x-ll5FL._SL1000_.jpg",
    image1: "https://m.media-amazon.com/images/I/71TPda7cwUL._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0C9J7SML8",
    editorBadge: "Productivity Choice",
    shortDetail: "Intel Core i5-1235U • 16GB DDR4 RAM • 512GB NVMe SSD • 15.6'' FHD Anti-Glare",
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
    specs: {
      "Processor": "12th Gen Intel Core i5-1235U (10 Cores, up to 4.4 GHz)",
      "Memory & Storage": "16GB RAM DDR4-3200 + 512GB SSD M.2 PCIe 4.0",
      "Operating System": "Windows 11 Home + MS Office Home & Student 2021",
      "Display": "15.6-inch FHD (1920x1080) 250 nits Anti-Glare",
      "Battery Life": "Up to 6 Hours with Rapid Charge Boost (2 hours run on 15-min charge)",
    },
    customerReviews: [
      {
        id: "rev-lenovo-1",
        author: "Prateek Ghosh",
        rating: 5,
        date: "05 October 2026",
        title: "Fast, quiet, and handles coding projects effortlessly",
        content: "Boot time is under 7 seconds. 16GB RAM is great for running Docker and multiple VS Code windows together. Best work machine in this price segment.",
        verified: true,
      },
    ],
  },
  {
    id: "B09B8WHR9V",
    name: "Boult Audio Z40 True Wireless Earbuds with 60H Playtime",
    category: "Audio & Wearables",
    price: "999",
    mrp: "4,999",
    rating: 4.0,
    ratingCount: 82300,
    image: "https://m.media-amazon.com/images/I/61y2VVWcGBL._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/51HBom8xz7L._SL1100_.jpg",
    url: "https://www.amazon.in/dp/B09B8WHR9V",
    editorBadge: "Endurance Pick",
    shortDetail: "BoomX 10mm Drivers • 60H Massive Playtime • Zen Quad Mic ENC • 45ms Ultra-Low Latency",
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
    specs: {
      "Battery Playtime": "60 Hours total playtime with Lightning Boult charging",
      "Gaming Mode": "45ms Low Latency Combat Gaming Mode",
      "Driver": "10mm Rich Bass BoomX Tech Drivers",
      "Water Resistance": "IPX5 Sweat & Water Resistant",
      "Connectivity": "Bluetooth 5.3 with Blink & Pair tech",
    },
    customerReviews: [
      {
        id: "rev-boult-1",
        author: "Suraj P.",
        rating: 4,
        date: "14 September 2026",
        title: "Battery simply doesn't die",
        content: "I use it for 3-4 hours daily and charged the case only once in 2 weeks. Bass is deep and punchy.",
        verified: true,
      },
    ],
  },
  {
    id: "B0BHMR195H",
    name: "Noise ColorFit Pulse Grand Smart Watch with 1.69'' HD Display",
    category: "Audio & Wearables",
    price: "1,299",
    mrp: "3,999",
    rating: 4.1,
    ratingCount: 96500,
    image: "https://m.media-amazon.com/images/I/61epn29QG0L._SL1500_.jpg",
    image1: "https://m.media-amazon.com/images/I/61SSVxTSs3L._SL1500_.jpg",
    url: "https://www.amazon.in/dp/B0BHMR195H",
    editorBadge: "Fitness Value",
    shortDetail: "1.69'' Vibrant Curved LCD • 24/7 Heart & SpO2 • 60 Sports Modes • 150+ Watch Faces",
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
    specs: {
      "Display": "1.69-inch Color Curved Display",
      "Health Sensors": "Optical Heart Rate, Blood Oxygen SpO2, Sleep Tracker, Stress Monitor",
      "Sports Modes": "60 Distinct Workout Profiles",
      "Battery Life": "Up to 7 Days typical usage (15 min charge = 1 day backup)",
      "Protection": "IP68 Water & Dust Resistant",
    },
    customerReviews: [
      {
        id: "rev-noise-1",
        author: "Meenakshi Joshi",
        rating: 5,
        date: "25 October 2026",
        title: "Best budget smartwatch for steps and sleep tracking",
        content: "Lightweight and battery lasts easily 5-6 days. The screen is bright outdoors in daylight and sleep tracking is surprisingly accurate.",
        verified: true,
      },
    ],
  },
];

export function getCustomProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("yearnit_custom_products");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Failed to read custom products from localStorage:", err);
  }
  return [];
}

export function getDeletedProductIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("yearnit_deleted_products");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((id: string) => String(id).trim().toUpperCase());
    }
  } catch (err) {
    console.warn("Failed to read deleted product IDs from localStorage:", err);
  }
  return [];
}

export function saveCustomProduct(product: Product): void {
  if (typeof window === "undefined") return;
  const existing = getCustomProducts();
  const cleanId = product.id.trim();
  const filtered = existing.filter((p) => p.id.toUpperCase() !== cleanId.toUpperCase());
  const updated = [{ ...product, id: cleanId }, ...filtered];
  try {
    localStorage.setItem("yearnit_custom_products", JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save custom product to localStorage:", err);
  }

  // Remove from deleted list if it was previously deleted
  const deleted = getDeletedProductIds();
  if (deleted.includes(cleanId.toUpperCase())) {
    const updatedDeleted = deleted.filter((id) => id !== cleanId.toUpperCase());
    try {
      localStorage.setItem("yearnit_deleted_products", JSON.stringify(updatedDeleted));
    } catch (err) {
      console.warn("Failed to update deleted products in localStorage:", err);
    }
  }

  window.dispatchEvent(new Event("catalogUpdated"));
}

export function deleteProduct(productId: string): void {
  if (typeof window === "undefined" || !productId) return;
  const cleanId = productId.trim().toUpperCase();

  // 1. Remove from custom products
  const existing = getCustomProducts();
  const updatedCustom = existing.filter((p) => p.id.toUpperCase() !== cleanId);
  try {
    localStorage.setItem("yearnit_custom_products", JSON.stringify(updatedCustom));
  } catch (err) {
    console.warn("Failed to remove custom product from localStorage:", err);
  }

  // 2. Add to deleted IDs set so curated items are also removed
  const deleted = getDeletedProductIds();
  if (!deleted.includes(cleanId)) {
    const updatedDeleted = [...deleted, cleanId];
    try {
      localStorage.setItem("yearnit_deleted_products", JSON.stringify(updatedDeleted));
    } catch (err) {
      console.warn("Failed to save deleted product to localStorage:", err);
    }
  }

  window.dispatchEvent(new Event("catalogUpdated"));
}

export function removeCustomProduct(productId: string): void {
  deleteProduct(productId);
}

export function restoreProduct(productId: string): void {
  if (typeof window === "undefined" || !productId) return;
  const cleanId = productId.trim().toUpperCase();
  const deleted = getDeletedProductIds();
  const updatedDeleted = deleted.filter((id) => id !== cleanId);
  try {
    localStorage.setItem("yearnit_deleted_products", JSON.stringify(updatedDeleted));
  } catch (err) {
    console.warn("Failed to restore product in localStorage:", err);
  }
  window.dispatchEvent(new Event("catalogUpdated"));
}

export function resetCatalogToDefaults(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("yearnit_deleted_products");
  } catch (err) {
    console.warn("Failed to reset deleted products in localStorage:", err);
  }
  window.dispatchEvent(new Event("catalogUpdated"));
}

export function getAllCatalogProducts(): Product[] {
  const deletedIds = new Set(getDeletedProductIds());
  const custom = getCustomProducts().filter((p) => !deletedIds.has(p.id.toUpperCase()));
  const customIds = new Set(custom.map((p) => p.id.toUpperCase()));
  const defaults = CURATED_PRODUCTS.filter(
    (p) => !customIds.has(p.id.toUpperCase()) && !deletedIds.has(p.id.toUpperCase())
  );
  return [...custom, ...defaults];
}

export function getProductById(id: string): Product | undefined {
  if (!id) return undefined;
  const cleanId = id.trim().toUpperCase();
  return getAllCatalogProducts().find((p) => p.id.toUpperCase() === cleanId);
}

export function getRelatedProducts(productId: string, category?: string, limit: number = 4): Product[] {
  return getAllCatalogProducts().filter((p) => p.id !== productId && (!category || p.category === category)).slice(0, limit);
}

interface SupabaseProductRow {
  id?: string;
  name?: string;
  price?: string | null;
  image?: string;
  image1?: string | null;
  image2?: string | null;
  url?: string;
}

/**
 * Synchronize custom products from Supabase database into local catalog cache
 */
export async function syncProductsFromSupabase(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    let rows: SupabaseProductRow[] | null = data;

    // Fallback to direct REST endpoint if SDK call returns error or null
    if (error || !rows) {
      try {
        const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*&order=created_at.desc`, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        });
        if (res.ok) {
          rows = (await res.json()) as SupabaseProductRow[];
        }
      } catch (restErr) {
        console.warn("Direct REST fallback failed:", restErr);
      }
    }

    if (Array.isArray(rows) && rows.length > 0) {
      const existing = getCustomProducts();
      const existingMap = new Map(existing.map((p) => [p.id.toUpperCase(), p]));
      const deletedIds = new Set(getDeletedProductIds());

      rows.forEach((r: SupabaseProductRow) => {
        if (!r.id || !r.name) return;
        const key = String(r.id).trim().toUpperCase();
        if (deletedIds.has(key)) return;

        const prev = existingMap.get(key);
        existingMap.set(key, {
          id: String(r.id).trim(),
          name: String(r.name).trim(),
          price: r.price ? String(r.price).trim() : (prev?.price || undefined),
          image: String(r.image || prev?.image || "").trim(),
          image1: r.image1 ? String(r.image1).trim() : (prev?.image1 || undefined),
          image2: r.image2 ? String(r.image2).trim() : (prev?.image2 || undefined),
          url: r.url ? String(r.url).trim() : (prev?.url || "https://www.amazon.in"),
          category: prev?.category || "Consumer Electronics",
          editorBadge: prev?.editorBadge,
          shortDetail: prev?.shortDetail,
          summary: prev?.summary,
          pros: prev?.pros,
          cons: prev?.cons,
          whoItsFor: prev?.whoItsFor,
          specs: prev?.specs,
        });
      });

      const merged = Array.from(existingMap.values());
      try {
        localStorage.setItem("yearnit_custom_products", JSON.stringify(merged));
      } catch (e) {
        console.warn("Failed to persist synced products to localStorage:", e);
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("catalogUpdated"));
      }
      return merged;
    }
  } catch (err) {
    console.warn("Notice: Supabase product sync skipped:", err);
  }

  return getCustomProducts();
}

