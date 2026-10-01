import { STEP, STEP_MINUTE } from "./mock";
import { isFocusAvailable } from "./schema";
import type { ConsoleState } from "./types";

// План занятости путей (диаграмма Ганта) на окне 14:00–14:45.

export type PlanBarKind =
  | "fact"
  | "plan"
  | "conflict"
  | "preview"
  | "new"
  | "closed";

const WINDOW_MINUTES = 45;
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

export function trackPlan(state: ConsoleState) {
  const now = STEP_MINUTE[state.step];
  const bars = barsAt(state);
  const focus = isFocusAvailable(state) && state.focus;

  return {
    nowPercent: percentOf(now),
    ticks: TICK_MINUTES.map((minute) => ({
      left: percentOf(minute),
      label: `14:${String(minute).padStart(2, "0")}`,
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

function barsAt({ step, option }: ConsoleState) {
  const bars: Bar[] = [];
  const add = (
    track: number,
    from: number,
    to: number,
    label: string,
    kind: PlanBarKind,
  ) => bars.push({ track, from, to, label, kind });
  const fault = step >= STEP.suspected && step <= STEP.repaired;
  const preview = step === STEP.choosing || step === STEP.approval;
  const isB = option === "B";

  add(2, 4, 7, "3307", "fact");
  add(2, 26, 29, "2236", "plan");
  add(3, 0, 7, "7015", "fact");
  add(4, 0, 24, "2114 груз.", "plan");
  add(1, 35, 37, "3412", "plan");
  add(6, 20, 32, "Манёвры ТЭМ2", "plan");

  if (step === STEP.normal) {
    add(3, 12, 20, "101 пасс.", "plan");
    add(5, 18, 40, "2001 груз.", "plan");
  }
  if (step >= STEP.suspected && step <= STEP.approval) {
    add(3, 12, 20, "101 · конфликт", "conflict");
    add(5, 18, 40, "2001 · конфликт", "conflict");
  }
  if (fault) {
    add(3, 8, step >= STEP.repaired ? 29 : 30, "", "closed");
    add(5, 8, step >= STEP.repaired ? 29 : 18, "С3 закрыта", "closed");
  }
  if (step >= STEP.restored) add(3, 8, 29, "С3 закрыта", "fact");

  // Новые нитки поездов: пунктиром — предпросмотр, сплошной — принятый план.
  const decision = preview ? "preview" : step >= STEP.decided ? "new" : null;
  if (decision != null) {
    const labelOf = (train: string, track: number) =>
      decision === "preview" ? `${train} → путь ${track}` : train;
    add(1, 15, 23, labelOf("101", 1), decision);
    if (isB) add(4, 27, 45, labelOf("2001", 4), decision);
    else add(1, 24, 34, labelOf("2001", 1), decision);
  }
  return bars;
}

type Bar = {
  track: number;
  from: number;
  to: number;
  label: string;
  kind: PlanBarKind;
};

function percentOf(minute: number) {
  return (minute / WINDOW_MINUTES) * 100;
}
