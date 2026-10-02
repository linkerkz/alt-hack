import { Tag } from "@/components/ui/Tag";
import { TONE_COLOR } from "@/components/ui/tone";
import { INDEX_THRESHOLDS } from "@/lib/efficiencyIndex";
import { toStatus } from "../status";
import type { EfficiencyPoint } from "../types";

// Координаты графика в единицах viewBox: ось значений — от FLOOR до 100.
const WIDTH = 320;
const HEIGHT = 130;
const LEFT = 28;
const RIGHT = 308;
const TOP = 12;
const BASELINE = 110;
const FLOOR = 30;

type Point = EfficiencyPoint & { x: number; y: number };

export function EfficiencyHistoryChart({
  points,
}: {
  points: EfficiencyPoint[];
}) {
  if (points.length === 0) return null;

  const placed = placePoints(points);
  const color = TONE_COLOR[toStatus(placed[placed.length - 1].value)];
  const line = placed.map(({ x, y }, i) => `${i ? "L" : "M"}${x} ${y}`);
  const path = line.join(" ");

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-heading font-semibold text-[17px]">
          Динамика за смену
        </h3>
        {/* Истории замеров в базе нет — ряд выведен из текущих показателей (mock.ts). */}
        <Tag>модельный ряд</Tag>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mx-auto block h-auto max-h-[220px] w-full overflow-visible"
        role="img"
        aria-label="Динамика индекса эффективности за смену"
      >
        <Threshold value={INDEX_THRESHOLDS.normal} />
        <Threshold value={INDEX_THRESHOLDS.warning} />
        <line
          x1={LEFT}
          x2={RIGHT}
          y1={BASELINE}
          y2={BASELINE}
          className="stroke-neutral-400"
        />
        <path
          d={`${path} L${RIGHT} ${BASELINE} L${LEFT} ${BASELINE} Z`}
          fill={color}
          opacity={0.1}
        />
        <path d={path} fill="none" stroke={color} strokeWidth={1.6} />
        {placed.map((point) => (
          <g key={point.time} className="text-[9px]">
            <circle
              cx={point.x}
              cy={point.y}
              r={2.6}
              stroke={color}
              strokeWidth={1.4}
              className="fill-card"
            />
            <text
              x={point.x}
              y={point.y - 7}
              textAnchor="middle"
              className="fill-ink"
            >
              {point.value}
            </text>
            <text
              x={point.x}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-muted"
            >
              {point.time}
            </text>
          </g>
        ))}
      </svg>
    </>
  );
}

function Threshold({ value }: { value: number }) {
  const y = toY(value);
  return (
    <g>
      <line
        x1={LEFT}
        x2={RIGHT}
        y1={y}
        y2={y}
        strokeDasharray="2 3"
        className="stroke-neutral-300"
      />
      <text
        x={LEFT - 6}
        y={y + 3}
        textAnchor="end"
        className="fill-muted text-[9px]"
      >
        {value}
      </text>
    </g>
  );
}

function placePoints(points: EfficiencyPoint[]): Point[] {
  const step = (RIGHT - LEFT) / Math.max(points.length - 1, 1);
  return points.map((point, index) => ({
    ...point,
    x: LEFT + index * step,
    y: toY(point.value),
  }));
}

function toY(value: number) {
  const share = (Math.max(value, FLOOR) - FLOOR) / (100 - FLOOR);
  return BASELINE - share * (BASELINE - TOP);
}
