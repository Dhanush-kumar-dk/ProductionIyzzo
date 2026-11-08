import { Product } from "../data/products";

export interface PricePoint {
  date: string; // ISO date 'YYYY-MM-DD'
  displayDate: string; // e.g. "18 Oct 2026"
  shortDate: string; // e.g. "18 Oct"
  price: number;
  label?: string; // e.g. "Great Indian Festival", "Prime Day Deal", "Flash Deal"
  isSaleEvent?: boolean;
}

export type BuyingVerdictType = "BEST_TIME" | "GOOD_TIME" | "WAIT_FOR_SALE";

export interface BuyingAdvice {
  verdict: BuyingVerdictType;
  badgeText: string;
  verdictTitle: string;
  verdictDescription: string;
  buyRating: number; // 1 to 10
  ratingLevel: "Excellent" | "Very Good" | "Moderate" | "Wait Recommended";
  dropChancePercentage: number; // probability of drop in next 30 days
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

// Clean number parser for Indian formatted currency strings (e.g. "46,990" -> 46990)
export function parsePriceNumber(priceStr?: string | number): number {
  if (typeof priceStr === "number") return priceStr;
  if (!priceStr) return 0;
  const cleaned = priceStr.toString().replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned, 10) : 0;
}

// Format currency in Indian numbering format (e.g. 46990 -> ₹46,990)
export function formatINR(val: number): string {
  if (isNaN(val)) return "₹0";
  return "₹" + Math.round(val).toLocaleString("en-IN");
}

// Format compact currency (e.g. 46990 -> ₹47k, but preserves full detail for smaller amounts)
export function formatCompactINR(val: number): string {
  if (isNaN(val)) return "₹0";
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 10000) {
    const k = val / 1000;
    return k % 1 === 0 ? `₹${k}k` : `₹${k.toFixed(1)}k`;
  }
  return formatINR(val);
}

// Dedicated chart tick formatter ensuring no two adjacent ticks get truncated to the same string
export function formatChartTick(val: number, range?: number): string {
  if (isNaN(val)) return "₹0";
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  // If the total price range is small or prices are under 10k, show full clean format (e.g. ₹950, ₹1,050)
  if (!range || range < 20000 || val < 10000) {
    return formatINR(val);
  }
  const k = val / 1000;
  return k % 1 === 0 ? `₹${k}k` : `₹${k.toFixed(1)}k`;
}

// Seeded pseudorandom generator based on product ID string
function createIdRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let s = Math.abs(hash) || 123456789;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generates or retrieves 365-day realistic price points for a product.
 * Uses a deterministic hash of product.id so data is consistent across page refreshes.
 */
export function getProductPriceHistory(product: Product): ProductPriceHistoryResult {
  const currentPrice = parsePriceNumber(product.price) || 1999;
  let mrp = parsePriceNumber(product.mrp);
  if (!mrp || mrp <= currentPrice) {
    mrp = Math.round(currentPrice * 1.3);
  }

  const rand = createIdRandom(product.id || product.name);

  // Baseline "regular" non-sale price is typically 3% to 8% above current deal price
  const regularBaseline = Math.round(currentPrice * (1.04 + rand() * 0.05));

  // Anchor date: 30 October 2026
  const anchorDate = new Date(2026, 9, 30); // Months are 0-indexed: 9 = Oct

  // Timeline anchors for 365 days: define specific calendar checkpoints
  // Days ago from Oct 30, 2026:
  // - Day 360: Nov 4, 2025 (Early Nov)
  // - Day 340: Nov 24, 2025 (Black Friday / Cyber Week)
  // - Day 310: Dec 24, 2025 (Year-End Christmas Deal)
  // - Day 285: Jan 18, 2026 (Great Republic Day Sale)
  // - Day 255: Feb 17, 2026 (Regular)
  // - Day 235: Mar 09, 2026 (Holi Festival Offer)
  // - Day 205: Apr 08, 2026 (Spring Regular)
  // - Day 175: May 08, 2026 (Great Summer Sale)
  // - Day 145: Jun 07, 2026 (Monsoon Kickoff)
  // - Day 108: Jul 14, 2026 (Amazon Prime Day Sale)
  // - Day 75:  Aug 16, 2026 (Great Freedom Festival Sale)
  // - Day 45:  Sep 15, 2026 (Pre-Diwali Warm-up)
  // - Day 16:  Oct 14, 2026 (Amazon Great Indian Festival Sale - Lowest dip)
  // - Day 8:   Oct 22, 2026 (Diwali Flash Deal)
  // - Day 4:   Oct 26, 2026 (Post-Sale Regular)
  // - Day 0:   Oct 30, 2026 (Today - Active Price)

  const milestones: {
    daysAgo: number;
    priceMultiplier: number;
    label?: string;
    isSaleEvent?: boolean;
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

  // Build the list of price points
  const points: PricePoint[] = milestones.map((m) => {
    const pointDate = new Date(anchorDate);
    pointDate.setDate(pointDate.getDate() - m.daysAgo);

    let priceValue = currentPrice;
    if (m.daysAgo === 0) {
      priceValue = currentPrice;
    } else {
      // Calculate realistic price around baseline
      const raw = regularBaseline * m.priceMultiplier;
      // Round to clean 10 or 50 or 99 format
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

  // Compute statistics across 365 days
  let lowestPoint = points[0];
  let highestPoint = points[0];
  let sum = 0;

  points.forEach((p) => {
    sum += p.price;
    if (p.price < lowestPoint.price) lowestPoint = p;
    if (p.price > highestPoint.price) highestPoint = p;
  });

  // Ensure current price isn't artificially higher than lowest if it's already a bargain
  if (currentPrice < lowestPoint.price) {
    lowestPoint = points[points.length - 1];
  }

  const averagePrice = Math.round(sum / points.length);
  const diffFromAverage = averagePrice - currentPrice;
  const diffPercentFromAverage = Number(
    (((averagePrice - currentPrice) / averagePrice) * 100).toFixed(1)
  );
  const diffFromLowest = currentPrice - lowestPoint.price;
  const diffPercentFromLowest = Number(
    (((currentPrice - lowestPoint.price) / lowestPoint.price) * 100).toFixed(1)
  );
  const diffFromHighest = highestPoint.price - currentPrice;

  // Determine buying advice and verdict
  let verdict: BuyingVerdictType = "GOOD_TIME";
  let badgeText = "GOOD TIME TO BUY";
  let verdictTitle = "Good Time to Buy — Price Is Below Regular Average";
  let verdictDescription = `Current price of ${formatINR(currentPrice)} is ${formatINR(
    Math.abs(diffFromAverage)
  )} (${Math.abs(diffPercentFromAverage)}%) below the average historical price of ${formatINR(
    averagePrice
  )}.`;
  let buyRating = 8.2;
  let ratingLevel: BuyingAdvice["ratingLevel"] = "Very Good";
  let dropChancePercentage = 22;
  let dropChanceLabel: BuyingAdvice["dropChanceLabel"] = "Low (<15%)";

  if (diffPercentFromLowest <= 2.5 || currentPrice <= lowestPoint.price) {
    verdict = "BEST_TIME";
    badgeText = "🔥 BEST TIME TO BUY — NEAR ALL-TIME LOW";
    verdictTitle = "Best Time to Buy! Price is Near its Lowest Recorded Level";
    verdictDescription = `Outstanding deal! At ${formatINR(
      currentPrice
    )}, this product is within ${diffPercentFromLowest}% of its all-time lowest price (${formatINR(
      lowestPoint.price
    )}) recorded during ${lowestPoint.label || "the festival sale"}. Highly recommended.`;
    buyRating = 9.5;
    ratingLevel = "Excellent";
    dropChancePercentage = 10;
    dropChanceLabel = "Low (<15%)";
  } else if (currentPrice > averagePrice * 1.03) {
    verdict = "WAIT_FOR_SALE";
    badgeText = "⏳ WAIT FOR SALE — PRICE CURRENTLY HIGH";
    verdictTitle = "Consider Waiting — Price is Higher than Average";
    verdictDescription = `The current price (${formatINR(
      currentPrice
    )}) is ${formatINR(
      Math.abs(diffFromAverage)
    )} (${Math.abs(diffPercentFromAverage)}%) higher than typical sale periods (${formatINR(
      averagePrice
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

  const expectedLowestSalePrice = Math.round(lowestPoint.price * 0.98);
  const savingsVsRegular = Math.max(0, regularBaseline - currentPrice);
  const savingsPercentage = Math.round((savingsVsRegular / regularBaseline) * 100);
  const targetPriceAlertSuggestion = Math.round(lowestPoint.price * 1.01);

  const seasonalTrendNote =
    "Amazon India historically rolls out deepest discounts on this category during Great Indian Festival (Oct), Amazon Prime Day (July), and Great Republic Day Sale (Jan). Lightning deals occasionally pop up on weekend mornings.";

  const stats: PriceStatistics = {
    currentPrice,
    mrp,
    lowestPrice: lowestPoint.price,
    lowestDate: lowestPoint.displayDate,
    lowestEvent: lowestPoint.label,
    highestPrice: highestPoint.price,
    highestDate: highestPoint.displayDate,
    highestEvent: highestPoint.label,
    averagePrice,
    diffFromAverage,
    diffPercentFromAverage,
    diffFromLowest,
    diffPercentFromLowest,
    diffFromHighest,
    totalPoints: points.length,
  };

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

  return {
    allPoints: points,
    stats,
    advice,
  };
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
  if (!filtered.length) {
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

  let lowest = filtered[0];
  let highest = filtered[0];
  let sum = 0;

  filtered.forEach((p) => {
    sum += p.price;
    if (p.price < lowest.price) lowest = p;
    if (p.price > highest.price) highest = p;
  });

  const averagePrice = Math.round(sum / filtered.length);
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
    totalPoints: filtered.length,
  };
}
