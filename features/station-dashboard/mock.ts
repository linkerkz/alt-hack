import type {
  AttentionItem,
  EfficiencyPoint,
  Operation,
  OperationStatus,
  PlanProgress,
  StationDashboard,
  StationSnapshot,
  StationStatistics,
} from "./types";

const WINDOW_START_MINUTES = 8 * 60;
const IN_PROGRESS_INDEX = 3;

const BASE_OPERATIONS: {
  title: string;
  offsetMin: number;
  durationMin: number;
}[] = [
  { title: "Приём поезда №201", offsetMin: 0, durationMin: 35 },
  { title: "Манёвры на сортировочной горке", offsetMin: 20, durationMin: 55 },
  { title: "Отправление №104", offsetMin: 85, durationMin: 25 },
  { title: "Проверка пути №3", offsetMin: 115, durationMin: 40 },
  { title: "Приём поезда №318", offsetMin: 150, durationMin: 30 },
  { title: "Манёвровая операция", offsetMin: 190, durationMin: 35 },
];

const HISTORY_HOURS = [8, 9, 10, 11, 12, 13];

// Мок, пока нет бэкенда: показатели детерминированно выводятся из реальных
// полей станции, чтобы у разных станций картина отчёта была своя.
export function buildMockDashboard(station: StationSnapshot): StationDashboard {
  const operations = buildOperations(station);
  const planProgress = buildPlanProgress(station);

  return {
    planProgress,
    operations,
    attentionItems: buildAttentionItems(station, operations),
    statistics: buildStatistics(station, planProgress),
    efficiencyHistory: buildEfficiencyHistory(station),
  };
}

function buildOperations(station: StationSnapshot): Operation[] {
  const delayCount = Math.min(
    station.conflictCount + (station.incidents.length > 0 ? 1 : 0),
    3,
  );

  return BASE_OPERATIONS.map((base, index) => {
    const plannedStart = WINDOW_START_MINUTES + base.offsetMin;
    const plannedEnd = plannedStart + base.durationMin;
    const isPast = index < IN_PROGRESS_INDEX;
    const isDelayed = isPast && index >= IN_PROGRESS_INDEX - delayCount;
    const status: OperationStatus = isDelayed
      ? "delayed"
      : isPast
        ? "completed"
        : index === IN_PROGRESS_INDEX
          ? "in-progress"
          : "planned";
    const delayMinutes = isDelayed
      ? Math.max(5, Math.round(station.avgDelayMinutes * (0.5 + index * 0.1)))
      : undefined;

    return {
      id: `${station.id}-op-${index}`,
      title: base.title,
      plannedStart: toClock(plannedStart),
      plannedEnd: toClock(plannedEnd),
      actualStart: status === "planned" ? undefined : toClock(plannedStart),
      actualEnd:
        status === "completed" || status === "delayed"
          ? toClock(plannedEnd + (delayMinutes ?? 0))
          : undefined,
      status,
      delayMinutes,
    };
  });
}

function buildPlanProgress(station: StationSnapshot): PlanProgress {
  const total = Math.max(station.trainCount, 8);
  const problems = Math.min(
    station.conflictCount + station.incidents.length,
    Math.floor(total * 0.4),
  );
  const remaining = total - problems;
  const inProgress = Math.min(Math.round(remaining * 0.2), remaining);
  const completed = remaining - inProgress;

  return { completed, inProgress, problems, total };
}

function buildStatistics(
  station: StationSnapshot,
  planProgress: PlanProgress,
): StationStatistics {
  return {
    trainsProcessed: planProgress.completed + planProgress.inProgress,
    avgProcessingMinutes: 15 + Math.round(station.trackLoad / 5),
    delayCount: station.incidents.length + Math.min(station.conflictCount, 3),
    avgDelayMinutes: station.avgDelayMinutes,
    operationsCompleted: planProgress.completed,
  };
}

function buildEfficiencyHistory(station: StationSnapshot): EfficiencyPoint[] {
  const target = station.efficiencyIndex;
  const spread = Math.min(4 + station.conflictCount * 2, 18);
  const lastIndex = HISTORY_HOURS.length - 1;

  return HISTORY_HOURS.map((hour, index) => {
    const progress = index / lastIndex;
    const zigzag = index % 2 === 0 ? 1 : -1;
    const value = clamp(
      Math.round(target - spread * (1 - progress) + zigzag * 2),
      0,
      100,
    );
    return { time: `${pad(hour)}:00`, value };
  });
}

function buildAttentionItems(
  station: StationSnapshot,
  operations: Operation[],
): AttentionItem[] {
  const fromIncidents: AttentionItem[] = station.incidents.map((incident) => ({
    id: `incident-${incident.id}`,
    severity: "critical",
    title: incident.title,
    time: incident.startedAt,
  }));

  const fromDelays: AttentionItem[] = operations
    .filter((operation) => operation.status === "delayed")
    .map((operation) => ({
      id: `operation-${operation.id}`,
      severity: "warning",
      title: `${operation.title} — задержка`,
      detail:
        operation.delayMinutes == null
          ? undefined
          : `+${operation.delayMinutes} мин`,
      time: operation.plannedStart,
    }));

  const trackLoadItem: AttentionItem[] =
    station.trackLoad < 85
      ? []
      : [
          {
            id: "track-load",
            severity: "warning",
            title: "Высокая загрузка путей",
            detail: `${station.trackLoad}%`,
          },
        ];

  const pending = operations.find(
    (operation) => operation.status === "planned",
  );
  const pendingItem: AttentionItem[] =
    pending == null
      ? []
      : [
          {
            id: `pending-${pending.id}`,
            severity: "pending",
            title: pending.title,
            detail: "Ожидает выполнения",
            time: pending.plannedStart,
          },
        ];

  return [...fromIncidents, ...fromDelays, ...trackLoadItem, ...pendingItem];
}

function toClock(totalMinutes: number): string {
  return `${pad(Math.floor(totalMinutes / 60))}:${pad(totalMinutes % 60)}`;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
