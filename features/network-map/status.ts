import type { IncidentKind, StationKind } from "./types";

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
