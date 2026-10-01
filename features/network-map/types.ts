import type { Status } from "@/lib/status";

export type Station = {
  id: string;
  name: string;
  code: string;
  // Диспетчерский круг ДНЦ, к которому относится станция.
  dispatchAreaId: string;
  kind: StationKind;
  lat: number;
  lon: number;
  efficiencyIndex: number;
  trainCount: number;
  trackLoad: number;
  avgDelayMinutes: number;
  conflictCount: number;
  incidents: Incident[];
};

export type StationKind = "sorting" | "passenger" | "freight" | "junction";

export type Incident = {
  id: string;
  kind: IncidentKind;
  title: string;
  startedAt: string;
};

export type IncidentKind =
  | "delay"
  | "track-closure"
  | "breakdown"
  | "route-conflict"
  | "resource-shortage";

export type Section = {
  id: string;
  fromId: string;
  toId: string;
  status: Status;
  note?: string;
};

export type ZoneSummary = {
  avgEfficiencyIndex: number;
  stationCount: number;
  stationCountByStatus: Record<Status, number>;
  // Поезда, которые сейчас на станциях зоны или на её участках.
  trainsWithinCount: number;
  arrivingCount: number;
  incidentCount: number;
};
// Поезд и его маршрут по станциям сети; время — минуты от текущего момента.
export type Train = {
  id: string;
  number: string;
  kind: TrainKind;
  route: TrainStop[];
};

export type TrainKind = "freight" | "passenger";

// arrival === departure — поезд проходит станцию без остановки.
export type TrainStop = {
  stationId: string;
  arrival: number;
  departure: number;
};

// Счётчики поездов станции: в пути или выйдут на участок за горизонт.
export type StationFlow = {
  arriving: number;
  departing: number;
  passing: number;
};

// Поезда по участку в каждую сторону: forward — из fromId в toId.
export type SectionFlow = {
  forward: number;
  backward: number;
};

// Поезд в списке карточки: движение по участку между станцией и соседом.
// departure ≤ 0 — поезд уже в пути.
export type TrainMovement = {
  trainId: string;
  number: string;
  kind: TrainKind;
  originName: string;
  destinationName: string;
  departure: number;
  arrival: number;
  // Поезд проходит выбранную станцию без остановки.
  passesStation: boolean;
};

// Зона ответственности, которую показывает карта.
export type MapScope =
  | { kind: "dispatch-area"; dispatchAreaId: string }
  | { kind: "station"; stationId: string };

// Станция на карте зоны: соседи за границей зоны показываются бледными.
export type ZoneStation = Station & { flow: StationFlow; isInScope: boolean };
export type ZoneSection = Section & { flow: SectionFlow };

export type StationTraffic = {
  directions: Direction[];
};

// Направление станции: поезда от соседа к нам и от нас к соседу.
export type Direction = {
  neighborId: string;
  neighborName: string;
  toUs: TrainMovement[];
  fromUs: TrainMovement[];
};
