import { STEP } from "./mock";
import { routeDone } from "./routing";
import type { ChosenOption, ConsoleState, Neighbors, Status } from "./types";

// Динамика схемы станции на шаге сценария: занятость путей, поезда,
// закрытые съезды и предпросмотр варианта. Геометрия — в StationSchema.

export type SchemaTrain = {
  label: string;
  track: TrackNumber;
  x: number;
  width: number;
  kind: "passenger" | "freight";
  // Затронут инцидентом — обводка цветом «Критично».
  late: boolean;
  dimmed: boolean;
};

// Линии поверх путей: предпросмотр варианта (пунктир) или заданный маршрут.
type Overlay = {
  paths: string[];
  label: string;
  labelX: number;
  labelY: number;
  dashed: boolean;
};

export type TrackNumber = 1 | 2 | 3 | 4 | 5 | 6;

// Пути сверху вниз: ось y и края на схеме 1000×360.
export const TRACKS: { n: TrackNumber; y: number; from: number; to: number }[] =
  [
    { n: 5, y: 60, from: 225, to: 775 },
    { n: 3, y: 115, from: 145, to: 855 },
    { n: 1, y: 170, from: 0, to: 1000 },
    { n: 2, y: 230, from: 0, to: 1000 },
    { n: 4, y: 285, from: 165, to: 835 },
    { n: 6, y: 335, from: 520, to: 750 },
  ];

// Поезда инцидента: в фокусе остальные приглушаются.
const INCIDENT_TRAINS = ["101", "2001"];

export function stationSchema(state: ConsoleState, neighbors: Neighbors) {
  const { step, option } = state;
  const fault = step >= STEP.suspected && step <= STEP.repaired;
  const preview = step === STEP.choosing || step === STEP.approval;
  const focus = isFocusAvailable(state) && state.focus;

  return {
    occupied: occupiedTracks(step, option),
    fault,
    switchC3: switchC3(step, fault),
    entrySignal: entrySignal(state),
    overlay: preview ? previewRoute(option) : issuedRoute(state),
    trains: trainsAt(step, option).map((train) => ({
      ...train,
      dimmed: focus && !INCIDENT_TRAINS.includes(train.label.split(" ")[0]),
    })),
    offNote: offNoteAt(step, option, neighbors),
    note: fault
      ? `Маршруты через С3 закрыты${preview ? " · пунктир — предлагаемое изменение" : ""}`
      : "Все объекты исправны",
    focusAvailable: isFocusAvailable(state),
    focus,
  };
}

export function isFocusAvailable({ step, tab }: ConsoleState) {
  return tab === "incident" && step >= STEP.suspected && step <= STEP.restored;
}

function occupiedTracks(step: number, option: ChosenOption) {
  const occupied: TrackNumber[] = [6];
  const onTrack1 =
    step === STEP.decided ||
    step === STEP.repairing ||
    (step >= STEP.repaired && option === "A");
  if (onTrack1) occupied.push(1);
  if (step === STEP.normal) occupied.push(2, 3);
  if (step <= STEP.repairing || option === "B") occupied.push(4);
  return occupied;
}

function switchC3(step: number, fault: boolean) {
  if (!fault) return { status: null, label: "С3" };
  const label =
    step === STEP.repaired ? "С3 · проверена, ждёт ДСП" : "С3 · нет контроля";
  return { status: "critical" as Status, label };
}

// Входной Н запрещает приём, пока маршрут 101 не задан по новому плану.
function entrySignal(state: ConsoleState): Status | null {
  const { step } = state;
  if (step === STEP.decided && routeDone(state).r101) return "normal";
  return step >= STEP.suspected && step <= STEP.decided ? "critical" : null;
}

// Маршрут, который ДСП уже задал для 101: сплошная линия поверх пути 1.
function issuedRoute(state: ConsoleState): Overlay | null {
  if (state.step !== STEP.decided || !routeDone(state).r101) return null;
  return {
    paths: ["M40 170 H200"],
    label: "Маршрут Н → путь 1 задан",
    labelX: 60,
    labelY: 196,
    dashed: false,
  };
}

function previewRoute(option: ChosenOption): Overlay {
  return {
    paths: [
      "M0 170 H420",
      option === "B" ? "M0 230 H110 L165 285 H300" : "M0 170 H300",
    ],
    label: `Предпросмотр: ${option === "B" ? "вариант б" : "вариант а"}`,
    labelX: 200,
    labelY: 200,
    dashed: true,
  };
}

function trainsAt(step: number, option: ChosenOption) {
  const trains: Omit<SchemaTrain, "dimmed">[] = [];
  const add = (
    label: string,
    track: TrackNumber,
    x: number,
    width: number,
    kind: SchemaTrain["kind"],
    late = false,
  ) => trains.push({ label, track, x, width, kind, late });

  if (step === STEP.normal) {
    add("7015", 3, 420, 140, "passenger");
    add("3307", 2, 600, 200, "freight");
    add("101 →", 1, 4, 62, "passenger");
  }
  if (step >= STEP.suspected && step <= STEP.approval) {
    add("101", 1, 2, 36, "passenger", true);
  }
  if (step === STEP.decided) add("101 →", 1, 200, 130, "passenger");
  if (step === STEP.repairing) add("101", 1, 400, 150, "passenger");
  if (step <= STEP.repairing) add("2114", 4, 290, 250, "freight");
  if (step >= STEP.repaired) {
    if (option === "B") add("2001", 4, 290, 250, "freight");
    else add("2001", 1, 300, 250, "freight");
  }
  add("ТЭМ2", 6, 540, 46, "freight");
  return trains;
}

// Подпись у входа: где стоит поезд, который ещё не на схеме.
function offNoteAt(step: number, option: ChosenOption, { odd }: Neighbors) {
  if (step >= STEP.approval && step <= STEP.repairing) {
    return option === "B"
      ? `2001 удержан на ст. ${odd}`
      : "2001 ждёт у входного Н";
  }
  if (step === STEP.suspected || step === STEP.choosing) {
    return "101 остановлен у входного Н";
  }
  return "";
}
