import {
  FLOW_LABEL,
  FLOW_ORDER,
  layoutRadar,
  RADAR_HORIZON_MINUTES,
  radarPointTitle,
  SECTOR_SPAN_DEG,
  toCartesian,
} from "../radar";
import type { RadarTrain } from "../types";

type Props = {
  trains: RadarTrain[];
  hovered: RadarTrain | null;
  onHover: (train: RadarTrain | null) => void;
};

// Координаты в единицах viewBox: центр — станция, край — горизонт прогноза.
const SIZE = 440;
const CENTER = SIZE / 2;
const RADIUS = 180;
// Поезд «сейчас» не садится в центр, чтобы не закрыть отметку станции.
const MIN_RADIUS = 10;
const RING_MINUTES = [60, 120, 180];

export function RadarChart({ trains, hovered, onHover }: Props) {
  const points = layoutRadar(trains);

  return (
    <div className="relative aspect-square w-full">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0 size-full overflow-visible"
        role="img"
        aria-label="Радар движения поездов на 3 часа"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          className="fill-paper stroke-neutral-400"
        />
        {RING_MINUTES.slice(0, -1).map((minutes) => (
          <circle
            key={minutes}
            cx={CENTER}
            cy={CENTER}
            r={toRadius(minutes)}
            className="fill-none stroke-line"
          />
        ))}
        {FLOW_ORDER.map((flow, index) => (
          <Sector key={flow} index={index} label={FLOW_LABEL[flow].label} />
        ))}
        {RING_MINUTES.map((minutes) => (
          <text
            key={minutes}
            x={CENTER + 4}
            y={CENTER - toRadius(minutes) - 3}
            className="fill-muted text-[10px]"
          >
            {minutes} мин
          </text>
        ))}
        <circle cx={CENTER} cy={CENTER} r={5} className="fill-ink" />

        {points.map((point) => {
          const { x, y } = toCartesian(
            point.angle,
            Math.max(MIN_RADIUS, toRadius(point.radiusMinutes)),
            CENTER,
          );
          const isPassenger = point.kind === "passenger";
          const isHovered =
            hovered?.number === point.number && hovered.flow === point.flow;
          return (
            // biome-ignore lint/a11y/noStaticElementInteractions: наведение дублирует список «Ближайшие» и <title>
            <g
              key={`${point.number}-${point.flow}`}
              onMouseEnter={() => onHover(point)}
              onMouseLeave={() => onHover(null)}
              className="cursor-pointer"
            >
              <title>{radarPointTitle(point)}</title>
              {isHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  className="fill-none stroke-accent"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isPassenger ? 6.5 : 5.5}
                strokeWidth={isPassenger ? 1 : 2}
                className={
                  isPassenger
                    ? "fill-neutral-800 stroke-neutral-900"
                    : "fill-paper stroke-neutral-800"
                }
              />
            </g>
          );
        })}
      </svg>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[9.09%] rounded-full motion-safe:animate-sweep"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg 290deg, color-mix(in srgb, var(--color-ink) 12%, transparent) 360deg)",
        }}
      />
    </div>
  );
}

// Граница сектора и его подпись за краем радара, посередине дуги.
function Sector({ index, label }: { index: number; label: string }) {
  const edge = toCartesian(index * SECTOR_SPAN_DEG, RADIUS, CENTER);
  const caption = toCartesian(
    (index + 0.5) * SECTOR_SPAN_DEG,
    RADIUS + 26,
    CENTER,
  );
  return (
    <g>
      <line
        x1={CENTER}
        y1={CENTER}
        x2={edge.x}
        y2={edge.y}
        className="stroke-neutral-300"
      />
      <text
        x={caption.x}
        y={caption.y + 6}
        textAnchor="middle"
        className="fill-ink font-heading font-semibold text-[18px]"
      >
        {label}
      </text>
    </g>
  );
}

function toRadius(minutes: number) {
  return (minutes / RADAR_HORIZON_MINUTES) * RADIUS;
}
