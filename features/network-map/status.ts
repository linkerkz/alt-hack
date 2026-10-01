import type {
  IncidentKind,
  StationFlow,
  StationKind,
  Status,
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

// Цвета для Leaflet (там нужны значения, а не классы Tailwind).
export const STATUS_COLOR: Record<Status, string> = {
  normal: "#34d399",
  warning: "#fbbf24",
  critical: "#f43f5e",
};

export const STATUS_TEXT_CLASS: Record<Status, string> = {
  normal: "text-emerald-400",
  warning: "text-amber-400",
  critical: "text-rose-500",
};

export const STATUS_BADGE_CLASS: Record<Status, string> = {
  normal: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  critical: "border-rose-500/40 bg-rose-500/15 text-rose-300",
};

export const STATUS_DOT_CLASS: Record<Status, string> = {
  normal: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-rose-500",
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
export const FLOW_ORDER: (keyof StationFlow)[] = [
  "arriving",
  "departing",
  "passing",
];

export const FLOW_LABEL: Record<
  keyof StationFlow,
  { icon: string; label: string }
> = {
  arriving: { icon: "↓", label: "К нам" },
  departing: { icon: "↑", label: "От нас" },
  passing: { icon: "⇢", label: "Проездом" },
};

// Порог «станция не успевает»: столько поездов к ней — уже нагрузка.
const BUSY_ARRIVING = 8;

export function flowCounterClass(key: keyof StationFlow, value: number) {
  if (key === "arriving" && value >= BUSY_ARRIVING) return "text-amber-300";
  return value === 0 ? "text-zinc-600" : "text-sky-300";
}

export const TRAIN_KIND_LABEL: Record<TrainKind, string> = {
  freight: "Грузовой",
  passenger: "Пассажирский",
};
