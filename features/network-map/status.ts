import type {
  IncidentKind,
  StationKind,
  Status,
  TrainFlow,
  TrainKind,
} from "./types";

// Пороги индекса эффективности: ниже warning — «Внимание», ниже critical — «Критично».
const STATUS_THRESHOLDS = { warning: 75, critical: 55 };

export function toStatus(efficiencyIndex: number): Status {
  if (efficiencyIndex < STATUS_THRESHOLDS.critical) return "critical";
  if (efficiencyIndex < STATUS_THRESHOLDS.warning) return "warning";
  return "normal";
}

export const STATUS_ORDER: Status[] = ["critical", "warning", "normal"];

export const STATUS_LABEL: Record<Status, string> = {
  normal: "Норма",
  warning: "Внимание",
  critical: "Критично",
};

export const STATION_KIND_LABEL: Record<StationKind, string> = {
  sorting: "Сортировочная",
  passenger: "Пассажирская",
  freight: "Грузовая",
  junction: "Узловая",
};

export const INCIDENT_KIND_LABEL: Record<IncidentKind, string> = {
  delay: "Опоздание",
  "track-closure": "Закрытие пути",
  breakdown: "Отказ",
  "route-conflict": "Конфликт маршрутов",
  "resource-shortage": "Нехватка ресурсов",
};

// Счётчики станции: значок, подпись и с какого числа поездов подсвечивать.
export const FLOW_ORDER: TrainFlow[] = ["arriving", "departing", "passing"];

export const FLOW_LABEL: Record<
  TrainFlow,
  { icon: string; label: string; hint: string }
> = {
  arriving: { icon: "↓", label: "К нам", hint: "остановятся у нас" },
  departing: { icon: "↑", label: "От нас", hint: "стоят у нас или ушли" },
  passing: { icon: "⇢", label: "Проездом", hint: "идут без остановки" },
};

// Порог «станция не успевает»: столько поездов к ней — уже нагрузка.
const BUSY_ARRIVING = 8;

export function flowCounterClass(key: TrainFlow, value: number) {
  if (key === "arriving" && value >= BUSY_ARRIVING) return "text-warning";
  return value === 0 ? "text-neutral-400" : "text-ink";
}

export const TRAIN_KIND_LABEL: Record<TrainKind, string> = {
  freight: "Грузовой",
  passenger: "Пассажирский",
};

// Заливка значка поезда на карте и в легенде.
export const TRAIN_KIND_FILL: Record<TrainKind, string> = {
  passenger: "bg-accent-700",
  freight: "bg-ink",
};
