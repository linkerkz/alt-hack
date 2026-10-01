import { Heading } from "@/components/ui/Heading";
import { STATUS_LABEL, STATUS_THRESHOLDS } from "../status";
import type { IndexPoint } from "../types";

type Props = { history: IndexPoint[]; forecast: [IndexPoint, IndexPoint] };

const WIDTH = 640;
const HEIGHT = 200;
const PLOT = { left: 40, right: 600, top: 10, bottom: 160 };
const VALUE = { max: 100, min: 40 };
const AXIS_STEP_MINUTES = 5;

// Индекс станции за время инцидента на фоне полос состояний
// и пунктиром — прогноз, если ничего не менять.
export function IndexChart({ history, forecast }: Props) {
  const scale = toScale([...history, ...forecast]);
  const [forecastStart, forecastEnd] = forecast.map(scale.point);

  return (
    <section className="flex flex-col gap-2">
      <Heading>Индекс станции</Heading>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full max-w-[760px] font-sans text-[11px]"
        role="img"
        aria-label="Индекс станции за время инцидента"
      >
        <StatusBands y={scale.y} />
        <polyline
          points={`${forecastStart.x},${forecastStart.y} ${forecastEnd.x},${forecastEnd.y}`}
          className="fill-none stroke-critical"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text
          x={(forecastStart.x + forecastEnd.x) / 2}
          y={(forecastStart.y + forecastEnd.y) / 2 - 10}
          textAnchor="middle"
          className="fill-critical italic"
        >
          прогноз без вмешательства
        </text>
        <polyline
          points={history.map(scale.point).map(toPair).join(" ")}
          className="fill-none stroke-ink"
          strokeWidth={2}
        />
        {history.map(scale.point).map((dot) => (
          <circle
            key={toPair(dot)}
            cx={dot.x}
            cy={dot.y}
            r={3.5}
            className="fill-paper stroke-ink"
            strokeWidth={1.5}
          />
        ))}
        {scale.ticks.map((tick) => (
          <text
            key={tick.label}
            x={tick.x}
            y={188}
            textAnchor="middle"
            className="fill-neutral-600"
          >
            {tick.label}
          </text>
        ))}
      </svg>
    </section>
  );
}

function StatusBands({ y }: { y: (value: number) => number }) {
  const { warning, critical } = STATUS_THRESHOLDS;
  const bands = [
    { tone: "normal", from: VALUE.max, to: warning, fill: "fill-normal/8" },
    { tone: "warning", from: warning, to: critical, fill: "fill-warning/10" },
    {
      tone: "critical",
      from: critical,
      to: VALUE.min,
      fill: "fill-critical/8",
    },
  ] as const;
  const width = PLOT.right - PLOT.left;

  return bands.map((band) => (
    <g key={band.tone}>
      <rect
        x={PLOT.left}
        y={y(band.from)}
        width={width}
        height={y(band.to) - y(band.from)}
        className={band.fill}
      />
      <text
        x={PLOT.right - 6}
        y={y(band.from) + 16}
        textAnchor="end"
        className="fill-muted"
      >
        {STATUS_LABEL[band.tone]}
      </text>
      <text
        x={PLOT.left - 6}
        y={y(band.from) + 4}
        textAnchor="end"
        className="fill-neutral-600"
      >
        {band.from}
      </text>
    </g>
  ));
}

// Ось времени — от первой до последней точки, подписи каждые 5 минут.
function toScale(points: IndexPoint[]) {
  const minutes = points.map((point) => toMinutes(point.time));
  const start = Math.min(...minutes);
  const span = Math.max(Math.max(...minutes) - start, 1);
  const x = (minute: number) =>
    PLOT.left + ((minute - start) / span) * (PLOT.right - PLOT.left);
  const y = (value: number) =>
    PLOT.top +
    ((VALUE.max - value) / (VALUE.max - VALUE.min)) * (PLOT.bottom - PLOT.top);
  const point = (p: IndexPoint) => ({ x: x(toMinutes(p.time)), y: y(p.value) });

  const firstTick = Math.ceil(start / AXIS_STEP_MINUTES) * AXIS_STEP_MINUTES;
  const ticks = [];
  for (let m = firstTick; m <= start + span; m += AXIS_STEP_MINUTES) {
    ticks.push({ x: x(m), label: toTime(m) });
  }
  return { y, point, ticks };
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function toTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}`;
}

function toPair({ x, y }: { x: number; y: number }) {
  return `${x},${y}`;
}
