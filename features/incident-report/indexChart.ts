import type { Tone } from "@/components/ui/tone";
import { STATUS_THRESHOLDS } from "./status";
import type { IndexPoint } from "./types";

// Геометрия графика индекса — общая для страницы отчёта и его PDF.
export const CHART = {
  width: 640,
  height: 200,
  plot: { left: 40, right: 600, top: 10, bottom: 160 },
  axisY: 188,
};

const VALUE = { max: 100, min: 40 };
const AXIS_STEP_MINUTES = 5;

type Band = { tone: Tone; from: number; to: number };

// Полосы состояний сверху вниз: значения индекса от from до to.
export function statusBands(): Band[] {
  const { warning, critical } = STATUS_THRESHOLDS;
  return [
    { tone: "normal", from: VALUE.max, to: warning },
    { tone: "warning", from: warning, to: critical },
    { tone: "critical", from: critical, to: VALUE.min },
  ];
}

// Ось времени — от первой до последней точки, подписи каждые 5 минут.
export function toScale(points: IndexPoint[]) {
  const { plot } = CHART;
  const minutes = points.map((point) => toMinutes(point.time));
  const start = Math.min(...minutes);
  const span = Math.max(Math.max(...minutes) - start, 1);
  const x = (minute: number) =>
    plot.left + ((minute - start) / span) * (plot.right - plot.left);
  const y = (value: number) =>
    plot.top +
    ((VALUE.max - value) / (VALUE.max - VALUE.min)) * (plot.bottom - plot.top);
  const point = (p: IndexPoint) => ({ x: x(toMinutes(p.time)), y: y(p.value) });

  const firstTick = Math.ceil(start / AXIS_STEP_MINUTES) * AXIS_STEP_MINUTES;
  const ticks = [];
  for (let m = firstTick; m <= start + span; m += AXIS_STEP_MINUTES) {
    ticks.push({ x: x(m), label: toTime(m) });
  }
  return { y, point, ticks };
}

export function toPair({ x, y }: { x: number; y: number }) {
  return `${x},${y}`;
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
