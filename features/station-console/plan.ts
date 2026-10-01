import { toClock, toMinutes } from "@/lib/clock";
import { activeOption, forecastFor, type PlanSource } from "./activePlan";
import type { Run, Span } from "./forecast";
import { FAULT, OPTION_CHANGES, SHUNTING, STEP } from "./mock";
import { isFocusAvailable } from "./schema";
import type { ConsoleState, OptionId } from "./types";

// План занятости путей (диаграмма Ганта) на окне 45 минут по прогнозу
// действующего плана: до решения поезда, которым мешает сбой, — конфликты,
// после — нитки принятого варианта. Окно сценария — 14:00–14:45, живого
// плана — от четверти часа назад.

export type PlanBarKind =
  | "fact"
  | "plan"
  | "conflict"
  | "preview"
  | "new"
  | "closed";

const WINDOW_MINUTES = 45;
const SCENARIO_FROM = toMinutes("14:00");
// Сколько прошлого видно в живом плане; начало окна — кратно шагу шкалы.
const PAST_MINUTES = 15;
const TICK_STEP = 5;
const TICK_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40];

const ROWS = [
  { track: 5, note: "" },
  { track: 3, note: "платформа" },
  { track: 1, note: "главный" },
  { track: 2, note: "главный" },
  { track: 4, note: "" },
  { track: 6, note: "тупик" },
];

// Пути вне инцидента: в фокусе приглушаем.
const QUIET_TRACKS = [2, 6];

// Стоянка не короче — подписываем род поезда: на полосе хватает места.
const LONG_STOP_MINUTES = 8;

export function trackPlan(state: ConsoleState, source: PlanSource) {
  const { now } = source;
  const window = windowOf(source);
  const percentOf = (minute: number) => percentIn(window, minute);
  const bars = barsAt(state, source).filter(
    (bar) => bar.to > window.from && bar.from < window.to,
  );
  const focus = isFocusAvailable(state) && state.focus;

  return {
    window: `${toClock(window.from)}–${toClock(window.to)}`,
    nowPercent: percentOf(now),
    ticks: TICK_MINUTES.map((minute) => ({
      left: percentOf(window.from + minute),
      label: toClock(window.from + minute),
    })),
    rows: ROWS.map((row) => ({
      ...row,
      dimmed: focus && QUIET_TRACKS.includes(row.track),
      bars: bars
        .filter((bar) => bar.track === row.track)
        .map((bar) => ({
          label: bar.label,
          // Плановая операция, которая уже завершилась, — факт.
          kind: bar.kind === "plan" && bar.to <= now ? "fact" : bar.kind,
          left: percentOf(bar.from),
          width: percentOf(bar.to) - percentOf(bar.from),
        })),
    })),
  };
}

function barsAt(state: ConsoleState, source: PlanSource) {
  const { step } = state;
  const option = activeOption(step, state.option);
  const isDeciding = step >= STEP.suspected && step < STEP.decided;
  const changed = changedTrains(step >= STEP.decided ? option : null);
  const bars: Bar[] = forecastFor(source, option).map((run) =>
    isDeciding && run.waited
      ? {
          ...barOf(run, run.planned, "conflict"),
          label: `${run.train} · конфликт`,
        }
      : barOf(run, run.forecast, changed.includes(run.train) ? "new" : "plan"),
  );

  // Пунктиром — нитки варианта, который диспетчер сейчас смотрит.
  if (step === STEP.choosing || step === STEP.approval) {
    const viewed = changedTrains(state.option);
    for (const run of forecastFor(source, state.option)) {
      if (!viewed.includes(run.train)) continue;
      const label = `${run.train} → путь ${run.track}`;
      bars.push({ ...barOf(run, run.forecast, "preview"), label });
    }
  }

  // С3 закрыта со сбоя; после возврата в эксплуатацию это уже факт.
  if (step !== STEP.normal) {
    const kind = step >= STEP.restored ? "fact" : "closed";
    for (const track of closedTracks(source)) {
      const label = "С3 закрыта";
      bars.push({ track, ...span(FAULT.from, FAULT.until), label, kind });
    }
  }
  // Манёвры ТЭМ2 — часть сценария: в живом плане их нет.
  if (!source.simulated) {
    bars.push({
      track: SHUNTING.track,
      ...span(SHUNTING.from, SHUNTING.until),
      label: "Манёвры ТЭМ2",
      kind: "plan",
    });
  }
  return bars;
}

function windowOf({ now, simulated }: PlanSource): Span {
  const from = simulated
    ? Math.floor((now - PAST_MINUTES) / TICK_STEP) * TICK_STEP
    : SCENARIO_FROM;
  return { from, to: from + WINDOW_MINUTES };
}

function barOf(run: Run, at: Run["planned"], kind: PlanBarKind) {
  const isLong = at.to - at.from >= LONG_STOP_MINUTES;
  const suffix = run.kind === "freight" ? " груз." : " пасс.";
  const label = isLong ? run.train + suffix : run.train;
  return { track: run.track, from: at.from, to: at.to, label, kind };
}

function changedTrains(option: OptionId | null) {
  return option == null ? [] : OPTION_CHANGES[option].map((c) => c.train);
}

// Пути, маршруты на которые идут через закрытую стрелку.
function closedTracks({ layout }: PlanSource) {
  const routes = layout.routes.filter((r) =>
    r.switches.includes(FAULT.switchId),
  );
  return [...new Set(routes.map((route) => route.track))];
}

function span(from: string, until: string) {
  return { from: toMinutes(from), to: toMinutes(until) };
}

type Bar = {
  track: number;
  from: number;
  to: number;
  label: string;
  kind: PlanBarKind;
};

// Полосы за краями окна обрезаем.
function percentIn(window: Span, minute: number) {
  const offset = Math.min(Math.max(minute - window.from, 0), WINDOW_MINUTES);
  return (offset / WINDOW_MINUTES) * 100;
}
