import { Heading } from "@/components/ui/Heading";
import type { Tone } from "@/components/ui/tone";
import { CHART, statusBands, toPair, toScale } from "../indexChart";
import { STATUS_LABEL } from "../status";
import type { IndexPoint } from "../types";

type Props = { history: IndexPoint[]; forecast: [IndexPoint, IndexPoint] };

// Классы пишем целиком, чтобы сканер Tailwind их нашёл.
const BAND_FILL: Record<Tone, string> = {
  normal: "fill-normal/8",
  warning: "fill-warning/10",
  critical: "fill-critical/8",
};

// Индекс станции за время инцидента на фоне полос состояний
// и пунктиром — прогноз, если ничего не менять.
export function IndexChart({ history, forecast }: Props) {
  const scale = toScale([...history, ...forecast]);
  const [forecastStart, forecastEnd] = forecast.map(scale.point);

  return (
    <section className="flex flex-col gap-2">
      <Heading>Индекс станции</Heading>
      <svg
        viewBox={`0 0 ${CHART.width} ${CHART.height}`}
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
            y={CHART.axisY}
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
  const { plot } = CHART;

  return statusBands().map((band) => (
    <g key={band.tone}>
      <rect
        x={plot.left}
        y={y(band.from)}
        width={plot.right - plot.left}
        height={y(band.to) - y(band.from)}
        className={BAND_FILL[band.tone]}
      />
      <text
        x={plot.right - 6}
        y={y(band.from) + 16}
        textAnchor="end"
        className="fill-muted"
      >
        {STATUS_LABEL[band.tone]}
      </text>
      <text
        x={plot.left - 6}
        y={y(band.from) + 4}
        textAnchor="end"
        className="fill-neutral-600"
      >
        {band.from}
      </text>
    </g>
  ));
}
