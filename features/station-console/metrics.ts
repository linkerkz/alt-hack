import type { Run, Span } from "./forecast";
import { MAX_SCORE, METRICS } from "./status";
import type { StationLayout } from "./types";

// Показатели индекса по прогнозу плана на получасовом окне от now
// (docs/case_solution.md §5). Задержка поезда — насколько прогноз позже
// исходного плана; удержание по варианту — тоже задержка, но не конфликт.

// Окно плана — горизонт решения ДСП.
const WINDOW_MINUTES = 30;

export function evaluatePlan(runs: Run[], layout: StationLayout, now: number) {
  const window = { from: now, to: now + WINDOW_MINUTES };
  const inWindow = runs.filter(
    (run) => overlaps(run.planned, window) || overlaps(run.forecast, window),
  );
  const delays = inWindow.map(delayOf);
  const values = [
    throughput(inWindow, window),
    round(average(delays), 1),
    trackLoad(inWindow, layout, window),
    inWindow.filter((run) => run.waited).length,
    sum(
      inWindow
        .filter((run) => layout.crewTrains.includes(run.train))
        .map(delayOf),
    ),
  ];
  const scores = values.map((value, i) => scoreOf(value, METRICS[i]));

  return {
    values,
    scores,
    index: sum(scores),
    maxDelay: Math.max(0, ...delays),
    passengerDelay: Math.max(
      0,
      ...inWindow.filter((run) => run.kind === "passenger").map(delayOf),
    ),
  };
}

export type PlanScore = ReturnType<typeof evaluatePlan>;

// Доля прибытий и отправлений окна, которые по прогнозу успевают до его конца.
function throughput(runs: Run[], window: Span) {
  const events = runs.flatMap((run) => [
    { planned: run.planned.from, forecast: run.forecast.from },
    { planned: run.planned.to, forecast: run.forecast.to },
  ]);
  const planned = events.filter((event) => isInside(event.planned, window));
  if (planned.length === 0) return 100;
  const done = planned.filter((event) => event.forecast <= window.to);
  return Math.round((done.length / planned.length) * 100);
}

// Доля времени окна, которую приёмо-отправочные пути заняты поездами.
function trackLoad(runs: Run[], layout: StationLayout, window: Span) {
  const tracks = layout.tracks
    .filter((track) => track.kind === "receiving")
    .map((track) => track.number);
  if (tracks.length === 0) return 0;
  const busy = runs
    .filter((run) => tracks.includes(run.track))
    .map((run) => overlapMinutes(run.forecast, window));
  return Math.round((sum(busy) / (tracks.length * WINDOW_MINUTES)) * 100);
}

function delayOf({ planned, forecast }: Run) {
  return Math.max(0, forecast.from - planned.from, forecast.to - planned.to);
}

// Линейно между good (полный балл) и bad (ноль).
function scoreOf(value: number, { good, bad }: { good: number; bad: number }) {
  const share = (bad - value) / (bad - good);
  return Math.round(Math.min(1, Math.max(0, share)) * MAX_SCORE);
}

function overlaps(a: Span, b: Span) {
  return a.from < b.to && b.from < a.to;
}

function overlapMinutes(a: Span, b: Span) {
  return Math.max(0, Math.min(a.to, b.to) - Math.max(a.from, b.from));
}

function isInside(minute: number, window: Span) {
  return minute >= window.from && minute <= window.to;
}

function average(values: number[]) {
  return values.length === 0 ? 0 : sum(values) / values.length;
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
