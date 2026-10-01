import type {
  IncidentKind,
  StationFlow,
  StationKind,
  TrainKind,
} from "./types";

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
  if (key === "arriving" && value >= BUSY_ARRIVING)
    return "text-status-warning";
  return value === 0 ? "text-muted" : "text-accent-700";
}

export const TRAIN_KIND_LABEL: Record<TrainKind, string> = {
  freight: "Грузовой",
  passenger: "Пассажирский",
};
