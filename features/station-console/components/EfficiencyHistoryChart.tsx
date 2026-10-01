import { STATUS_COLOR, toStatus } from "@/lib/status";
import type { EfficiencyPoint } from "../types";

const WIDTH = 480;
const HEIGHT = 96;
const PADDING = 8;

export function EfficiencyHistoryChart({
  points,
}: {
  points: EfficiencyPoint[];
}) {
  if (points.length === 0) return null;

  const lastValue = points[points.length - 1].value;
  const color = STATUS_COLOR[toStatus(lastValue)];

  return (
    <section className="space-y-3 rounded-lg border border-line bg-surface-1 p-5">
      <p className="text-[11px] text-muted uppercase tracking-widest">
        Динамика индекса эффективности
      </p>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Динамика индекса эффективности"
      >
        <polyline
          points={toPolylinePoints(points)}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex justify-between text-[11px] text-muted">
        {points.map((point) => (
          <span key={point.time}>{point.time}</span>
        ))}
      </div>
    </section>
  );
}

function toPolylinePoints(points: EfficiencyPoint[]): string {
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const span = Math.max(Math.max(...values) - min, 1);
  const innerWidth = WIDTH - PADDING * 2;
  const innerHeight = HEIGHT - PADDING * 2;
  const lastIndex = Math.max(points.length - 1, 1);

  return points
    .map((point, index) => {
      const x = PADDING + (index / lastIndex) * innerWidth;
      const y =
        PADDING + innerHeight - ((point.value - min) / span) * innerHeight;
      return `${x},${y}`;
    })
    .join(" ");
}
