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

// Куда поезд движется относительно станции: к нам — остановится у нас и ещё
// не прибыл, от нас — стоит у нас или ушёл, проездом — идёт без остановки.
export type TrainFlow = "arriving" | "departing" | "passing";

// Счётчики поездов станции по категориям: в пути или выйдут на участок за горизонт.
export type StationFlow = Record<TrainFlow, number>;

// Поезда по участку в каждую сторону: forward — из fromId в toId.
export type SectionFlow = {
  forward: number;
  backward: number;
};

// Поезд в карточке станции. fromName / toName — соседи, с участков которых
// поезд идёт к нам и от нас; null — такого движения нет за горизонт.
// Время — минуты от текущего момента; ≤ 0 — уже произошло.
export type StationTrain = {
  trainId: string;
  number: string;
  kind: TrainKind;
  flow: TrainFlow;
  originName: string;
  destinationName: string;
  fromName: string | null;
  toName: string | null;
  arrival: number;
  departure: number;
  // Прибытие к соседу toName.
  nextArrival: number | null;
  isTerminal: boolean;
};

// Зона ответственности, которую показывает карта.
export type MapScope =
  | { kind: "dispatch-area"; dispatchAreaId: string }
  | { kind: "station"; stationId: string };

// Станция на карте зоны: соседи за границей зоны показываются бледными.
export type ZoneStation = Station & { flow: StationFlow; isInScope: boolean };
export type ZoneSection = Section & { flow: SectionFlow };
