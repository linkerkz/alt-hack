import { STEP } from "./mock";
import { routeDone } from "./routing";
import { type Source, schemaTrainsAt } from "./schemaTrains";
import type { ChosenOption, ConsoleState, Neighbors, Status } from "./types";

// Динамика схемы станции на шаге сценария: занятость путей, поезда,
// закрытые съезды и предпросмотр варианта. Геометрия — в StationSchema.

// Линии поверх путей: предпросмотр варианта (пунктир) или заданный маршрут.
// Подпись — над путём 1, слева от платформы: ниже пути стоит подпись у входа.
type Overlay = {
  paths: string[];
  label: string;
  labelX: number;
  labelY: number;
  dashed: boolean;
};

// Поезда инцидента; остальные — quiet: в фокусе их приглушаем.
const INCIDENT_TRAINS = ["101", "2001"];

export function stationSchema(
  state: ConsoleState,
  neighbors: Neighbors,
  source: Source,
) {
  const { step, option } = state;
  const fault = step >= STEP.suspected && step <= STEP.repaired;
  const preview = step === STEP.choosing || step === STEP.approval;
  const trains = schemaTrainsAt(state, source);

  return {
    occupied: trains.filter((train) => train.onTrack).map((t) => t.track),
    fault,
    switchC3: switchC3(step, fault),
    entrySignal: entrySignal(state),
    overlay: preview ? previewRoute(option) : issuedRoute(state),
    trains: trains.map(({ train, onTrack, ...rest }) => ({
      ...rest,
      quiet: !INCIDENT_TRAINS.includes(train),
    })),
    offNote: offNoteAt(step, option, neighbors),
    note: fault
      ? `Маршруты через С3 закрыты${preview ? " · пунктир — предлагаемое изменение" : ""}`
      : "Все объекты исправны",
  };
}

// Шаг, на котором у инцидента есть зона для фокуса.
export function isFocusStep(step: number) {
  return step >= STEP.suspected && step <= STEP.restored;
}

// Пока путейцы не нашли повреждения, стрелка лишь «Внимание»: предмет уберут.
function switchC3(
  step: number,
  fault: boolean,
): { status: Status | null; label: string } {
  if (!fault) return { status: null, label: "С3" };
  if (step < STEP.escalated) {
    return { status: "warning", label: "С3 · предмет" };
  }
  const label =
    step === STEP.repaired ? "С3 · проверена, ждёт ДСП" : "С3 · повреждена";
  return { status: "critical", label };
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
    labelX: 150,
    labelY: 160,
    dashed: false,
  };
}

function previewRoute(option: ChosenOption): Overlay {
  return {
    paths: [
      "M0 170 H420",
      option === "B" ? "M0 230 H110 L165 285 H300" : "M0 230 H300",
    ],
    label: `Предпросмотр: вариант ${option === "B" ? "Б" : "А"}`,
    labelX: 150,
    labelY: 160,
    dashed: true,
  };
}

// Подпись у входа: где стоит поезд, который ещё не на схеме.
function offNoteAt(step: number, option: ChosenOption, { odd }: Neighbors) {
  if (step >= STEP.approval && step <= STEP.repairing) {
    return option === "B" ? `2001 удержан на ст. ${odd}` : "";
  }
  if (step >= STEP.suspected && step <= STEP.choosing) {
    return "101 остановлен у входного Н";
  }
  return "";
}
