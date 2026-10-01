import { toClock, toMinutes } from "@/lib/clock";
import { TRAIN_KIND_LABEL } from "./radar";
import type {
  AttentionItem,
  Operation,
  OperationStatus,
  PlanProgress,
  RadarTrain,
  StationSnapshot,
  StationStatistics,
} from "./types";

// Операции станции — реальные события поездов (train_stops через
// getStationTrains): приём, отправление или стоянка на этой станции. Поезда
// проездом (flow "passing") станцию не занимают — в план работ не входят;
// у остальных arrival === departure, когда в данных не смоделирована
// длительность стоянки — показываем точкой, а не растянутым бруском. Время
// в базе — минуты от текущего момента (features/network-map/network.ts),
// статус считаем прямо по нему: событие уже прошло — значит, выполнено.
export function buildOperations(trains: RadarTrain[]): Operation[] {
  const now = nowMinutes();

  return trains
    .filter((train) => train.flow !== "passing")
    .toSorted((a, b) => a.arrival - b.arrival)
    .map((train): Operation => {
      const status = statusOf(train);
      return {
        id: `train-${train.number}`,
        title: titleOf(train),
        plannedStart: clockAt(now, train.arrival),
        plannedEnd: clockAt(now, train.departure),
        actualStart:
          status === "planned" ? undefined : clockAt(now, train.arrival),
        actualEnd:
          status === "completed" ? clockAt(now, train.departure) : undefined,
        status,
      };
    });
}

function titleOf(train: RadarTrain): string {
  const kind = TRAIN_KIND_LABEL[train.kind];
  if (train.arrival !== train.departure)
    return `${kind} №${train.number} на станции`;
  return train.flow === "arriving"
    ? `Прибытие — ${kind.toLowerCase()} №${train.number}`
    : `Отправление — ${kind.toLowerCase()} №${train.number}`;
}

// Проблемы — реальный conflict_count станции; выполнение плана считаем по
// тем же операциям, что показывает диаграмма Ганта.
export function buildPlanProgress(
  operations: Operation[],
  station: StationSnapshot,
): PlanProgress {
  const completed = operations.filter((op) => op.status === "completed").length;
  const inProgress = operations.filter(
    (op) => op.status === "in-progress",
  ).length;
  const total = operations.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return {
    completed,
    inProgress,
    problems: station.conflictCount,
    total,
    percent,
  };
}

// «Обработано» — все поезда станции, которые не проездом (приём, отправление
// или стоянка). Среднее время обработки — только по настоящим стоянкам
// (отправление минус прибытие): у точечных событий длительности нет.
export function buildStatistics(
  trains: RadarTrain[],
  station: StationSnapshot,
): StationStatistics {
  const handled = trains.filter((train) => train.flow !== "passing");
  const completed = handled.filter((train) => train.departure <= 0);
  const inProgress = handled.filter(
    (train) => train.arrival <= 0 && train.departure > 0,
  );
  const durations = completed
    .filter((train) => train.arrival !== train.departure)
    .map((train) => train.departure - train.arrival);
  const avgProcessingMinutes =
    durations.length === 0 ? 0 : Math.round(average(durations));

  return {
    trainsProcessed: completed.length + inProgress.length,
    avgProcessingMinutes,
    delayCount: station.incidents.length,
    avgDelayMinutes: station.avgDelayMinutes,
    operationsCompleted: completed.length,
  };
}

export function buildAttentionItems(
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

function statusOf(train: RadarTrain): OperationStatus {
  if (train.departure <= 0) return "completed";
  if (train.arrival <= 0) return "in-progress";
  return "planned";
}

function nowMinutes() {
  const almaty = new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Almaty",
  });
  return toMinutes(almaty);
}

// Не заворачиваем по модулю суток: бруски плана совпадают по времени, даже
// если горизонт переходит через полночь (toClock тогда покажет «24:35» —
// это ожидаемо для несуточной шкалы).
function clockAt(now: number, offsetMinutes: number) {
  return toClock(Math.max(0, now + offsetMinutes));
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
