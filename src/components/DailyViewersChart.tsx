import { useState, useEffect, useMemo, useRef } from "react";
import {
  getDailyViewerStats,
  getViewerSummary,
  DailyViewerRecord,
  ViewerSummaryStats,
} from "../utils/visitorAnalytics";
import {
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

type TimeRange = 7 | 14 | 30 | 60;
type MetricMode = "viewers" | "pageviews" | "both";

/**
 * Computes a smooth monotonic cubic spline path from coordinate points.
 * Prevents overshoot and negative dips below zero.
 */
function getMonotoneSplinePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (n === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  // Calculate secant slopes
  const dxs: number[] = [];
  const dys: number[] = [];
  const ms: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = points[i + 1].x - points[i].x;
    const dy = points[i + 1].y - points[i].y;
    dxs.push(dx);
    dys.push(dy);
    ms.push(dx === 0 ? 0 : dy / dx);
  }

  // Calculate tangents
  const c1s: number[] = [ms[0]];
  for (let i = 0; i < dxs.length - 1; i++) {
    const m = ms[i];
    const mNext = ms[i + 1];
    if (m * mNext <= 0) {
      c1s.push(0);
    } else {
      const dx_ = dxs[i];
      const dxNext = dxs[i + 1];
      const common = dx_ + dxNext;
      c1s.push((3 * common) / ((common + dxNext) / m + (common + dx_) / mNext));
    }
  }
  c1s.push(ms[ms.length - 1]);

  // Construct cubic bezier curve commands
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const dx = dxs[i];
    const p1X = points[i].x + dx / 3;
    const p1Y = points[i].y + (c1s[i] * dx) / 3;
    const p2X = points[i + 1].x - dx / 3;
    const p2Y = points[i + 1].y - (c1s[i + 1] * dx) / 3;
    path += ` C ${p1X.toFixed(1)} ${p1Y.toFixed(1)}, ${p2X.toFixed(1)} ${p2Y.toFixed(1)}, ${points[i + 1].x.toFixed(1)} ${points[i + 1].y.toFixed(1)}`;
  }

  return path;
}

export default function DailyViewersChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>(30);
  const [metricMode, setMetricMode] = useState<MetricMode>("viewers");
  const [dailyData, setDailyData] = useState<DailyViewerRecord[]>([]);
  const [summary, setSummary] = useState<ViewerSummaryStats | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load and refresh stats
  const refreshData = () => {
    setIsRefreshing(true);
    const data = getDailyViewerStats(timeRange);
    const stats = getViewerSummary(timeRange);
    setDailyData(data);
    setSummary(stats);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  useEffect(() => {
    refreshData();
  }, [timeRange]);

  // Reactive listener to live visitor updates
  useEffect(() => {
    const handleUpdate = () => {
      const data = getDailyViewerStats(timeRange);
      const stats = getViewerSummary(timeRange);
      setDailyData(data);
      setSummary(stats);
    };

    window.addEventListener("viewerStatsUpdated", handleUpdate);
    return () => window.removeEventListener("viewerStatsUpdated", handleUpdate);
  }, [timeRange]);

  // Chart Dimensions & Coordinate Geometry
  const viewBoxWidth = 840;
  const viewBoxHeight = 280;
  const padding = { top: 25, right: 30, bottom: 42, left: 52 };
  const chartWidth = viewBoxWidth - padding.left - padding.right;
  const chartHeight = viewBoxHeight - padding.top - padding.bottom;

  // Compute maximum Y values based on current active metric
  const { maxVal, gridTicks } = useMemo(() => {
    if (dailyData.length === 0) return { maxVal: 500, gridTicks: [0, 100, 200, 300, 400, 500] };

    let highest = 0;
    dailyData.forEach((d) => {
      if (metricMode === "viewers") {
        if (d.uniqueViewers > highest) highest = d.uniqueViewers;
      } else if (metricMode === "pageviews") {
        if (d.pageViews > highest) highest = d.pageViews;
      } else {
        const peak = Math.max(d.uniqueViewers, d.pageViews);
        if (peak > highest) highest = peak;
      }
    });

    // Round up to clean multiple (e.g. 50, 100, 200, 500)
    const targetMax = Math.max(100, highest * 1.15);
    const step = targetMax > 1500 ? 500 : targetMax > 600 ? 200 : targetMax > 250 ? 100 : 50;
    const roundedMax = Math.ceil(targetMax / step) * step;

    const ticks: number[] = [];
    for (let v = 0; v <= roundedMax; v += step) {
      ticks.push(v);
    }

    return { maxVal: roundedMax, gridTicks: ticks };
  }, [dailyData, metricMode]);

  // Convert daily records to plotted points
  const { viewerPoints, pageViewPoints } = useMemo(() => {
    if (dailyData.length === 0) return { viewerPoints: [], pageViewPoints: [] };

    const n = dailyData.length;
    const xStep = n > 1 ? chartWidth / (n - 1) : chartWidth;

    const vPoints = dailyData.map((d, i) => {
      const x = padding.left + i * xStep;
      const normalizedY = d.uniqueViewers / maxVal;
      const y = padding.top + chartHeight - normalizedY * chartHeight;
      return { x, y, data: d, index: i };
    });

    const pvPoints = dailyData.map((d, i) => {
      const x = padding.left + i * xStep;
      const normalizedY = d.pageViews / maxVal;
      const y = padding.top + chartHeight - normalizedY * chartHeight;
      return { x, y, data: d, index: i };
    });

    return { viewerPoints: vPoints, pageViewPoints: pvPoints };
  }, [dailyData, maxVal, chartWidth, chartHeight, padding.left, padding.top]);

  // Path Strings for curves & area fills
  const viewersPath = useMemo(() => getMonotoneSplinePath(viewerPoints), [viewerPoints]);
  const pageViewsPath = useMemo(() => getMonotoneSplinePath(pageViewPoints), [pageViewPoints]);

  const viewersAreaPath = useMemo(() => {
    if (viewerPoints.length === 0) return "";
    const first = viewerPoints[0];
    const last = viewerPoints[viewerPoints.length - 1];
    const bottomY = padding.top + chartHeight;
    return `${viewersPath} L ${last.x.toFixed(1)} ${bottomY.toFixed(1)} L ${first.x.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }, [viewersPath, viewerPoints, chartHeight, padding.top]);

  const pageViewsAreaPath = useMemo(() => {
    if (pageViewPoints.length === 0) return "";
    const first = pageViewPoints[0];
    const last = pageViewPoints[pageViewPoints.length - 1];
    const bottomY = padding.top + chartHeight;
    return `${pageViewsPath} L ${last.x.toFixed(1)} ${bottomY.toFixed(1)} L ${first.x.toFixed(1)} ${bottomY.toFixed(1)} Z`;
  }, [pageViewsPath, pageViewPoints, chartHeight, padding.top]);

  // Handle Mouse / Touch Scrubber
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || dailyData.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const normalizedX = (clientX / rect.width) * viewBoxWidth;

    // Find nearest point along the X axis
    let nearestIndex = 0;
    let minDistance = Infinity;

    viewerPoints.forEach((p, idx) => {
      const dist = Math.abs(p.x - normalizedX);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = idx;
      }
    });

    setHoveredIndex(nearestIndex);
  };

  const handlePointerLeave = () => {
    setHoveredIndex(null);
  };

  // Export Daily Traffic as CSV
  const exportCSV = () => {
    if (dailyData.length === 0) return;
    const headers = "Date,Day,Unique Viewers,Total Page Views,Mobile Viewers,Desktop Viewers\n";
    const rows = dailyData
      .map(
        (d) =>
          `"${d.date}","${d.shortDay}",${d.uniqueViewers},${d.pageViews},${d.mobileViewers},${d.desktopViewers}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Yearnit_Daily_Viewers_${timeRange}Days.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const activeRecord = hoveredIndex !== null ? dailyData[hoveredIndex] : null;
  const activeViewerPoint = hoveredIndex !== null ? viewerPoints[hoveredIndex] : null;
  const activePageViewPoint = hoveredIndex !== null ? pageViewPoints[hoveredIndex] : null;

  // Comparison to previous day for active tooltip
  const prevRecord =
    hoveredIndex !== null && hoveredIndex > 0 ? dailyData[hoveredIndex - 1] : null;
  const dayChangePercent =
    activeRecord && prevRecord && prevRecord.uniqueViewers > 0
      ? Number(
          (
            ((activeRecord.uniqueViewers - prevRecord.uniqueViewers) /
              prevRecord.uniqueViewers) *
            100
          ).toFixed(1)
        )
      : null;

  // X-axis label step interval so labels stay comfortably spaced
  const labelInterval = timeRange <= 7 ? 1 : timeRange <= 14 ? 2 : timeRange <= 30 ? 5 : 10;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 lg:p-7 space-y-5">
      {/* Header with Title, Live Badge, and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <EyeIcon className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight">
              Total Viewers Day-Wise Graph
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Visitor Stream
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Real-time tracking of unique daily visitors, page impressions, and audience growth across your storefront.
          </p>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Metric Mode Switcher */}
          <div className="inline-flex bg-gray-100/90 p-1 rounded-xl text-xs font-semibold text-gray-600">
            <button
              type="button"
              onClick={() => setMetricMode("viewers")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricMode === "viewers"
                  ? "bg-white text-blue-700 shadow-xs font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              Unique Viewers
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("pageviews")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricMode === "pageviews"
                  ? "bg-white text-emerald-700 shadow-xs font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              Page Views
            </button>
            <button
              type="button"
              onClick={() => setMetricMode("both")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                metricMode === "both"
                  ? "bg-white text-purple-700 shadow-xs font-bold"
                  : "hover:text-gray-900"
              }`}
            >
              Dual View
            </button>
          </div>

          {/* Time Range Pills */}
          <div className="inline-flex bg-gray-100/90 p-1 rounded-xl text-xs font-semibold text-gray-600">
            {([7, 14, 30, 60] as TimeRange[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg transition-all ${
                  timeRange === r
                    ? "bg-white text-gray-950 shadow-xs font-bold"
                    : "hover:text-gray-900"
                }`}
              >
                {r}D
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={refreshData}
            title="Refresh Live Analytics"
            className="p-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-600 rounded-xl transition border border-gray-200/80"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={exportCSV}
            title="Download CSV Report"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl transition border border-gray-200/80"
          >
            <ArrowDownTrayIcon className="w-3.5 h-3.5 text-gray-500" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* High-Level Metric KPI Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Today's Viewers */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/40 rounded-2xl p-3.5 sm:p-4 border border-blue-100/70">
            <div className="flex items-center justify-between text-xs text-blue-700 font-semibold mb-1">
              <span>Today's Viewers</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-blue-950">
                {summary.todayUniqueViewers.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-blue-600">
                ({summary.todayPageViews} views)
              </span>
            </div>
            <p className="text-[10px] text-blue-600/90 font-medium mt-1">
              Live counter updated in real-time
            </p>
          </div>

          {/* Total Period Viewers */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50/80 rounded-2xl p-3.5 sm:p-4 border border-gray-200/70">
            <p className="text-xs text-gray-500 font-semibold mb-1">
              Total {timeRange}-Day Viewers
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-gray-900">
                {summary.totalUniqueViewers.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-gray-500">
                ({summary.totalPageViews.toLocaleString()} views)
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1">
              <ArrowTrendingUpIcon className="w-3 h-3 flex-shrink-0" />
              <span>+{summary.growthRatePercent}% audience velocity</span>
            </div>
          </div>

          {/* Daily Average Viewers */}
          <div className="bg-gradient-to-br from-purple-50/60 to-pink-50/30 rounded-2xl p-3.5 sm:p-4 border border-purple-100/70">
            <p className="text-xs text-purple-700 font-semibold mb-1">
              Daily Average Viewers
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-purple-950">
                {summary.avgDailyViewers.toLocaleString()}
              </span>
              <span className="text-[11px] font-medium text-purple-600">/ day</span>
            </div>
            <p className="text-[10px] text-purple-600/90 font-medium mt-1">
              Mean daily unique visitors
            </p>
          </div>

          {/* Peak Traffic Day */}
          <div className="bg-gradient-to-br from-amber-50/70 to-yellow-50/40 rounded-2xl p-3.5 sm:p-4 border border-amber-100/70">
            <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
              <span>Peak Day Traffic</span>
              <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-amber-950">
                {summary.peakDay.viewers.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-amber-700">viewers</span>
            </div>
            <p className="text-[10px] text-amber-700 font-medium mt-1">
              Recorded on {summary.peakDay.label}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Monotone Spline Curve Chart */}
      <div className="relative w-full overflow-hidden select-none bg-slate-900/2 rounded-2xl border border-gray-100 pt-2 pb-1">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-auto cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <defs>
            {/* Viewers Gradient Fill */}
            <linearGradient id="viewersAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.28" />
              <stop offset="85%" stopColor="#3B82F6" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
            </linearGradient>

            {/* PageViews Gradient Fill */}
            <linearGradient id="pageViewsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="85%" stopColor="#10B981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Line Stroke Gradients */}
            <linearGradient id="viewersStrokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#60A5FA" />
            </linearGradient>

            <linearGradient id="pageViewsStrokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* Drop Shadow for Scrubber Dot */}
            <filter id="scrubberShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0F172A" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {gridTicks.map((val) => {
            const normalizedY = val / maxVal;
            const y = padding.top + chartHeight - normalizedY * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={viewBoxWidth - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? "none" : "3 3"}
                  strokeOpacity={val === 0 ? 0.9 : 0.6}
                />
                <text
                  x={padding.left - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94A3B8"
                  fontWeight="600"
                  fontFamily="inherit"
                >
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          {(metricMode === "pageviews" || metricMode === "both") && (
            <path d={pageViewsAreaPath} fill="url(#pageViewsAreaGradient)" />
          )}

          {(metricMode === "viewers" || metricMode === "both") && (
            <path d={viewersAreaPath} fill="url(#viewersAreaGradient)" />
          )}

          {/* Page Views Spline Stroke */}
          {(metricMode === "pageviews" || metricMode === "both") && (
            <path
              d={pageViewsPath}
              fill="none"
              stroke="url(#pageViewsStrokeGradient)"
              strokeWidth={metricMode === "pageviews" ? "3" : "2.2"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Unique Viewers Spline Stroke */}
          {(metricMode === "viewers" || metricMode === "both") && (
            <path
              d={viewersPath}
              fill="none"
              stroke="url(#viewersStrokeGradient)"
              strokeWidth={metricMode === "viewers" ? "3" : "2.4"}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Peak Day Highlight Marker */}
          {summary &&
            viewerPoints.map((pt) => {
              if (pt.data.date === summary.peakDay.date) {
                return (
                  <g key="peak-marker">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="6"
                      fill="#F59E0B"
                      fillOpacity="0.25"
                      className="animate-ping"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#F59E0B"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  </g>
                );
              }
              return null;
            })}

          {/* Active Hover Scrubber Vertical Line & Dots */}
          {hoveredIndex !== null && activeViewerPoint && (
            <g key="active-scrubber">
              <line
                x1={activeViewerPoint.x}
                y1={padding.top}
                x2={activeViewerPoint.x}
                y2={padding.top + chartHeight}
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                strokeOpacity="0.8"
              />

              {/* Page Views Scrubber Dot */}
              {(metricMode === "pageviews" || metricMode === "both") && activePageViewPoint && (
                <circle
                  cx={activePageViewPoint.x}
                  cy={activePageViewPoint.y}
                  r="5"
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  filter="url(#scrubberShadow)"
                />
              )}

              {/* Unique Viewers Scrubber Dot */}
              {(metricMode === "viewers" || metricMode === "both") && (
                <circle
                  cx={activeViewerPoint.x}
                  cy={activeViewerPoint.y}
                  r="5.5"
                  fill="#2563EB"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  filter="url(#scrubberShadow)"
                />
              )}
            </g>
          )}

          {/* X-Axis Date Labels */}
          {viewerPoints.map((pt, idx) => {
            // Display label if it hits the interval step, or if it is the very first or very last item
            const isFirst = idx === 0;
            const isLast = idx === viewerPoints.length - 1;
            const isStep = idx % labelInterval === 0;

            if (isStep || isFirst || isLast) {
              return (
                <text
                  key={pt.data.date}
                  x={pt.x}
                  y={padding.top + chartHeight + 18}
                  textAnchor="middle"
                  fontSize="10"
                  fill={hoveredIndex === idx ? "#1E293B" : "#94A3B8"}
                  fontWeight={hoveredIndex === idx ? "700" : "500"}
                  fontFamily="inherit"
                >
                  {pt.data.label}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {activeRecord && activeViewerPoint && (
          <div
            className="absolute pointer-events-none transition-all duration-150 z-30 transform -translate-x-1/2"
            style={{
              left: `${(activeViewerPoint.x / viewBoxWidth) * 100}%`,
              top: `${Math.max(12, (activeViewerPoint.y / viewBoxHeight) * 100 - 32)}%`,
            }}
          >
            <div className="bg-gray-950/95 backdrop-blur-md text-white rounded-2xl px-3.5 py-2.5 shadow-xl border border-gray-800 text-xs space-y-1.5 min-w-[170px]">
              <div className="flex items-center justify-between gap-2 border-b border-gray-800 pb-1">
                <span className="font-bold text-gray-200">
                  {activeRecord.shortDay}, {activeRecord.label}
                </span>
                {dayChangePercent !== null && (
                  <span
                    className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
                      dayChangePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {dayChangePercent >= 0 ? (
                      <ArrowTrendingUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowTrendingDownIcon className="w-3 h-3" />
                    )}
                    {dayChangePercent >= 0 ? `+${dayChangePercent}%` : `${dayChangePercent}%`}
                  </span>
                )}
              </div>

              <div className="space-y-1 pt-0.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Unique Viewers
                  </span>
                  <span className="font-extrabold text-white">
                    {activeRecord.uniqueViewers.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Total Page Views
                  </span>
                  <span className="font-bold text-gray-200">
                    {activeRecord.pageViews.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <DevicePhoneMobileIcon className="w-3 h-3" />
                  {Math.round((activeRecord.mobileViewers / (activeRecord.uniqueViewers || 1)) * 100)}%
                </span>
                <span className="flex items-center gap-1">
                  <ComputerDesktopIcon className="w-3 h-3" />
                  {Math.round((activeRecord.desktopViewers / (activeRecord.uniqueViewers || 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 pt-1">
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" />
            <span className="font-semibold text-gray-700">Unique Viewers (Daily Visitors)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="font-semibold text-gray-700">Total Page Impressions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200 flex-shrink-0" />
            <span className="font-semibold text-gray-700">Peak Traffic Day</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-gray-400">
          <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
          <span>Local IST Timezone • Aggregated daily at 00:00</span>
        </div>
      </div>
    </div>
  );
}
