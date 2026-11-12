import { Product } from "../data/products";

export interface PricePoint {
  date: string;
  displayDate: string;
  shortDate: string;
  price: number;
  label?: string;
  isSaleEvent?: boolean;
}

export type BuyingVerdictType = "BEST_TIME" | "GOOD_TIME" | "WAIT_FOR_SALE";

export interface BuyingAdvice {
  verdict: BuyingVerdictType;
  badgeText: string;
  verdictTitle: string;
  verdictDescription: string;
  buyRating: number;
  ratingLevel: "Excellent" | "Very Good" | "Fair Deal" | "Wait Recommended";
  dropChancePercentage: number;
  dropChanceLabel: "Low (<15%)" | "Moderate (~35%)" | "High (>60%)";
  expectedLowestSalePrice: number;
  savingsVsRegular: number;
  savingsPercentage: number;
  targetPriceAlertSuggestion: number;
  seasonalTrendNote: string;
}

export interface PriceStatistics {
  currentPrice: number;
  mrp: number;
  lowestPrice: number;
  lowestDate: string;
  lowestEvent?: string;
  highestPrice: number;
  highestDate: string;
  highestEvent?: string;
  averagePrice: number;
  diffFromAverage: number;
  diffPercentFromAverage: number;
  diffFromLowest: number;
  diffPercentFromLowest: number;
  diffFromHighest: number;
  totalPoints: number;
}

export interface ProductPriceHistoryResult {
  allPoints: PricePoint[];
  stats: PriceStatistics;
  advice: BuyingAdvice;
}

// In-Memory LRU-Style Cache for Price History (Max 100 entries)
const MAX_CACHE_SIZE = 100;
const priceHistoryCache = new Map<string, ProductPriceHistoryResult>();

/**
 * Parses numeric price value from string or number
 */
export function parsePriceNumber(priceStr?: string | number): number {
  if (typeof priceStr === "number") return priceStr;
  if (!priceStr) return 0;
  const cleaned = priceStr.toString().replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export function formatINR(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

export function formatCompactINR(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(1)}Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  if (val >= 1000) {
    return `₹${(val / 1000).toFixed(1)}k`;
  }
  return `₹${val}`;
}

export function formatChartTick(val: number, range?: number): string {
  if (range && range > 50000) {
    return formatCompactINR(val);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

/**
 * Deterministic pseudo-random number generator seeded with product ID
 */
function createIdRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  return function () {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

/**
 * Common helper to compute aggregate price statistics from a set of points
 */
function calculateStatsFromPoints(
  points: readonly PricePoint[],
  currentPrice: number,
  mrp: number
): PriceStatistics {
  if (!points.length) {
    return {
      currentPrice,
      mrp,
      lowestPrice: currentPrice,
      lowestDate: "Today",
      highestPrice: currentPrice,
      highestDate: "Today",
      averagePrice: currentPrice,
      diffFromAverage: 0,
      diffPercentFromAverage: 0,
      diffFromLowest: 0,
      diffPercentFromLowest: 0,
      diffFromHighest: 0,
      totalPoints: 0,
    };
  }

  let lowest = points[0];
  let highest = points[0];
  let sum = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    sum += p.price;
    if (p.price < lowest.price) lowest = p;
    if (p.price > highest.price) highest = p;
  }

  const averagePrice = Math.round(sum / points.length);
  const diffFromAverage = averagePrice - currentPrice;
  const diffPercentFromAverage = Number(
    (((averagePrice - currentPrice) / averagePrice) * 100).toFixed(1)
  );
  const diffFromLowest = currentPrice - lowest.price;
  const diffPercentFromLowest = Number(
    (((currentPrice - lowest.price) / lowest.price) * 100).toFixed(1)
  );
  const diffFromHighest = highest.price - currentPrice;

  return {
    currentPrice,
    mrp,
    lowestPrice: lowest.price,
    lowestDate: lowest.displayDate,
    lowestEvent: lowest.label,
    highestPrice: highest.price,
    highestDate: highest.displayDate,
    highestEvent: highest.label,
    averagePrice,
    diffFromAverage,
    diffPercentFromAverage,
    diffFromLowest,
    diffPercentFromLowest,
    diffFromHighest,
    totalPoints: points.length,
  };
}

const MILESTONES: readonly {
  readonly daysAgo: number;
  readonly priceMultiplier: number;
  readonly label?: string;
  readonly isSaleEvent?: boolean;
}[] = [
  { daysAgo: 360, priceMultiplier: 1.07, label: "Regular Season" },
  { daysAgo: 340, priceMultiplier: 0.96, label: "Cyber Deal Week", isSaleEvent: true },
  { daysAgo: 325, priceMultiplier: 1.05 },
  { daysAgo: 310, priceMultiplier: 0.98, label: "Year-End Special", isSaleEvent: true },
  { daysAgo: 298, priceMultiplier: 1.06 },
  { daysAgo: 285, priceMultiplier: 0.94, label: "Great Republic Day Sale", isSaleEvent: true },
  { daysAgo: 270, priceMultiplier: 1.04 },
  { daysAgo: 255, priceMultiplier: 1.08, label: "Peak Non-Sale Period" },
  { daysAgo: 240, priceMultiplier: 1.03 },
  { daysAgo: 235, priceMultiplier: 0.97, label: "Holi Special Offer", isSaleEvent: true },
  { daysAgo: 215, priceMultiplier: 1.05 },
  { daysAgo: 205, priceMultiplier: 1.06 },
  { daysAgo: 190, priceMultiplier: 1.04 },
  { daysAgo: 175, priceMultiplier: 0.94, label: "Amazon Summer Sale", isSaleEvent: true },
  { daysAgo: 160, priceMultiplier: 1.03 },
  { daysAgo: 145, priceMultiplier: 1.07 },
  { daysAgo: 125, priceMultiplier: 1.05 },
  { daysAgo: 108, priceMultiplier: 0.93, label: "Amazon Prime Day Sale", isSaleEvent: true },
  { daysAgo: 92,  priceMultiplier: 1.04 },
  { daysAgo: 75,  priceMultiplier: 0.95, label: "Great Freedom Festival", isSaleEvent: true },
  { daysAgo: 60,  priceMultiplier: 1.05 },
  { daysAgo: 45,  priceMultiplier: 1.06, label: "Pre-Festive Stock" },
  { daysAgo: 30,  priceMultiplier: 1.03 },
  { daysAgo: 16,  priceMultiplier: 0.92, label: "Great Indian Festival", isSaleEvent: true },
  { daysAgo: 8,   priceMultiplier: 0.94, label: "Diwali Dhanteras Flash", isSaleEvent: true },
  { daysAgo: 4,   priceMultiplier: 1.02 },
  { daysAgo: 0,   priceMultiplier: 1.00, label: "Current Live Price" },
];

/**
 * Generates or retrieves 365-day realistic price points for a product with in-memory caching
 */
export function getProductPriceHistory(product: Product): ProductPriceHistoryResult {
  const currentPrice = parsePriceNumber(product.price) || 1999;
  let mrp = parsePriceNumber(product.mrp);
  if (!mrp || mrp <= currentPrice) {
    mrp = Math.round(currentPrice * 1.3);
  }

  const cacheKey = `${product.id || product.name}_${currentPrice}_${mrp}`;
  if (priceHistoryCache.has(cacheKey)) {
    return priceHistoryCache.get(cacheKey)!;
  }

  const rand = createIdRandom(product.id || product.name);
  const regularBaseline = Math.round(currentPrice * (1.04 + rand() * 0.05));
  const anchorDate = new Date(2026, 9, 30); // 30 October 2026

  // Build the list of price points
  const points: PricePoint[] = MILESTONES.map((m) => {
    const pointDate = new Date(anchorDate);
    pointDate.setDate(pointDate.getDate() - m.daysAgo);

    let priceValue = currentPrice;
    if (m.daysAgo !== 0) {
      const raw = regularBaseline * m.priceMultiplier;
      priceValue = Math.round(raw / 10) * 10;
      if (priceValue < currentPrice * 0.88) {
        priceValue = Math.round(currentPrice * 0.92);
      }
    }

    const isoDate = pointDate.toISOString().split("T")[0];
    const displayDate = pointDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const shortDate = pointDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    return {
      date: isoDate,
      displayDate,
      shortDate,
      price: priceValue,
      label: m.label,
      isSaleEvent: m.isSaleEvent,
    };
  });

  // Sort ascending by date
  points.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Compute base statistics
  const stats = calculateStatsFromPoints(points, currentPrice, mrp);

  // Determine buying advice and verdict
  let verdict: BuyingVerdictType = "GOOD_TIME";
  let badgeText = "GOOD TIME TO BUY";
  let verdictTitle = "Good Time to Buy — Price Is Below Regular Average";
  let verdictDescription = `Current price of ${formatINR(currentPrice)} is ${formatINR(
    Math.abs(stats.diffFromAverage)
  )} (${Math.abs(stats.diffPercentFromAverage)}%) below the average historical price of ${formatINR(
    stats.averagePrice
  )}.`;
  let buyRating = 8.2;
  let ratingLevel: BuyingAdvice["ratingLevel"] = "Very Good";
  let dropChancePercentage = 22;
  let dropChanceLabel: BuyingAdvice["dropChanceLabel"] = "Low (<15%)";

  if (stats.diffPercentFromLowest <= 2.5 || currentPrice <= stats.lowestPrice) {
    verdict = "BEST_TIME";
    badgeText = "🔥 BEST TIME TO BUY — NEAR ALL-TIME LOW";
    verdictTitle = "Best Time to Buy! Price is Near its Lowest Recorded Level";
    verdictDescription = `Outstanding deal! At ${formatINR(
      currentPrice
    )}, this product is within ${stats.diffPercentFromLowest}% of its all-time lowest price (${formatINR(
      stats.lowestPrice
    )}) recorded during ${stats.lowestEvent || "the festival sale"}. Highly recommended.`;
    buyRating = 9.5;
    ratingLevel = "Excellent";
    dropChancePercentage = 10;
    dropChanceLabel = "Low (<15%)";
  } else if (currentPrice > stats.averagePrice * 1.03) {
    verdict = "WAIT_FOR_SALE";
    badgeText = "⏳ WAIT FOR SALE — PRICE CURRENTLY HIGH";
    verdictTitle = "Consider Waiting — Price is Higher than Average";
    verdictDescription = `The current price (${formatINR(
      currentPrice
    )}) is ${formatINR(
      Math.abs(stats.diffFromAverage)
    )} (${Math.abs(stats.diffPercentFromAverage)}%) higher than typical sale periods (${formatINR(
      stats.averagePrice
    )}). If you don't need it urgently, waiting for an upcoming Amazon sale could save you money.`;
    buyRating = 5.6;
    ratingLevel = "Wait Recommended";
    dropChancePercentage = 75;
    dropChanceLabel = "High (>60%)";
  } else {
    verdict = "GOOD_TIME";
    badgeText = "✅ GOOD TIME TO BUY — BELOW AVERAGE";
    verdictTitle = "Fair Price — Below 90-Day Average";
    verdictDescription = `Current price (${formatINR(
      currentPrice
    )}) is lower than regular retail price (${formatINR(
      regularBaseline
    )}). A stable, sensible buying window with minimal risk of immediate major drop.`;
    buyRating = 8.4;
    ratingLevel = "Very Good";
    dropChancePercentage = 28;
    dropChanceLabel = "Moderate (~35%)";
  }

  const expectedLowestSalePrice = Math.round(stats.lowestPrice * 0.98);
  const savingsVsRegular = Math.max(0, regularBaseline - currentPrice);
  const savingsPercentage = Math.round((savingsVsRegular / regularBaseline) * 100);
  const targetPriceAlertSuggestion = Math.round(stats.lowestPrice * 1.01);

  const seasonalTrendNote =
    "Amazon India historically rolls out deepest discounts on this category during Great Indian Festival (Oct), Amazon Prime Day (July), and Great Republic Day Sale (Jan). Lightning deals occasionally pop up on weekend mornings.";

  const advice: BuyingAdvice = {
    verdict,
    badgeText,
    verdictTitle,
    verdictDescription,
    buyRating,
    ratingLevel,
    dropChancePercentage,
    dropChanceLabel,
    expectedLowestSalePrice,
    savingsVsRegular,
    savingsPercentage,
    targetPriceAlertSuggestion,
    seasonalTrendNote,
  };

  const result: ProductPriceHistoryResult = {
    allPoints: points,
    stats,
    advice,
  };

  // Cache result with eviction if over limit
  if (priceHistoryCache.size >= MAX_CACHE_SIZE) {
    const firstKey = priceHistoryCache.keys().next().value;
    if (firstKey) priceHistoryCache.delete(firstKey);
  }
  priceHistoryCache.set(cacheKey, result);

  return result;
}

/**
 * Filter price points by selected timeframe:
 * '1M' (30 days), '3M' (90 days), '6M' (180 days), '1Y' (365 days), 'ALL'
 */
export function filterPointsByTimeframe(
  points: PricePoint[],
  timeframe: "1M" | "3M" | "6M" | "1Y" | "ALL"
): PricePoint[] {
  if (timeframe === "ALL" || timeframe === "1Y") {
    return points;
  }

  let days = 90;
  if (timeframe === "1M") days = 30;
  else if (timeframe === "3M") days = 90;
  else if (timeframe === "6M") days = 180;

  const anchorDate = new Date(2026, 9, 30);
  const cutoffTime = new Date(anchorDate).setDate(anchorDate.getDate() - days);

  const filtered = points.filter((p) => new Date(p.date).getTime() >= cutoffTime);

  // Guarantee at least first & current point exist
  if (filtered.length < 2 && points.length >= 2) {
    return points.slice(-Math.min(points.length, 6));
  }

  return filtered;
}

/**
 * Recomputes stats for a filtered subset of points.
 */
export function computeStatsForSubset(
  filtered: PricePoint[],
  currentPrice: number,
  mrp: number
): PriceStatistics {
  return calculateStatsFromPoints(filtered, currentPrice, mrp);
}
