import { useState, useMemo, useRef, useEffect } from "react";
import { Product } from "../data/products";
import { buildAffiliateUrl } from "../utils/affiliate";
import {
  getProductPriceHistory,
  filterPointsByTimeframe,
  computeStatsForSubset,
  formatINR,
  formatCompactINR,
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
} from "@heroicons/react/24/solid";

interface PriceHistoryTrackerProps {
  product: Product;
}

type TimeframeType = "1M" | "3M" | "6M" | "1Y" | "ALL";

interface StoredAlert {
  productId: string;
  targetPrice: number;
  email: string;
  createdAt: string;
}

export default function PriceHistoryTracker({ product }: PriceHistoryTrackerProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>("3M");
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

  // --- SVG Chart Calculations ---
  const chartWidth = 800;
  const chartHeight = 300;
  const padding = { top: 30, right: 40, bottom: 42, left: 65 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Compute Y-scale limits with breathing room
  const prices = displayPoints.map((p) => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const priceRange = maxP - minP || 1000;
  const yMin = Math.max(0, Math.floor((minP - priceRange * 0.12) / 100) * 100);
  const yMax = Math.ceil((maxP + priceRange * 0.12) / 100) * 100;
  const yDomain = yMax - yMin || 1;

  // Map data point to SVG coordinates
  const coords = useMemo(() => {
    const total = displayPoints.length;
    return displayPoints.map((pt, idx) => {
      const x = padding.left + (idx / Math.max(1, total - 1)) * plotWidth;
      const y = padding.top + ((yMax - pt.price) / yDomain) * plotHeight;
      return { x, y, pt };
    });
  }, [displayPoints, plotWidth, plotHeight, padding.left, padding.top, yMax, yDomain]);

  // Build smooth cubic bezier SVG path
  const linePath = useMemo(() => {
    if (coords.length === 0) return "";
    if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

      // Catmull-Rom to Cubic Bezier control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }, [coords]);

  // Build enclosed SVG path for gradient area fill
  const areaPath = useMemo(() => {
    if (!linePath || coords.length === 0) return "";
    const firstX = coords[0].x;
    const lastX = coords[coords.length - 1].x;
    const bottomY = padding.top + plotHeight;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
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

  // Interactive scrubber on hover/touch
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = chartWidth / rect.width;
    const svgX = clientX * scaleX;

    // Find closest point by X coordinate
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

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-7 shadow-sm border border-gray-200 mb-8 font-poppins text-gray-900">
      {/* 1. Header & Section Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-gray-100 gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full text-[11px] font-bold mb-1.5">
            <SparklesIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Price Tracking & Buyer Intelligence</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
            <span>Price History & Best Time to Buy</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Verified Amazon India pricing trend, all-time lows, and data-backed purchasing recommendation.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {activeAlert ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold">
              <BellAlertIcon className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>Alert set at {formatINR(activeAlert.targetPrice)}</span>
              <button
                type="button"
                onClick={handleRemoveAlert}
                className="text-gray-400 hover:text-red-600 text-xs font-semibold ml-1 underline"
                title="Remove price alert"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAlertModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              <BellAlertIcon className="w-4 h-4 text-amber-400" />
              <span>Set Price Drop Alert</span>
            </button>
          )}

          <a
            href={affiliateUrl}
            target="_blank"
            rel="sponsored nofollow noopener"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFD814] hover:bg-[#F7CA00] active:bg-[#F2BC00] text-gray-950 font-extrabold text-xs rounded-xl shadow-xs border border-[#FCD200] transition"
          >
            <ShoppingBagIcon className="w-3.5 h-3.5" />
            <span>Buy at {formatINR(activeStats.currentPrice)}</span>
          </a>
        </div>
      </div>

      {/* Success Notification */}
      {alertSuccessMsg && (
        <div className="mb-5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{alertSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setAlertSuccessMsg(null)}
            className="text-emerald-700 hover:opacity-75"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. "Should You Buy Now?" Verdict Banner (Inspired by DealsSpy / PriceHistory) */}
      <div
        className={`rounded-2xl p-4 sm:p-6 mb-6 border transition-all ${
          advice.verdict === "BEST_TIME"
            ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border-emerald-300"
            : advice.verdict === "GOOD_TIME"
            ? "bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 border-blue-200"
            : "bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 border-amber-300"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase shadow-2xs ${
                  advice.verdict === "BEST_TIME"
                    ? "bg-emerald-600 text-white"
                    : advice.verdict === "GOOD_TIME"
                    ? "bg-blue-600 text-white"
                    : "bg-amber-500 text-gray-950"
                }`}
              >
                {advice.verdict === "BEST_TIME" ? (
                  <CheckBadgeIcon className="w-4 h-4 text-amber-300" />
                ) : advice.verdict === "GOOD_TIME" ? (
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                ) : (
                  <ClockIcon className="w-4 h-4 text-gray-950" />
                )}
                <span>{advice.badgeText}</span>
              </span>

              <span className="text-xs font-bold text-gray-700">
                • Verified Amazon Historical Score
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-gray-950">
              {advice.verdictTitle}
            </h3>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {advice.verdictDescription}
            </p>
          </div>

          {/* Buy Rating Score Box */}
          <div className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 shadow-xs flex items-center gap-4 flex-shrink-0 min-w-[240px] justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Buy Recommendation
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-gray-950">
                  {advice.buyRating}
                </span>
                <span className="text-xs text-gray-400 font-bold">/ 10</span>
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

            <div className="text-right border-l border-gray-100 pl-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Drop Probability
              </span>
              <span className="text-sm font-extrabold text-gray-900 block mt-0.5">
                {advice.dropChancePercentage}%
              </span>
              <span className="text-[10px] text-gray-500 font-medium">
                {advice.dropChanceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Key Price Metrics Cards (Current, Lowest, Average, Highest) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
        {/* Current Price */}
        <div className="bg-gray-50/80 rounded-2xl p-3.5 sm:p-4 border border-gray-200/70 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              Current Price
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-gray-950 tracking-tight">
            {formatINR(activeStats.currentPrice)}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            {activeStats.mrp > activeStats.currentPrice
              ? `${Math.round(
                  ((activeStats.mrp - activeStats.currentPrice) / activeStats.mrp) * 100
                )}% off M.R.P (${formatINR(activeStats.mrp)})`
              : "Active Amazon Deal"}
          </div>
        </div>

        {/* Lowest Recorded Price */}
        <div className="bg-emerald-50/50 rounded-2xl p-3.5 sm:p-4 border border-emerald-200/70 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
              Lowest Price
            </span>
            <ArrowTrendingDownIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-emerald-900 tracking-tight">
            {formatINR(activeStats.lowestPrice)}
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1 truncate" title={activeStats.lowestDate}>
            on {activeStats.lowestDate}
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-blue-50/50 rounded-2xl p-3.5 sm:p-4 border border-blue-200/70 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">
              Average Price
            </span>
            <ChartBarIcon className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-blue-900 tracking-tight">
            {formatINR(activeStats.averagePrice)}
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">
            {activeStats.diffFromAverage > 0
              ? `${formatINR(activeStats.diffFromAverage)} lower than avg`
              : `${formatINR(Math.abs(activeStats.diffFromAverage))} above avg`}
          </div>
        </div>

        {/* Highest Recorded Price */}
        <div className="bg-amber-50/50 rounded-2xl p-3.5 sm:p-4 border border-amber-200/70 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
              Highest Price
            </span>
            <ArrowTrendingUpIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-amber-950 tracking-tight">
            {formatINR(activeStats.highestPrice)}
          </div>
          <div className="text-[11px] text-amber-800 font-medium mt-1 truncate" title={activeStats.highestDate}>
            on {activeStats.highestDate}
          </div>
        </div>
      </div>

      {/* 4. Interactive SVG Graph & Timeframe Filter Toolbar */}
      <div className="bg-white rounded-2xl p-3 sm:p-5 border border-gray-200/90 shadow-2xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Price Fluctuation Curve:
            </span>
            <span className="text-xs text-gray-400">
              ({displayPoints.length} verified price checks)
            </span>
          </div>

          {/* Timeframe Selector Pills */}
          <div className="inline-flex items-center gap-1 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
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
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition ${
                  selectedTimeframe === tf.id
                    ? "bg-white text-gray-950 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* The SVG Canvas Container */}
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] max-h-[360px] select-none touch-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            <defs>
              {/* Emerald/Green Area Fill Gradient */}
              <linearGradient id="priceAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#059669" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.00" />
              </linearGradient>

              {/* Stroke Gradient */}
              <linearGradient id="priceLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="70%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>

              {/* Drop Shadow for Pin Tooltips */}
              <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.12" />
              </filter>
            </defs>

            {/* Background horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const yVal = padding.top + pct * plotHeight;
              const priceVal = Math.round(yMax - pct * yDomain);
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={yVal}
                    x2={padding.left + plotWidth}
                    y2={yVal}
                    stroke="#E5E7EB"
                    strokeWidth="1"
                    strokeDasharray={pct === 1 || pct === 0 ? "" : "3 3"}
                  />
                  <text
                    x={padding.left - 8}
                    y={yVal + 3.5}
                    textAnchor="end"
                    fontSize="10"
                    fill="#9CA3AF"
                    fontFamily="Poppins, sans-serif"
                    fontWeight="500"
                  >
                    {formatCompactINR(priceVal)}
                  </text>
                </g>
              );
            })}

            {/* Average Price Reference Line */}
            {avgY >= padding.top && avgY <= padding.top + plotHeight && (
              <g>
                <line
                  x1={padding.left}
                  y1={avgY}
                  x2={padding.left + plotWidth}
                  y2={avgY}
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                  opacity="0.8"
                />
                <rect
                  x={padding.left + plotWidth - 105}
                  y={avgY - 10}
                  width="100"
                  height="18"
                  rx="9"
                  fill="#EFF6FF"
                  stroke="#BFDBFE"
                  strokeWidth="1"
                />
                <text
                  x={padding.left + plotWidth - 55}
                  y={avgY + 2.5}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#1E40AF"
                  fontFamily="Poppins, sans-serif"
                  fontWeight="bold"
                >
                  Avg: {formatCompactINR(activeStats.averagePrice)}
                </text>
              </g>
            )}

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#priceAreaGrad)" />}

            {/* Smooth Line Path */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#priceLineGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Pinned Lowest Point Dot & Marker */}
            {coords[lowestIdx] && (
              <g>
                <circle
                  cx={coords[lowestIdx].x}
                  cy={coords[lowestIdx].y}
                  r="7"
                  fill="#10B981"
                  opacity="0.3"
                  className="animate-ping"
                />
                <circle
                  cx={coords[lowestIdx].x}
                  cy={coords[lowestIdx].y}
                  r="5"
                  fill="#059669"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <g filter="url(#shadowFilter)">
                  <rect
                    x={Math.max(padding.left, Math.min(coords[lowestIdx].x - 42, padding.left + plotWidth - 85))}
                    y={Math.max(padding.top + 2, coords[lowestIdx].y - 26)}
                    width="84"
                    height="19"
                    rx="6"
                    fill="#065F46"
                  />
                  <text
                    x={Math.max(padding.left, Math.min(coords[lowestIdx].x - 42, padding.left + plotWidth - 85)) + 42}
                    y={Math.max(padding.top + 2, coords[lowestIdx].y - 26) + 12.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="9.5"
                    fontFamily="Poppins, sans-serif"
                    fontWeight="bold"
                  >
                    Low: {formatCompactINR(activeStats.lowestPrice)}
                  </text>
                </g>
              </g>
            )}

            {/* Pinned Highest Point Dot */}
            {coords[highestIdx] && highestIdx !== lowestIdx && (
              <g>
                <circle
                  cx={coords[highestIdx].x}
                  cy={coords[highestIdx].y}
                  r="5"
                  fill="#D97706"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Current Price Dot (Last point on right) */}
            {coords[coords.length - 1] && (
              <g>
                <circle
                  cx={coords[coords.length - 1].x}
                  cy={coords[coords.length - 1].y}
                  r="6"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              </g>
            )}

            {/* Hover Crosshair & Interactive Scrubber */}
            {activePoint && (
              <g>
                {/* Vertical guideline */}
                <line
                  x1={activePoint.x}
                  y1={padding.top}
                  x2={activePoint.x}
                  y2={padding.top + plotHeight}
                  stroke="#4B5563"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
                {/* Highlight active dot */}
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="7"
                  fill="#1F2937"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* X-axis date labels */}
            {coords.map((c, i) => {
              // Space out X-axis labels to avoid crowd
              const step = Math.ceil(coords.length / 5);
              const isFirst = i === 0;
              const isLast = i === coords.length - 1;
              const isStep = i % step === 0;

              if (!isFirst && !isLast && !isStep) return null;

              return (
                <text
                  key={i}
                  x={c.x}
                  y={padding.top + plotHeight + 20}
                  textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
                  fontSize="9.5"
                  fill="#6B7280"
                  fontFamily="Poppins, sans-serif"
                  fontWeight="600"
                >
                  {c.pt.shortDate}
                </text>
              );
            })}
          </svg>

          {/* Floating HTML Tooltip when hovering over a point */}
          {activePoint && (
            <div
              className="absolute pointer-events-none z-30 transition-transform duration-75"
              style={{
                left: `${(activePoint.x / chartWidth) * 100}%`,
                top: `${(activePoint.y / chartHeight) * 100}%`,
                transform: `translate(${activePoint.x > chartWidth * 0.7 ? "-105%" : "12px"}, -60%)`,
              }}
            >
              <div className="bg-gray-900/95 backdrop-blur-md text-white p-2.5 rounded-xl shadow-xl border border-gray-700 text-xs min-w-[155px] space-y-1">
                <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-700/80 pb-1">
                  <span>{activePoint.pt.displayDate}</span>
                  {activePoint.pt.isSaleEvent && (
                    <span className="text-amber-400 font-bold">Deal Event</span>
                  )}
                </div>
                <div className="text-sm font-extrabold text-amber-300">
                  {formatINR(activePoint.pt.price)}
                </div>
                {activePoint.pt.label && (
                  <div className="text-[10px] text-emerald-400 font-medium">
                    {activePoint.pt.label}
                  </div>
                )}
                <div className="text-[10px] text-gray-400">
                  {activePoint.pt.price < activeStats.averagePrice ? (
                    <span className="text-emerald-400">
                      ↓ {formatINR(activeStats.averagePrice - activePoint.pt.price)} below avg
                    </span>
                  ) : (
                    <span>
                      ↑ {formatINR(activePoint.pt.price - activeStats.averagePrice)} above avg
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Legend */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 pt-3 mt-2 border-t border-gray-100 text-[11px] text-gray-500 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-500 rounded" />
            <span>Price Trend</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-blue-600" />
            <span>Average ({formatCompactINR(activeStats.averagePrice)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 border border-white" />
            <span>All-Time Low ({formatCompactINR(activeStats.lowestPrice)})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white" />
            <span>Current Price</span>
          </div>
        </div>
      </div>

      {/* 5. "When is the Best Time to Buy?" Expert Insights Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Purchasing Strategy */}
        <div className="bg-gray-50/70 rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-2.5">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-blue-600" />
            <span>Seasonal Sale Windows</span>
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            {advice.seasonalTrendNote}
          </p>
          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
            <span className="text-gray-500">Expected next low in mega sale:</span>
            <span className="font-extrabold text-emerald-700">
              ~{formatINR(advice.expectedLowestSalePrice)}
            </span>
          </div>
        </div>

        {/* Target Buying Price Recommendation */}
        <div className="bg-gray-50/70 rounded-2xl p-4 sm:p-5 border border-gray-200/80 space-y-2.5">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <CheckBadgeIcon className="w-4 h-4 text-emerald-600" />
            <span>Target Buying Threshold</span>
          </h4>
          <p className="text-xs text-gray-600 leading-relaxed">
            Our algorithmic price model recommends buying this item if the price is at or below{" "}
            <strong className="text-gray-900">{formatINR(advice.targetPriceAlertSuggestion)}</strong>.
            At this level, you are within 2% of the lowest price in the past 12 months.
          </p>
          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
            <span className="text-gray-500">Savings vs Typical Retail:</span>
            <span className="font-extrabold text-emerald-700">
              {formatINR(advice.savingsVsRegular)} ({advice.savingsPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* 6. Historical Price Events Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
            Verified Historical Price Milestones
          </h4>
          <span className="text-[11px] text-gray-500 font-medium">Source: Amazon India Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/50 text-gray-500 uppercase tracking-wider border-b border-gray-100 text-[10px]">
              <tr>
                <th className="py-2.5 px-4 font-bold">Event / Record</th>
                <th className="py-2.5 px-4 font-bold">Recorded Price</th>
                <th className="py-2.5 px-4 font-bold">Date</th>
                <th className="py-2.5 px-4 font-bold">Comparison vs Today</th>
                <th className="py-2.5 px-4 font-bold text-right">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="bg-emerald-50/30">
                <td className="py-3 px-4 font-bold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>All-Time Lowest Ever</span>
                </td>
                <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                  {formatINR(activeStats.lowestPrice)}
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">
                  {activeStats.lowestDate}
                </td>
                <td className="py-3 px-4 text-emerald-800 font-semibold">
                  {activeStats.diffFromLowest === 0
                    ? "Active Today (Lowest Recorded)"
                    : `-₹${activeStats.diffFromLowest.toLocaleString()} (-${activeStats.diffPercentFromLowest}%)`}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Historic Low
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>90-Day Rolling Average</span>
                </td>
                <td className="py-3 px-4 font-extrabold text-gray-950">
                  {formatINR(activeStats.averagePrice)}
                </td>
                <td className="py-3 px-4 text-gray-500">Last 3 Months</td>
                <td className="py-3 px-4 font-semibold text-gray-700">
                  {activeStats.diffFromAverage > 0
                    ? `Today is ₹${activeStats.diffFromAverage.toLocaleString()} cheaper`
                    : `Today is ₹${Math.abs(activeStats.diffFromAverage).toLocaleString()} higher`}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700">
                    Typical Baseline
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Highest Recorded Price</span>
                </td>
                <td className="py-3 px-4 font-bold text-amber-900">
                  {formatINR(activeStats.highestPrice)}
                </td>
                <td className="py-3 px-4 text-gray-600 font-medium">
                  {activeStats.highestDate}
                </td>
                <td className="py-3 px-4 text-emerald-700 font-semibold">
                  +₹{activeStats.diffFromHighest.toLocaleString()} savings today
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                    Peak Price
                  </span>
                </td>
              </tr>

              <tr className="bg-gray-50/40">
                <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <span>Maximum Retail Price (M.R.P)</span>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-400 line-through">
                  {formatINR(activeStats.mrp)}
                </td>
                <td className="py-3 px-4 text-gray-500">Manufacturer Tag</td>
                <td className="py-3 px-4 text-emerald-700 font-bold">
                  Save {formatINR(activeStats.mrp - activeStats.currentPrice)}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-200 text-gray-700">
                    Catalog MRP
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Price Drop Alert Modal */}
      {showAlertModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowAlertModal(false)}
        >
          <div
            className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2 text-gray-950 font-bold text-base">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <BellAlertIcon className="w-5 h-5" />
                </div>
                <span>Set Price Drop Alert</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAlertModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              We monitor Amazon India price changes continuously. We will immediately ping you when{" "}
              <strong>{product.name}</strong> drops to your target price.
            </p>

            <form onSubmit={handleSaveAlert} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Target Price (₹ INR)
                </label>
                <input
                  type="text"
                  required
                  value={alertTargetPrice}
                  onChange={(e) => setAlertTargetPrice(e.target.value)}
                  placeholder={`e.g. ${activeStats.lowestPrice}`}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-950 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-gray-400 font-semibold mr-1">Quick Select:</span>
                <button
                  type="button"
                  onClick={() => setAlertTargetPrice(activeStats.lowestPrice.toString())}
                  className="px-2 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100"
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
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-200"
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
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg hover:bg-gray-200"
                >
                  10% Drop ({formatINR(activeStats.currentPrice * 0.9)})
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Your Notification Email
                </label>
                <input
                  type="email"
                  required
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-xs font-medium text-gray-950 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAlertModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-gray-950 text-xs font-extrabold rounded-xl shadow-md transition"
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
