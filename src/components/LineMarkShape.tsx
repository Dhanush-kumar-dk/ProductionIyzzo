import * as React from "react";
import { formatINR, formatChartTick } from "../utils/priceHistory";

export type Shape = "circle" | "square" | "diamond" | "cross" | "star" | "triangle" | "wye";

export const marksMapping = {
  true: () => true,
  false: () => false,
  start: ({ index }: { index: number }) => index === 0,
  end: ({ index, total }: { index: number; total: number }) => index === total - 1,
  "({index})=>index%2===0": ({ index }: { index: number }) => index % 2 === 0,
} as const;

export const marksOptions: (keyof typeof marksMapping)[] = [
  "true",
  "false",
  "start",
  "end",
  "({index})=>index%2===0",
];

export const shapes: Shape[] = [
  "circle",
  "square",
  "diamond",
  "cross",
  "star",
  "triangle",
  "wye",
];

// Fallback weather dataset matching official MUI X-Charts documentation
export const defaultWeatherDataset = [
  { month: "Jan", london: 59, paris: 57 },
  { month: "Feb", london: 50, paris: 52 },
  { month: "Mar", london: 47, paris: 53 },
  { month: "Apr", london: 54, paris: 56 },
  { month: "May", london: 57, paris: 61 },
  { month: "Jun", london: 60, paris: 63 },
  { month: "Jul", london: 59, paris: 65 },
  { month: "Aug", london: 65, paris: 64 },
  { month: "Sept", london: 51, paris: 60 },
  { month: "Oct", london: 60, paris: 65 },
  { month: "Nov", london: 67, paris: 64 },
  { month: "Dec", london: 61, paris: 62 },
];

/**
 * Natural Cubic Spline (D3 curveNatural as used in MUI X-Charts curve: 'natural')
 * Solves tridiagonal matrix system with zero second-derivatives at boundaries
 */
function getNaturalSplinePath(points: { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (n === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  const a = new Array(n - 1);
  const b = new Array(n - 1);
  const c = new Array(n - 1);
  const rX = new Array(n - 1);
  const rY = new Array(n - 1);

  a[0] = 0;
  b[0] = 2;
  c[0] = 1;
  rX[0] = points[0].x + 2 * points[1].x;
  rY[0] = points[0].y + 2 * points[1].y;

  for (let i = 1; i < n - 2; i++) {
    a[i] = 1;
    b[i] = 4;
    c[i] = 1;
    rX[i] = 4 * points[i].x + 2 * points[i + 1].x;
    rY[i] = 4 * points[i].y + 2 * points[i + 1].y;
  }

  a[n - 2] = 2;
  b[n - 2] = 7;
  c[n - 2] = 0;
  rX[n - 2] = 8 * points[n - 2].x + points[n - 1].x;
  rY[n - 2] = 8 * points[n - 2].y + points[n - 1].y;

  for (let i = 1; i < n - 1; i++) {
    const m = a[i] / b[i - 1];
    b[i] -= m * c[i - 1];
    rX[i] -= m * rX[i - 1];
    rY[i] -= m * rY[i - 1];
  }

  const p1X = new Array(n - 1);
  const p1Y = new Array(n - 1);
  p1X[n - 2] = rX[n - 2] / b[n - 2];
  p1Y[n - 2] = rY[n - 2] / b[n - 2];
  for (let i = n - 3; i >= 0; i--) {
    p1X[i] = (rX[i] - c[i] * p1X[i + 1]) / b[i];
    p1Y[i] = (rY[i] - c[i] * p1Y[i + 1]) / b[i];
  }

  const p2X = new Array(n - 1);
  const p2Y = new Array(n - 1);
  for (let i = 0; i < n - 2; i++) {
    p2X[i] = 2 * points[i + 1].x - p1X[i + 1];
    p2Y[i] = 2 * points[i + 1].y - p1Y[i + 1];
  }
  p2X[n - 2] = (points[n - 1].x + p1X[n - 2]) / 2;
  p2Y[n - 2] = (points[n - 1].y + p1Y[n - 2]) / 2;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    path += ` C ${p1X[i].toFixed(1)} ${p1Y[i].toFixed(1)}, ${p2X[i].toFixed(1)} ${p2Y[i].toFixed(1)}, ${points[i + 1].x.toFixed(1)} ${points[i + 1].y.toFixed(1)}`;
  }
  return path;
}

/**
 * Render individual SVG mark based on MUI X-Charts shape type
 */
function renderMark(x: number, y: number, shape: Shape, key: string | number) {
  const color = "#0288D1";
  switch (shape) {
    case "square":
      return (
        <rect
          key={key}
          x={x - 4}
          y={y - 4}
          width={8}
          height={8}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2}
          rx={0.5}
        />
      );
    case "diamond":
      return (
        <polygon
          key={key}
          points={`${x},${y - 5.5} ${x + 5.5},${y} ${x},${y + 5.5} ${x - 5.5},${y}`}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      );
    case "cross":
      return (
        <g key={key}>
          <line x1={x - 4.5} y1={y} x2={x + 4.5} y2={y} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={x} y1={y - 4.5} x2={x} y2={y + 4.5} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case "star":
      return (
        <path
          key={key}
          d={`M ${x} ${y - 6} L ${x + 1.8} ${y - 1.8} L ${x + 6} ${y - 1.5} L ${x + 3} ${y + 1.5} L ${x + 4} ${y + 6} L ${x} ${y + 3.2} L ${x - 4} ${y + 6} L ${x - 3} ${y + 1.5} L ${x - 6} ${y - 1.5} L ${x - 1.8} ${y - 1.8} Z`}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={1.2}
        />
      );
    case "triangle":
      return (
        <polygon
          key={key}
          points={`${x},${y - 5.5} ${x + 5.5},${y + 4.5} ${x - 5.5},${y + 4.5}`}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      );
    case "wye":
      return (
        <g key={key}>
          <line x1={x} y1={y} x2={x} y2={y - 5.5} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={x} y1={y} x2={x + 4.8} y2={y + 2.8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={x} y1={y} x2={x - 4.8} y2={y + 2.8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
        </g>
      );
    case "circle":
    default:
      return (
        <circle
          key={key}
          cx={x}
          cy={y}
          r={4.5}
          fill={color}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      );
  }
}

interface LineMarkShapeProps {
  dataset?: Array<{ month: string; price?: number; london?: number; [key: string]: any }>;
  seriesLabel?: string;
  dataKey?: string;
  height?: number;
  isCurrency?: boolean;
}

export default function LineMarkShape({
  dataset = defaultWeatherDataset,
  seriesLabel = "Price History (₹)",
  dataKey = "price",
  height = 280,
  isCurrency = true,
}: LineMarkShapeProps) {
  const [marks, setMarks] = React.useState<keyof typeof marksMapping>("true");
  const [shape, setShape] = React.useState<Shape>("circle");
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  const svgRef = React.useRef<SVGSVGElement | null>(null);

  // SVG Geometry
  const chartWidth = 780;
  const chartHeight = height;
  const padding = { top: 30, right: 30, bottom: 45, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Resolve values
  const values = dataset.map((d) => (typeof d[dataKey] === "number" ? d[dataKey] : d.london ?? 0));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 100;

  const yMin = Math.max(0, Math.floor((minVal - range * 0.12) / 10) * 10);
  const yMax = Math.ceil((maxVal + range * 0.12) / 10) * 10;
  const yDomain = yMax - yMin || 1;

  // Calculate coordinates
  const coords = React.useMemo(() => {
    const total = dataset.length;
    return dataset.map((item, idx) => {
      const val = typeof item[dataKey] === "number" ? item[dataKey] : item.london ?? 0;
      const x = padding.left + (idx / Math.max(1, total - 1)) * plotWidth;
      const y = padding.top + ((yMax - val) / yDomain) * plotHeight;
      return { x, y, val, item, idx };
    });
  }, [dataset, dataKey, padding.left, padding.top, plotWidth, plotHeight, yMax, yDomain]);

  // Generate D3 natural spline path (MUI curve: 'natural')
  const splinePath = React.useMemo(() => {
    return getNaturalSplinePath(coords);
  }, [coords]);

  // 5 Y-ticks
  const yTicks = React.useMemo(() => {
    const count = 5;
    const ticks = [];
    for (let i = 0; i < count; i++) {
      const pct = i / (count - 1);
      const yVal = padding.top + pct * plotHeight;
      const val = Math.round(yMax - pct * yDomain);
      ticks.push({
        pct,
        yVal,
        val,
        label: isCurrency ? formatChartTick(val, yDomain) : val.toString(),
      });
    }
    return ticks;
  }, [padding.top, plotHeight, yMax, yDomain, isCurrency]);

  // Pointer interactions
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current || coords.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const scaleX = chartWidth / rect.width;
    const svgX = clientX * scaleX;

    let closest = 0;
    let minD = Infinity;
    coords.forEach((c, idx) => {
      const dist = Math.abs(c.x - svgX);
      if (dist < minD) {
        minD = dist;
        closest = idx;
      }
    });
    setHoveredIdx(closest);
  };

  const handlePointerLeave = () => {
    setHoveredIdx(null);
  };

  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : null;

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs font-poppins text-slate-900 w-full">
      {/* =========================================================================
          MUI-Style Control Stack (TextField select for marks & shape)
         ========================================================================= */}
      <div className="flex flex-row md:flex-col gap-3 min-w-[170px] shrink-0">
        {/* 1. Marks Select Field */}
        <div className="relative flex-1 md:flex-none">
          <label className="block text-[11px] font-bold text-slate-600 mb-1 tracking-wide uppercase">
            marks
          </label>
          <div className="relative">
            <select
              value={marks}
              onChange={(e) => setMarks(e.target.value as keyof typeof marksMapping)}
              className="w-full h-11 px-3.5 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 outline-none hover:border-slate-500 focus:border-[#0288D1] focus:ring-1 focus:ring-[#0288D1] transition appearance-none cursor-pointer shadow-2xs"
            >
              {marksOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* 2. Shape Select Field */}
        <div className="relative flex-1 md:flex-none">
          <label className="block text-[11px] font-bold text-slate-600 mb-1 tracking-wide uppercase">
            shape
          </label>
          <div className="relative">
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as Shape)}
              className="w-full h-11 px-3.5 pr-8 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 outline-none hover:border-slate-500 focus:border-[#0288D1] focus:ring-1 focus:ring-[#0288D1] transition appearance-none cursor-pointer shadow-2xs capitalize"
            >
              {shapes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Shape Preview Badge */}
        <div className="hidden md:flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 font-medium mt-1">
          <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0">
            {renderMark(10, 10, shape, "preview")}
          </svg>
          <span className="capitalize font-bold text-slate-800">{shape}</span>
          <span className="text-slate-400 text-[10px]">mark shape</span>
        </div>
      </div>

      {/* =========================================================================
          MUI X-Charts LineChart Box
         ========================================================================= */}
      <div className="flex-1 min-w-0">
        {/* MUI Legend Row */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#0288D1] shrink-0" />
            <span className="text-xs font-bold text-slate-800">{seriesLabel}</span>
            <span className="text-[10px] text-slate-400 font-medium">• curve: 'natural'</span>
          </div>

          {activePoint && (
            <div className="text-xs font-bold text-[#0288D1]">
              <span>{activePoint.item.month}: </span>
              <span className="text-slate-900 font-black">
                {isCurrency ? formatINR(activePoint.val) : `${activePoint.val} mm`}
              </span>
            </div>
          )}
        </div>

        {/* Chart SVG */}
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] max-h-[340px] select-none touch-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full overflow-visible"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          >
            {/* Grid: Vertical = true */}
            {coords.map((c, i) => (
              <line
                key={`vert-${i}`}
                x1={c.x}
                y1={padding.top}
                x2={c.x}
                y2={padding.top + plotHeight}
                stroke="#E2E8F0"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.8"
              />
            ))}

            {/* Grid: Horizontal = true */}
            {yTicks.map((t, i) => (
              <g key={`horiz-${i}`}>
                <line
                  x1={padding.left}
                  y1={t.yVal}
                  x2={padding.left + plotWidth}
                  y2={t.yVal}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.8"
                />
                <text
                  x={padding.left - 10}
                  y={t.yVal + 3.5}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748B"
                  fontFamily="Poppins, Roboto, sans-serif"
                  fontWeight="500"
                >
                  {t.label}
                </text>
              </g>
            ))}

            {/* X Axis Baseline Line */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke="#94A3B8"
              strokeWidth="1.2"
            />

            {/* Y Axis Baseline Line */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
              stroke="#94A3B8"
              strokeWidth="1.2"
            />

            {/* Natural Spline Line (MUI curve: 'natural') */}
            {splinePath && (
              <path
                d={splinePath}
                fill="none"
                stroke="#0288D1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Series Marks rendering according to showMark function and shape */}
            {coords.map((c) => {
              const shouldShow = marksMapping[marks]({
                index: c.idx,
                total: coords.length,
              } as any);

              if (!shouldShow) return null;
              return renderMark(c.x, c.y, shape, c.idx);
            })}

            {/* Active Crosshair & Highlight Mark on Hover */}
            {activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={padding.top}
                  x2={activePoint.x}
                  y2={padding.top + plotHeight}
                  stroke="#0288D1"
                  strokeWidth="1.2"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="7.5"
                  fill="#0288D1"
                  fillOpacity="0.25"
                />
                {renderMark(activePoint.x, activePoint.y, shape, "active-mark")}
              </g>
            )}

            {/* X Axis Point Labels */}
            {coords.map((c, i) => (
              <text
                key={`xlabel-${i}`}
                x={c.x}
                y={padding.top + plotHeight + 20}
                textAnchor="middle"
                fontSize="11"
                fill="#64748B"
                fontFamily="Poppins, Roboto, sans-serif"
                fontWeight="500"
              >
                {c.item.month}
              </text>
            ))}
          </svg>

          {/* Interactive Tooltip Card on Hover */}
          {activePoint && (
            <div
              className="absolute pointer-events-none z-30 transition-transform duration-75"
              style={{
                left: `${(activePoint.x / chartWidth) * 100}%`,
                top: `${(activePoint.y / chartHeight) * 100}%`,
                transform: `translate(${activePoint.x > chartWidth * 0.7 ? "-105%" : "12px"}, -60%)`,
              }}
            >
              <div className="bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[130px] space-y-1">
                <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1">
                  {activePoint.item.date || `${activePoint.item.month}`}
                </div>
                <div className="text-sm font-black text-amber-300">
                  {isCurrency ? formatINR(activePoint.val) : `${activePoint.val} mm`}
                </div>
                {activePoint.item.label && (
                  <div className="text-[10px] text-emerald-400 font-semibold truncate">
                    {activePoint.item.label}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
