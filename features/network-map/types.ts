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

export type Status = "normal" | "warning" | "critical";

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

// Счётчики поездов станции на горизонте прогноза.
export type StationFlow = {
  arriving: number;
  departing: number;
  passing: number;
};

// Поезда на участке в каждую сторону: forward — от fromId к toId.
export type SectionFlow = {
  forward: number;
  backward: number;
};

// Событие поезда на станции — строка списка «ближайшие поезда».
export type TrainEvent = {
  trainId: string;
  number: string;
  kind: TrainKind;
  type: TrainEventType;
  minutes: number;
  // Для стоянки — когда поезд отправится.
  departureMinutes: number | null;
  originName: string;
  destinationName: string;
};

export type TrainEventType = "arrival" | "departure" | "stop" | "passing";

// Зона ответственности, которую показывает карта.
export type MapScope =
  | { kind: "dispatch-area"; dispatchAreaId: string }
  | { kind: "station"; stationId: string };

// Станция на карте зоны: соседи за границей зоны показываются бледными.
export type ZoneStation = Station & { flow: StationFlow; isInScope: boolean };
export type ZoneSection = Section & { flow: SectionFlow };

export type StationTraffic = {
  directions: Direction[];
  events: TrainEvent[];
};

export type Direction = {
  neighborId: string;
  neighborName: string;
  toUs: number;
  fromUs: number;
};
