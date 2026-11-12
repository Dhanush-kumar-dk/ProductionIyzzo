import * as React from "react";
import { formatINR, formatChartTick } from "../utils/priceHistory";

export type Shape = "circle" | "square" | "diamond" | "cross" | "star" | "triangle" | "wye";

export type MarkCallback = (params: { index: number; total: number }) => boolean;

export const marksMapping: Record<string, MarkCallback> = {
  true: () => true,
  false: () => false,
  start: ({ index }) => index === 0,
  end: ({ index, total }) => index === total - 1,
  "({index})=>index%2===0": ({ index }) => index % 2 === 0,
};

// Fallback price dataset (clean domain-appropriate fallback)
export const defaultPriceDataset = [
  { month: "Sep", price: 1999 },
  { month: "Oct", price: 1799 },
  { month: "Nov", price: 1899 },
];

// Preserved alias for complete backward compatibility
export const defaultWeatherDataset = defaultPriceDataset;

/**
 * Natural Cubic Spline (D3 curveNatural as used in MUI X-Charts curve: 'natural')
 * Solves tridiagonal matrix system with zero second-derivatives at boundaries
 */
function getNaturalSplinePath(points: readonly { x: number; y: number }[]): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  if (n === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  const nm1 = n - 1;
  const a = new Float64Array(nm1);
  const b = new Float64Array(nm1);
  const c = new Float64Array(nm1);
  const rX = new Float64Array(nm1);
  const rY = new Float64Array(nm1);

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

  for (let i = 1; i < nm1; i++) {
    const m = a[i] / b[i - 1];
    b[i] -= m * c[i - 1];
    rX[i] -= m * rX[i - 1];
    rY[i] -= m * rY[i - 1];
  }

  const p1X = new Float64Array(nm1);
  const p1Y = new Float64Array(nm1);
  p1X[n - 2] = rX[n - 2] / b[n - 2];
  p1Y[n - 2] = rY[n - 2] / b[n - 2];
  for (let i = n - 3; i >= 0; i--) {
    p1X[i] = (rX[i] - c[i] * p1X[i + 1]) / b[i];
    p1Y[i] = (rY[i] - c[i] * p1Y[i + 1]) / b[i];
  }

  const p2X = new Float64Array(nm1);
  const p2Y = new Float64Array(nm1);
  for (let i = 0; i < n - 2; i++) {
    p2X[i] = 2 * points[i + 1].x - p1X[i + 1];
    p2Y[i] = 2 * points[i + 1].y - p1Y[i + 1];
  }
  p2X[n - 2] = (points[n - 1].x + p1X[n - 2]) / 2;
  p2Y[n - 2] = (points[n - 1].y + p1Y[n - 2]) / 2;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < nm1; i++) {
    path += ` C ${p1X[i].toFixed(1)} ${p1Y[i].toFixed(1)}, ${p2X[i].toFixed(1)} ${p2Y[i].toFixed(1)}, ${points[i + 1].x.toFixed(1)} ${points[i + 1].y.toFixed(1)}`;
  }
  return path;
}

/**
 * Render individual SVG mark based on shape type
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
          <line x1={x} y1={y + 0} x2={x + 4.8} y2={y + 2.8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={x} y1={y + 0} x2={x - 4.8} y2={y + 2.8} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
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
  dataset?: Array<{ month: string; price?: number; [key: string]: string | number | undefined }>;
  seriesLabel?: string;
  dataKey?: string;
  height?: number;
  isCurrency?: boolean;
  marks?: keyof typeof marksMapping;
  shape?: Shape;
}

export default function LineMarkShape({
  dataset = defaultPriceDataset,
  seriesLabel = "Price History (₹)",
  dataKey = "price",
  height = 280,
  isCurrency = true,
  marks = "true",
  shape = "circle",
}: LineMarkShapeProps) {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  // SVG Geometry Constants
  const chartWidth = 860;
  const chartHeight = height;
  const padding = React.useMemo(() => ({ top: 30, right: 35, bottom: 45, left: 65 }), []);
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Resolve values in a single pass
  const { values, minVal, maxVal } = React.useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    const vals: number[] = new Array(dataset.length);

    for (let i = 0; i < dataset.length; i++) {
      const row = dataset[i];
      const rawVal = row[dataKey];
      const v = typeof rawVal === "number" ? rawVal : 0;
      vals[i] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }

    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 100;

    return { values: vals, minVal: min, maxVal: max };
  }, [dataset, dataKey]);

  const range = maxVal - minVal || 100;
  const yMin = Math.max(0, Math.floor((minVal - range * 0.12) / 10) * 10);
  const yMax = Math.ceil((maxVal + range * 0.12) / 10) * 10;
  const yDomain = yMax - yMin || 1;

  // Calculate coordinates with memoization
  const coords = React.useMemo(() => {
    const total = dataset.length;
    const denominator = Math.max(1, total - 1);
    return dataset.map((item, idx) => {
      const val = values[idx];
      const x = padding.left + (idx / denominator) * plotWidth;
      const y = padding.top + ((yMax - val) / yDomain) * plotHeight;
      return { x, y, val, item, idx };
    });
  }, [dataset, values, padding.left, padding.top, plotWidth, plotHeight, yMax, yDomain]);

  // Generate D3 natural spline path
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
    for (let i = 0; i < coords.length; i++) {
      const dist = Math.abs(coords[i].x - svgX);
      if (dist < minD) {
        minD = dist;
        closest = i;
      }
    }
    setHoveredIdx(closest);
  };

  const handlePointerLeave = () => {
    setHoveredIdx(null);
  };

  const activePoint = hoveredIdx !== null ? coords[hoveredIdx] : null;

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs font-poppins text-slate-900 w-full">
      {/* Legend Row */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-xs bg-[#0288D1] shrink-0 shadow-2xs" />
          <span className="text-xs sm:text-sm font-bold text-slate-900">{seriesLabel}</span>
          <span className="text-[11px] text-slate-400 font-medium">• curve: 'natural'</span>
        </div>

        {activePoint && (
          <div className="text-xs sm:text-sm font-bold text-[#0288D1]">
            <span>{activePoint.item.month}: </span>
            <span className="text-slate-950 font-black">
              {isCurrency ? formatINR(activePoint.val) : `${activePoint.val}`}
            </span>
          </div>
        )}
      </div>

      {/* Full-Width Chart SVG */}
      <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] max-h-[360px] select-none touch-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          {/* Grid: Vertical */}
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
              opacity="0.85"
            />
          ))}

          {/* Grid: Horizontal */}
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
                opacity="0.85"
              />
              <text
                x={padding.left - 12}
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

          {/* Bottom X-Axis Line */}
          <line
            x1={padding.left}
            y1={padding.top + plotHeight}
            x2={padding.left + plotWidth}
            y2={padding.top + plotHeight}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Left Y-Axis Line */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotHeight}
            stroke="#94A3B8"
            strokeWidth="1.5"
          />

          {/* Area Fill Gradient under Spline */}
          <defs>
            <linearGradient id="areaGlowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0288D1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0288D1" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {coords.length > 1 && (
            <path
              d={`${splinePath} L ${coords[coords.length - 1].x} ${padding.top + plotHeight} L ${coords[0].x} ${
                padding.top + plotHeight
              } Z`}
              fill="url(#areaGlowGradient)"
            />
          )}

          {/* Spline Path */}
          <path
            d={splinePath}
            fill="none"
            stroke="#0288D1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Marks */}
          {coords.map((c, i) => {
            const shouldRender = marksMapping[marks]({ index: i, total: coords.length });
            if (!shouldRender) return null;
            return renderMark(c.x, c.y, shape, `mark-${i}`);
          })}

          {/* Hover Crosshair and Tooltip */}
          {activePoint && (
            <g pointerEvents="none">
              <line
                x1={activePoint.x}
                y1={padding.top}
                x2={activePoint.x}
                y2={padding.top + plotHeight}
                stroke="#0288D1"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r={7}
                fill="#0288D1"
                stroke="#FFFFFF"
                strokeWidth={3}
                className="drop-shadow-sm"
              />
            </g>
          )}

          {/* X-Axis Ticks & Month Labels */}
          {coords.map((c, i) => (
            <text
              key={`x-label-${i}`}
              x={c.x}
              y={padding.top + plotHeight + 20}
              textAnchor="middle"
              fontSize="11"
              fill={activePoint?.idx === i ? "#0288D1" : "#64748B"}
              fontFamily="Poppins, Roboto, sans-serif"
              fontWeight={activePoint?.idx === i ? "700" : "500"}
            >
              {c.item.month}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
