export type Station = {
  id: string;
  name: string;
  code: string;
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

export type NetworkSummary = {
  avgEfficiencyIndex: number;
  stationCount: number;
  stationCountByStatus: Record<Status, number>;
  trainCount: number;
  incidentCount: number;
};
