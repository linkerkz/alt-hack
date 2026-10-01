// Структурный тип вместо импорта Station из network-map: фичи не
// импортируют друг друга напрямую (см. docs/core.md, app-structure).
// Реальный Station из network-map ему структурно соответствует.
export type StationSnapshot = {
  id: string;
  name: string;
  code: string;
  efficiencyIndex: number;
  trainCount: number;
  trackLoad: number;
  avgDelayMinutes: number;
  conflictCount: number;
  incidents: { id: string; title: string; startedAt: string }[];
};

export type PlanProgress = {
  completed: number;
  inProgress: number;
  problems: number;
  total: number;
  // Доля выполненных операций, % — её показывают и сводка, и карточка плана.
  percent: number;
};

export type OperationStatus =
  | "planned"
  | "in-progress"
  | "completed"
  | "delayed";

export type Operation = {
  id: string;
  title: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: OperationStatus;
  delayMinutes?: number;
};

export type AttentionSeverity = "critical" | "warning" | "pending";

export type AttentionItem = {
  id: string;
  severity: AttentionSeverity;
  title: string;
  detail?: string;
  time?: string;
};

export type StationStatistics = {
  trainsProcessed: number;
  avgProcessingMinutes: number;
  delayCount: number;
  avgDelayMinutes: number;
  operationsCompleted: number;
};

export type EfficiencyPoint = {
  time: string;
  value: number;
};

export type StationDashboard = {
  planProgress: PlanProgress;
  operations: Operation[];
  attentionItems: AttentionItem[];
  statistics: StationStatistics;
  efficiencyHistory: EfficiencyPoint[];
};

export type TrainKind = "passenger" | "freight";

// Куда поезд движется относительно станции — те же категории, что и на
// карте сети (features/network-map), но без импорта её типов.
export type TrainFlow = "arriving" | "departing" | "passing";

// Поезд для радара движения — минимум полей диаграммы. Структурный тип:
// реальный StationTrain из network-map ему соответствует (см. StationSnapshot выше).
// Время — минуты от текущего момента, ≤ 0 — уже произошло.
export type RadarTrain = {
  number: string;
  kind: TrainKind;
  flow: TrainFlow;
  arrival: number;
  departure: number;
};
