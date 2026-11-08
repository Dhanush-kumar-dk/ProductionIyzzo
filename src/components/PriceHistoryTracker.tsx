import { useState, useMemo, useRef, useEffect } from "react";
import { Product } from "../data/products";
import { buildAffiliateUrl } from "../utils/affiliate";
import {
  getProductPriceHistory,
  filterPointsByTimeframe,
  computeStatsForSubset,
  formatINR,
  formatCompactINR,
  formatChartTick,
} from "../utils/priceHistory";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CheckBadgeIcon,
  ClockIcon,
  SparklesIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
  CalendarIcon,
  XMarkIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowDownIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";

interface PriceHistoryTrackerProps {
  product: Product;
}

type TimeframeType = "1M" | "3M" | "6M" | "1Y" | "ALL";
type ChartModeType = "smooth" | "stepped";

interface StoredAlert {
  productId: string;
  targetPrice: number;
  email: string;
  createdAt: string;
}

// Monotone Cubic Hermite Spline (Fritsch-Carlson algorithm)
// Guarantees zero artificial overshoot at peaks and valleys
function getMonotoneSplinePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (n === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  // 1. Calculate secants (slopes between consecutive points)
  const dx: number[] = [];
  const dy: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dX = points[i + 1].x - points[i].x;
    const dY = points[i + 1].y - points[i].y;
    dx.push(dX);
    dy.push(dY);
    m.push(dY / (dX || 1e-6));
  }

  // 2. Calculate monotone tangents (flat at local extrema to prevent overshooting)
  const tangents: number[] = [];
  tangents.push(m[0]);
  for (let i = 1; i < n - 1; i++) {
    if (m[i - 1] * m[i] <= 0) {
      tangents.push(0); // Flat peak or trough
    } else {
      const w1 = 2 * dx[i] + dx[i - 1];
      const w2 = dx[i] + 2 * dx[i - 1];
      tangents.push((w1 + w2) / (w1 / m[i - 1] + w2 / m[i]));
    }
  }
  tangents.push(m[n - 2]);

  // 3. Build smooth Cubic Bezier path
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segDx = dx[i];
    const cp1x = p1.x + segDx / 3;
    const cp1y = p1.y + (tangents[i] * segDx) / 3;
    const cp2x = p2.x - segDx / 3;
    const cp2y = p2.y - (tangents[i + 1] * segDx) / 3;
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

// Stepped / Discrete Amazon Price Changes (Keepa & CamelCamelCamel style)
function getSteppedPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p2 = points[i + 1];
    path += ` H ${p2.x.toFixed(1)} V ${p2.y.toFixed(1)}`;
  }
  return path;
}

export default function PriceHistoryTracker({ product }: PriceHistoryTrackerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>("3M");
  const [chartMode, setChartMode] = useState<ChartModeType>("smooth");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeAlert, setActiveAlert] = useState<StoredAlert | null>(null);
  const [alertTargetPrice, setAlertTargetPrice] = useState<string>("");
  const [alertEmail, setAlertEmail] = useState<string>("");
  const [alertSuccessMsg, setAlertSuccessMsg] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // 1. Generate full 365-day deterministic price history
  const historyData = useMemo(() => {
    return getProductPriceHistory(product);
  }, [product]);

  // 2. Filter points based on selected timeframe
  const displayPoints = useMemo(() => {
    return filterPointsByTimeframe(historyData.allPoints, selectedTimeframe);
  }, [historyData.allPoints, selectedTimeframe]);

  // 3. Recompute stats for the active timeframe
  const activeStats = useMemo(() => {
    return computeStatsForSubset(
      displayPoints,
      historyData.stats.currentPrice,
      historyData.stats.mrp
    );
  }, [displayPoints, historyData.stats.currentPrice, historyData.stats.mrp]);

  const advice = historyData.advice;
  const affiliateUrl = buildAffiliateUrl(product.url);

  // Load existing price alert from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`yearnit_alert_${product.id}`);
      if (stored) {
        const parsed: StoredAlert = JSON.parse(stored);
        setActiveAlert(parsed);
        setAlertTargetPrice(parsed.targetPrice.toString());
        setAlertEmail(parsed.email);
      } else {
        setActiveAlert(null);
        setAlertTargetPrice(Math.round(historyData.stats.lowestPrice * 1.02).toString());
      }
    } catch (err) {
      console.warn("Could not load price alert:", err);
    }
  }, [product.id, historyData.stats.lowestPrice]);

  // Handle setting a new price alert
  const handleSaveAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(alertTargetPrice.replace(/[^0-9]/g, ""), 10);
    if (!target || target <= 0) return;

    const email = alertEmail.trim() || "shopper@yearnit.in";
    const alertData: StoredAlert = {
      productId: product.id,
      targetPrice: target,
      email,
      createdAt: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    try {
      localStorage.setItem(`yearnit_alert_${product.id}`, JSON.stringify(alertData));
      setActiveAlert(alertData);
      setAlertSuccessMsg(`Price drop alert set for ${formatINR(target)}! We'll track it 24/7.`);
      setShowAlertModal(false);
      setTimeout(() => setAlertSuccessMsg(null), 5000);
    } catch (err) {
      console.warn("Could not save price alert:", err);
    }
  };

  const handleRemoveAlert = () => {
    try {
      localStorage.removeItem(`yearnit_alert_${product.id}`);
      setActiveAlert(null);
      setAlertSuccessMsg("Price alert removed.");
      setTimeout(() => setAlertSuccessMsg(null), 4000);
    } catch (err) {
      console.warn("Could not remove alert:", err);
    }
  };

  // --- SVG Chart Dimensions & Coordinates ---
  // Gutter right: 78px to reserve clean space for benchmark scale tags (e.g. Avg: ₹775)
  const chartWidth = 880;
  const chartHeight = 330;
  const padding = { top: 32, right: 80, bottom: 44, left: 66 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Compute clean Y-scale limits with natural headroom & floor room
  const prices = displayPoints.map((p) => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const priceRange = maxP - minP || 500;

  // Snap to clean 25/50 rupee boundaries
  const yMin = Math.max(0, Math.floor((minP - priceRange * 0.15) / 25) * 25);
  const yMax = Math.ceil((maxP + priceRange * 0.15) / 25) * 25;
  const yDomain = yMax - yMin || 1;

  // 5 cleanly distributed Y-ticks with distinct unique labels
  const yTicks = useMemo(() => {
    const count = 5;
    const ticks = [];
    for (let i = 0; i < count; i++) {
      const pct = i / (count - 1);
      const yVal = padding.top + pct * plotHeight;
      const priceVal = Math.round(yMax - pct * yDomain);
      ticks.push({
        pct,
        yVal,
        priceVal,
        label: formatChartTick(priceVal, yDomain),
      });
    }
    return ticks;
  }, [padding.top, plotHeight, yMax, yDomain]);

  // Map data points to SVG coordinates
  const coords = useMemo(() => {
    const total = displayPoints.length;
    return displayPoints.map((pt, idx) => {
      const x = padding.left + (idx / Math.max(1, total - 1)) * plotWidth;
      const y = padding.top + ((yMax - pt.price) / yDomain) * plotHeight;
      return { x, y, pt };
    });
  }, [displayPoints, plotWidth, plotHeight, padding.left, padding.top, yMax, yDomain]);

  // Build the active curve path (monotone spline vs stepped)
  const linePath = useMemo(() => {
    if (coords.length === 0) return "";
    return chartMode === "smooth"
      ? getMonotoneSplinePath(coords)
      : getSteppedPath(coords);
  }, [coords, chartMode]);

  // Build enclosed SVG path for gradient area fill
  const areaPath = useMemo(() => {
    if (!linePath || coords.length === 0) return "";
    const firstX = coords[0].x;
    const lastX = coords[coords.length - 1].x;
    const bottomY = padding.top + plotHeight;
    return `${linePath} L ${lastX.toFixed(1)} ${bottomY.toFixed(1)} L ${firstX.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }, [linePath, coords, padding.top, plotHeight]);

  // Average price Y coordinate on chart
  const avgY = padding.top + ((yMax - activeStats.averagePrice) / yDomain) * plotHeight;

  // Identify index of lowest and highest point
  const lowestIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < displayPoints.length; i++) {
      if (displayPoints[i].price < displayPoints[best].price) best = i;
    }
    return best;
  }, [displayPoints]);

  const highestIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < displayPoints.length; i++) {
      if (displayPoints[i].price > displayPoints[best].price) best = i;
    }
    return best;
  }, [displayPoints]);

  // Interactive scrubber on pointer move / touch
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = chartWidth / rect.width;
    const svgX = clientX * scaleX;

    let closestIndex = 0;
    let minDistance = Infinity;

    coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - svgX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = idx;
      }
    });

    setHoveredIndex(closestIndex);
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  const activePoint = hoveredIndex !== null ? coords[hoveredIndex] : null;

  // Current active display price (either hovered checkpoint or live current price)
  const currentActivePrice = activePoint ? activePoint.pt.price : activeStats.currentPrice;
  const currentActiveDiffFromAvg = activeStats.averagePrice - currentActivePrice;
  const discountPercent =
    activeStats.mrp > activeStats.currentPrice
      ? Math.round(((activeStats.mrp - activeStats.currentPrice) / activeStats.mrp) * 100)
      : 0;

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] border border-slate-200/80 mb-8 font-poppins text-slate-900 transition-all">
      {/* =========================================================================
          1. HEADER & ACTION TOOLBAR
         ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 mb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 rounded-full text-[11px] font-bold text-amber-900 mb-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Price Tracking & Buyer Intelligence</span>
            <span className="text-amber-300">•</span>
            <span className="text-slate-600 font-semibold">Amazon India Verified</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight flex items-center gap-2.5">
            <span>Price History & Best Time to Buy</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Continuous Amazon India price monitoring. Tracks 365-day fluctuations, verified record lows, and algorithmic buying recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {activeAlert ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
              <BellAlertIcon className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>Alert: {formatINR(activeAlert.targetPrice)}</span>
              <button
                type="button"
                onClick={handleRemoveAlert}
                className="text-slate-400 hover:text-rose-600 text-xs font-semibold ml-1 underline transition"
                title="Remove price alert"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAlertModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-xs transition hover:scale-[1.02] active:scale-[0.98]"
            >
              <BellAlertIcon className="w-4 h-4 text-amber-400" />
              <span>Set Price Drop Alert</span>
            </button>
          )}

          <a
            href={affiliateUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-slate-950 font-black text-xs rounded-xl shadow-xs border border-[#FCD200] transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBagIcon className="w-4 h-4" />
            <span>Buy at {formatINR(activeStats.currentPrice)}</span>
          </a>
        </div>
      </div>

      {/* Alert Notification Toast */}
      {alertSuccessMsg && (
        <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{alertSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertSuccessMsg(null)}
            className="p-1 rounded-lg text-emerald-700 hover:bg-emerald-100 transition"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          2. "SHOULD YOU BUY NOW?" VERDICT CARD (ALGORITHMIC SCORE)
         ========================================================================= */}
      <div
        className={`rounded-2xl p-4 sm:p-6 mb-6 border transition-all ${
          advice.verdict === "BEST_TIME"
            ? "bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-emerald-100/40 border-emerald-200 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.12)]"
            : advice.verdict === "GOOD_TIME"
            ? "bg-gradient-to-r from-blue-50/80 via-sky-50/50 to-indigo-50/40 border-blue-200 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.12)]"
            : "bg-gradient-to-r from-amber-50/80 via-yellow-50/50 to-orange-50/40 border-amber-200 shadow-[0_4px_20px_-4px_rgba(245,158,11,0.12)]"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase shadow-2xs ${
                  advice.verdict === "BEST_TIME"
                    ? "bg-emerald-600 text-white"
                    : advice.verdict === "GOOD_TIME"
                    ? "bg-blue-600 text-white"
                    : "bg-amber-500 text-slate-950"
                }`}
              >
                {advice.verdict === "BEST_TIME" ? (
                  <CheckBadgeIcon className="w-4 h-4 text-emerald-200" />
                ) : advice.verdict === "GOOD_TIME" ? (
                  <CheckCircleIcon className="w-4 h-4 text-blue-200" />
                ) : (
                  <ClockIcon className="w-4 h-4 text-slate-950" />
                )}
                <span>{advice.badgeText}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
                <span>Verified Historical Record</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
              {advice.verdictTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {advice.verdictDescription}
            </p>
          </div>

          {/* Buy Rating Score & Drop Chance Box */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-5 flex-shrink-0 min-w-[260px] justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Buy Score
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  {advice.buyRating}
                </span>
                <span className="text-xs text-slate-400 font-bold">/ 10</span>
              </div>
              <span
                className={`text-[11px] font-bold ${
                  advice.buyRating >= 8.5
                    ? "text-emerald-700"
                    : advice.buyRating >= 7
                    ? "text-blue-700"
                    : "text-amber-700"
                }`}
              >
                {advice.ratingLevel}
              </span>
            </div>

            <div className="text-right border-l border-slate-100 pl-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Drop Probability
              </span>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-lg sm:text-xl font-black text-slate-900">
                  {advice.dropChancePercentage}%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                {advice.dropChanceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. KEY PRICE METRIC CARDS (CLEAN FINTECH DESIGN)
         ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* 1. Current Price */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:border-slate-300 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Current Price
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 border border-emerald-200/60 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700">Live</span>
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 tracking-tight">
            {formatINR(activeStats.currentPrice)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 flex-wrap">
            {discountPercent > 0 ? (
              <>
                <span className="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-black tracking-wide">
                  {discountPercent}% OFF
                </span>
                <span className="text-[11px] text-slate-400 font-medium line-through">
                  {formatINR(activeStats.mrp)}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-slate-500 font-semibold">Amazon Direct Offer</span>
            )}
          </div>
        </div>

        {/* 2. Lowest Price */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/90 shadow-[0_2px_12px_-3px_rgba(16,185,129,0.08)] hover:border-emerald-300 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Lowest Price
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ArrowTrendingDownIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700 tracking-tight">
            {formatINR(activeStats.lowestPrice)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-800 font-medium truncate" title={activeStats.lowestDate}>
            <span>on {activeStats.lowestDate}</span>
          </div>
        </div>

        {/* 3. Average Price */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-blue-200/90 shadow-[0_2px_12px_-3px_rgba(59,130,246,0.08)] hover:border-blue-300 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Average Price
            </span>
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-blue-950 tracking-tight">
            {formatINR(activeStats.averagePrice)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold">
            {activeStats.diffFromAverage > 0 ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-700">
                <ArrowDownIcon className="w-3 h-3" />
                <span>{formatINR(activeStats.diffFromAverage)} lower than avg</span>
              </span>
            ) : (
              <span className="text-amber-800">
                +{formatINR(Math.abs(activeStats.diffFromAverage))} higher than avg
              </span>
            )}
          </div>
        </div>

        {/* 4. Highest Recorded Price */}
        <div className="group bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/90 shadow-[0_2px_12px_-3px_rgba(245,158,11,0.08)] hover:border-amber-300 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              Highest Price
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-950 tracking-tight">
            {formatINR(activeStats.highestPrice)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-900 font-medium truncate" title={activeStats.highestDate}>
            <span>on {activeStats.highestDate}</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. REDESIGNED INTERACTIVE PRICE FLUCTUATION GRAPH CARD
         ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm mb-6">
        {/* Dynamic Real-Time Scrubber Header & Controls Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {activePoint ? "Historical Point Inspection" : "Price Fluctuation Curve"}
              </span>

              {activePoint?.pt.isSaleEvent && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black">
                  <BoltIcon className="w-3 h-3 text-amber-600" />
                  <span>{activePoint.pt.label || "Festival Sale Deal"}</span>
                </span>
              )}

              {!activePoint && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                  <span>{displayPoints.length} verified checks</span>
                </span>
              )}

              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-semibold text-slate-500">
                {activePoint ? activePoint.pt.displayDate : "Amazon India Verified Record"}
              </span>
            </div>

            {/* Dynamic Value Display */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                {formatINR(currentActivePrice)}
              </span>

              <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                {currentActiveDiffFromAvg > 0 ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-black">
                    <ArrowDownIcon className="w-3.5 h-3.5" />
                    <span>
                      {formatINR(currentActiveDiffFromAvg)} (
                      {Math.round((currentActiveDiffFromAvg / activeStats.averagePrice) * 100)}%) below 90-day avg
                    </span>
                  </span>
                ) : currentActiveDiffFromAvg < 0 ? (
                  <span className="inline-flex items-center gap-1 text-amber-800 font-black">
                    <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                    <span>
                      +{formatINR(Math.abs(currentActiveDiffFromAvg))} (
                      {Math.round((Math.abs(currentActiveDiffFromAvg) / activeStats.averagePrice) * 100)}%) above 90-day avg
                    </span>
                  </span>
                ) : (
                  <span className="text-blue-700 font-bold">Exact 90-day average baseline</span>
                )}

                {currentActivePrice <= activeStats.lowestPrice && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide uppercase">
                    Record Low Deal
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls: Smooth/Stepped View Mode & Segmented Timeframe Switcher */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-auto">
            {/* View Mode Switcher */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs font-bold shadow-2xs">
              <button
                type="button"
                onClick={() => setChartMode("smooth")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === "smooth"
                    ? "bg-white text-slate-950 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Monotone financial curve (smooth & natural)"
              >
                Curve
              </button>
              <button
                type="button"
                onClick={() => setChartMode("stepped")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  chartMode === "stepped"
                    ? "bg-white text-slate-950 shadow-2xs font-black"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Stepped price history (Keepa & CamelCamelCamel style)"
              >
                Stepped
              </button>
            </div>

            {/* Timeframe Selector */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70 text-xs font-bold shadow-2xs">
              {(
                [
                  { id: "1M", label: "1 Month" },
                  { id: "3M", label: "3 Months" },
                  { id: "6M", label: "6 Months" },
                  { id: "1Y", label: "1 Year" },
                  { id: "ALL", label: "All Time" },
                ] as const
              ).map((tf) => (
                <button
                  key={tf.id}
                  type="button"
                  onClick={() => {
                    setSelectedTimeframe(tf.id);
                    setHoveredIndex(null);
                  }}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${
                    selectedTimeframe === tf.id
                      ? "bg-slate-950 text-white shadow-2xs font-black"
                      : "text-slate-500 hover:text-slate-950 hover:bg-white/50"
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* The SVG Canvas Container */}
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] max-h-[380px] select-none touch-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <defs>
              {/* Premium Multi-stop Area Gradient */}
              <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.20" />
                <stop offset="60%" stopColor="#059669" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
              </linearGradient>

              {/* Curve Stroke Gradient */}
              <linearGradient id="priceLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563EB" />
                <stop offset="65%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              {/* Shaded Bargain Zone Gradient (Below Average) */}
              <linearGradient id="bargainZoneGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.07" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.01" />
              </linearGradient>

              {/* Glow Filter for Curve Line */}
              <filter id="curveGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#10B981" floodOpacity="0.25" />
              </filter>

              {/* Soft Drop Shadow for Scale Tags */}
              <filter id="tagShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.14" />
              </filter>
            </defs>

            {/* Shaded Bargain Zone: Visually marks the below-average price region */}
            {avgY < padding.top + plotHeight && (
              <g>
                <rect
                  x={padding.left}
                  y={avgY}
                  width={plotWidth}
                  height={padding.top + plotHeight - avgY}
                  fill="url(#bargainZoneGrad)"
                />
                <text
                  x={padding.left + 8}
                  y={avgY + 13}
                  fontSize="8.5"
                  fill="#059669"
                  fontFamily="Poppins, sans-serif"
                  fontWeight="700"
                  opacity="0.8"
                >
                  ↓ Bargain Territory (Below 90-Day Avg)
                </text>
              </g>
            )}

            {/* Background Horizontal Gridlines and Distinct Y-Ticks */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.yVal}
                  x2={padding.left + plotWidth}
                  y2={tick.yVal}
                  stroke="#F1F5F9"
                  strokeWidth="1.2"
                  strokeDasharray={i === 0 || i === yTicks.length - 1 ? "" : "4 5"}
                />
                <text
                  x={padding.left - 12}
                  y={tick.yVal + 3.5}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94A3B8"
                  fontFamily="Poppins, sans-serif"
                  fontWeight="600"
                >
                  {tick.label}
                </text>
              </g>
            ))}

            {/* Average Price Benchmark Line (Spans plotWidth) */}
            {avgY >= padding.top && avgY <= padding.top + plotHeight && (
              <g>
                <line
                  x1={padding.left}
                  y1={avgY}
                  x2={padding.left + plotWidth}
                  y2={avgY}
                  stroke="#6366F1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.85"
                />
                {/* Benchmark Tag in Right Scale Gutter (NEVER intersects curve) */}
                <g filter="url(#tagShadow)">
                  <polygon
                    points={`${padding.left + plotWidth + 1},${avgY} ${padding.left + plotWidth + 6},${avgY - 4} ${padding.left + plotWidth + 6},${avgY + 4}`}
                    fill="#4F46E5"
                  />
                  <rect
                    x={padding.left + plotWidth + 6}
                    y={avgY - 10}
                    width="66"
                    height="20"
                    rx="5"
                    fill="#4F46E5"
                  />
                  <text
                    x={padding.left + plotWidth + 39}
                    y={avgY + 3.5}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#FFFFFF"
                    fontFamily="Poppins, sans-serif"
                    fontWeight="800"
                  >
                    Avg: {formatINR(activeStats.averagePrice)}
                  </text>
                </g>
              </g>
            )}

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#priceAreaGrad)" />}

            {/* Glowing Price Line (Monotone Spline or Stepped) */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#priceLineGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#curveGlow)"
              />
            )}

            {/* All-Time Low Marker & Vertical Guideline (Cleanly Elevated) */}
            {coords[lowestIdx] && (
              <g>
                {/* Vertical hairline to date axis */}
                <line
                  x1={coords[lowestIdx].x}
                  y1={coords[lowestIdx].y + 6}
                  x2={coords[lowestIdx].x}
                  y2={padding.top + plotHeight}
                  stroke="#10B981"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.65"
                />
                {/* Concentric Point Halo */}
                <circle
                  cx={coords[lowestIdx].x}
                  cy={coords[lowestIdx].y}
                  r="8.5"
                  fill="#10B981"
                  fillOpacity="0.25"
                />
                <circle
                  cx={coords[lowestIdx].x}
                  cy={coords[lowestIdx].y}
                  r="5"
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
                {/* Connecting Pin Stem & Elevated Pill Badge */}
                <line
                  x1={coords[lowestIdx].x}
                  y1={coords[lowestIdx].y - 5}
                  x2={coords[lowestIdx].x}
                  y2={coords[lowestIdx].y - 18}
                  stroke="#059669"
                  strokeWidth="1.5"
                />
                <g filter="url(#tagShadow)">
                  <rect
                    x={Math.max(padding.left + 5, Math.min(coords[lowestIdx].x - 46, padding.left + plotWidth - 98))}
                    y={Math.max(padding.top + 4, coords[lowestIdx].y - 36)}
                    width="92"
                    height="20"
                    rx="10"
                    fill="#065F46"
                    stroke="#047857"
                    strokeWidth="1"
                  />
                  <text
                    x={Math.max(padding.left + 5, Math.min(coords[lowestIdx].x - 46, padding.left + plotWidth - 98)) + 46}
                    y={Math.max(padding.top + 4, coords[lowestIdx].y - 36) + 13.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9.5"
                    fontFamily="Poppins, sans-serif"
                    fontWeight="800"
                  >
                    ★ Low: {formatINR(activeStats.lowestPrice)}
                  </text>
                </g>
              </g>
            )}

            {/* Highest Price Dot */}
            {coords[highestIdx] && highestIdx !== lowestIdx && (
              <g>
                <circle
                  cx={coords[highestIdx].x}
                  cy={coords[highestIdx].y}
                  r="7.5"
                  fill="#F59E0B"
                  fillOpacity="0.25"
                />
                <circle
                  cx={coords[highestIdx].x}
                  cy={coords[highestIdx].y}
                  r="4.5"
                  fill="#D97706"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Current Price Dot (Rightmost point) */}
            {coords[coords.length - 1] && (
              <g>
                <circle
                  cx={coords[coords.length - 1].x}
                  cy={coords[coords.length - 1].y}
                  r="8.5"
                  fill="#2563EB"
                  fillOpacity="0.25"
                />
                <circle
                  cx={coords[coords.length - 1].x}
                  cy={coords[coords.length - 1].y}
                  r="5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* Interactive Scrubber & Hover Crosshair */}
            {activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={padding.top}
                  x2={activePoint.x}
                  y2={padding.top + plotHeight}
                  stroke="#475569"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="9"
                  fill="#0F172A"
                  fillOpacity="0.2"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="6.5"
                  fill="#0F172A"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* X-Axis Date Labels */}
            {coords.map((c, i) => {
              const step = Math.ceil(coords.length / 5);
              const isFirst = i === 0;
              const isLast = i === coords.length - 1;
              const isStep = i % step === 0;

              if (!isFirst && !isLast && !isStep) return null;

              return (
                <text
                  key={i}
                  x={c.x}
                  y={padding.top + plotHeight + 22}
                  textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
                  fontSize="10"
                  fill="#64748B"
                  fontFamily="Poppins, sans-serif"
                  fontWeight="600"
                >
                  {c.pt.shortDate}
                </text>
              );
            })}
          </svg>

          {/* Floating Glassmorphic Tooltip on Hover */}
          {activePoint && (
            <div
              className="absolute pointer-events-none z-30 transition-transform duration-75"
              style={{
                left: `${(activePoint.x / chartWidth) * 100}%`,
                top: `${(activePoint.y / chartHeight) * 100}%`,
                transform: `translate(${activePoint.x > chartWidth * 0.7 ? "-105%" : "14px"}, -60%)`,
              }}
            >
              <div className="bg-slate-950/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-800 text-xs min-w-[175px] space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5">
                  <span>{activePoint.pt.displayDate}</span>
                  {activePoint.pt.isSaleEvent && (
                    <span className="text-amber-400 font-extrabold flex items-center gap-1">
                      <BoltIcon className="w-3 h-3" />
                      <span>Sale</span>
                    </span>
                  )}
                </div>
                <div className="text-base font-black text-amber-300">
                  {formatINR(activePoint.pt.price)}
                </div>
                {activePoint.pt.label && (
                  <div className="text-[10px] text-emerald-400 font-semibold truncate">
                    {activePoint.pt.label}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 font-medium">
                  {activePoint.pt.price < activeStats.averagePrice ? (
                    <span className="text-emerald-400 font-bold">
                      ↓ {formatINR(activeStats.averagePrice - activePoint.pt.price)} below avg
                    </span>
                  ) : activePoint.pt.price > activeStats.averagePrice ? (
                    <span className="text-slate-300">
                      ↑ {formatINR(activePoint.pt.price - activeStats.averagePrice)} above avg
                    </span>
                  ) : (
                    <span className="text-blue-300">Exact 90-day average</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-3 border-t border-slate-100 text-center">
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              All-Time Low
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-700 block mt-0.5">
              {formatINR(activeStats.lowestPrice)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              {activeStats.lowestDate}
            </span>
          </div>

          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              90-Day Average
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
              {formatINR(activeStats.averagePrice)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Stable Benchmark
            </span>
          </div>

          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Peak Price
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-950 block mt-0.5">
              {formatINR(activeStats.highestPrice)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block truncate">
              {activeStats.highestDate}
            </span>
          </div>

          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Drop Volatility
            </span>
            <span className="text-xs sm:text-sm font-black text-blue-700 block mt-0.5">
              Low (±6.8%)
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Predictable Deals
            </span>
          </div>
        </div>

        {/* Bottom Legend */}
        <div className="flex items-center justify-center gap-5 sm:gap-8 pt-3 mt-2 text-[11px] text-slate-500 font-medium flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full" />
            <span>Price Trend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 border-t-2 border-dashed border-indigo-600" />
            <span>90-Day Average ({formatINR(activeStats.averagePrice)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
            <span>All-Time Low ({formatINR(activeStats.lowestPrice)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-blue-200" />
            <span>Current Deal ({formatINR(activeStats.currentPrice)})</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. EXPERT PURCHASING INSIGHTS & SEASONAL GUIDE
         ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Seasonal Sale Windows */}
        <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Seasonal Sale Windows</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {advice.seasonalTrendNote}
          </p>
          <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Expected next low in mega sale:</span>
            <span className="font-black text-emerald-700">
              ~{formatINR(advice.expectedLowestSalePrice)}
            </span>
          </div>
        </div>

        {/* Target Buying Threshold */}
        <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-2.5">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
            <span>Target Buying Threshold</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our algorithmic price model recommends buying this item if the price is at or below{" "}
            <strong className="text-slate-900">{formatINR(advice.targetPriceAlertSuggestion)}</strong>.
            At this price point, you are within 2% of the historical record low.
          </p>
          <div className="pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Savings vs Typical Retail:</span>
            <span className="font-black text-emerald-700">
              {formatINR(advice.savingsVsRegular)} ({advice.savingsPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. HISTORICAL PRICE MILESTONES TABLE
         ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-emerald-600" />
            <span>Verified Historical Price Milestones</span>
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">Amazon India Verified Crawler</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider border-b border-slate-100 text-[10px]">
              <tr>
                <th className="py-3 px-5 font-bold">Event / Record</th>
                <th className="py-3 px-5 font-bold">Recorded Price</th>
                <th className="py-3 px-5 font-bold">Date</th>
                <th className="py-3 px-5 font-bold">Comparison vs Today</th>
                <th className="py-3 px-5 font-bold text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-emerald-50/30">
                <td className="py-3.5 px-5 font-bold text-emerald-950 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>All-Time Lowest Ever</span>
                </td>
                <td className="py-3.5 px-5 font-black text-emerald-700 text-sm">
                  {formatINR(activeStats.lowestPrice)}
                </td>
                <td className="py-3.5 px-5 text-slate-600 font-medium">
                  {activeStats.lowestDate}
                </td>
                <td className="py-3.5 px-5 text-emerald-800 font-semibold">
                  {activeStats.diffFromLowest === 0
                    ? "Active Today (Lowest Recorded)"
                    : `-₹${activeStats.diffFromLowest.toLocaleString()} (-${activeStats.diffPercentFromLowest}%)`}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                    Historic Low
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>90-Day Rolling Average</span>
                </td>
                <td className="py-3.5 px-5 font-black text-slate-950">
                  {formatINR(activeStats.averagePrice)}
                </td>
                <td className="py-3.5 px-5 text-slate-500">Last 3 Months</td>
                <td className="py-3.5 px-5 font-semibold text-slate-700">
                  {activeStats.diffFromAverage > 0
                    ? `Today is ₹${activeStats.diffFromAverage.toLocaleString()} cheaper`
                    : `Today is ₹${Math.abs(activeStats.diffFromAverage).toLocaleString()} higher`}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                    Typical Baseline
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Highest Recorded Price</span>
                </td>
                <td className="py-3.5 px-5 font-black text-amber-950">
                  {formatINR(activeStats.highestPrice)}
                </td>
                <td className="py-3.5 px-5 text-slate-600 font-medium">
                  {activeStats.highestDate}
                </td>
                <td className="py-3.5 px-5 text-emerald-700 font-semibold">
                  +₹{activeStats.diffFromHighest.toLocaleString()} savings today
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200/60">
                    Peak Price
                  </span>
                </td>
              </tr>

              <tr className="bg-slate-50/40">
                <td className="py-3.5 px-5 font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span>Maximum Retail Price (M.R.P)</span>
                </td>
                <td className="py-3.5 px-5 font-semibold text-slate-400 line-through">
                  {formatINR(activeStats.mrp)}
                </td>
                <td className="py-3.5 px-5 text-slate-500">Manufacturer Tag</td>
                <td className="py-3.5 px-5 text-emerald-700 font-bold">
                  Save {formatINR(activeStats.mrp - activeStats.currentPrice)}
                </td>
                <td className="py-3.5 px-5 text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                    Catalog MRP
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          7. PRICE DROP ALERT MODAL
         ========================================================================= */}
      {showAlertModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAlertModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5 text-slate-950 font-bold text-base">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <BellAlertIcon className="w-5 h-5" />
                </div>
                <span>Set Price Drop Alert</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              We monitor Amazon India price changes continuously. We will immediately ping you when{" "}
              <strong>{product.name}</strong> drops to your target price.
            </p>

            <form onSubmit={handleSaveAlert} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Price (₹ INR)
                </label>
                <input
                  type="text"
                  required
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(e.target.value)}
                  placeholder={`e.g. ${activeStats.lowestPrice}`}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold text-slate-950 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-semibold mr-1">Quick Select:</span>
                <button
                  type="button"
                  onClick={() => setAlertTargetPrice(activeStats.lowestPrice.toString())}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  Lowest ({formatINR(activeStats.lowestPrice)})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAlertTargetPrice(
                      Math.round(activeStats.currentPrice * 0.95).toString()
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition"
                >
                  5% Drop ({formatINR(activeStats.currentPrice * 0.95)})
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAlertTargetPrice(
                      Math.round(activeStats.currentPrice * 0.9).toString()
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg hover:bg-slate-200 transition"
                >
                  10% Drop ({formatINR(activeStats.currentPrice * 0.9)})
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Notification Email
                </label>
                <input
                  type="email"
                  required
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-medium text-slate-950 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-950 text-xs font-black rounded-xl shadow-md transition"
                >
                  Save Price Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
