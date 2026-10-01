import { STEP } from "./mock";
import type { Command, Live, LiveIncident, LiveWorkOrder } from "./types";

// Шаг сценария из того, что лежит в базе: статус инцидента, решение по нему
// и ход наряда. Ложная тревога (закрыт без решения) — снова штатная работа.
export function stepOf({ incident, workOrder }: Live) {
  if (incident == null) return STEP.normal;

  switch (incident.status) {
    case "suspected":
      return STEP.suspected;
    case "confirmed":
      return incident.option == null ? STEP.choosing : STEP.approval;
    case "decided":
    case "repairing":
      return repairStep(workOrder);
    case "restored":
      return STEP.restored;
    case "closed":
      return incident.option == null ? STEP.normal : STEP.closed;
  }
}

// «Далее» на демо-пульте: следующее действие за того участника, чья очередь.
// null — сценарий дошёл до конца.
export function nextCommand(live: Live): Command | null {
  const { incident } = live;
  switch (stepOf(live)) {
    case STEP.normal:
      return { kind: "detect" };
    case STEP.suspected:
      return { kind: "confirm" };
    case STEP.choosing:
      return { kind: "accept", option: "B" };
    case STEP.approval:
      return { kind: "approve" };
    case STEP.decided:
    case STEP.repairing:
    case STEP.repaired:
      return incident == null ? null : afterDecision(incident, live);
    case STEP.restored:
      return { kind: "close", keepPlan: false };
    default:
      return null;
  }
}

// Подпись «Далее» на демо-пульте: кто и что сделает.
export function commandLabel(command: Command) {
  switch (command.kind) {
    case "detect":
      return "Датчик: отказ С3";
    case "confirm":
      return "ДСП подтверждает отказ";
    case "accept":
      return `ДСЦС принимает вариант ${command.option === "A" ? "А" : "Б"}`;
    case "approve":
      return "ДНЦ согласует";
    case "route":
      return `ДСП принимает ${command.task === "r101" ? "101" : "2001"}`;
    case "startWork":
      return "Служба берёт наряд в работу";
    case "finishWork":
      return "Служба: работы выполнены";
    case "restore":
      return "ДСП возвращает С3";
    case "close":
      return "ДСЦС закрывает инцидент";
    default:
      return "Далее";
  }
}

// Решение принято: ДСП принимает поезда, служба ведёт работы, ДСП возвращает
// стрелку. Рабочий мог закончить чеклист ещё до решения — поезда всё равно
// принимаются первыми.
function afterDecision({ routeTasks }: LiveIncident, { workOrder }: Live) {
  if (!routeTasks.includes("r101")) return ROUTE_101;
  if (!routeTasks.includes("r2001")) return ROUTE_2001;
  if (workOrder?.status === "issued") return START_WORK;
  return workOrder?.status === "done" ? RESTORE : FINISH_WORK;
}

const ROUTE_101: Command = { kind: "route", task: "r101" };
const ROUTE_2001: Command = { kind: "route", task: "r2001" };
const START_WORK: Command = { kind: "startWork" };
const FINISH_WORK: Command = { kind: "finishWork" };
const RESTORE: Command = { kind: "restore" };

function repairStep(workOrder: LiveWorkOrder | null) {
  if (workOrder?.status === "done") return STEP.repaired;
  if (workOrder?.status === "in_progress") return STEP.repairing;
  return STEP.decided;
}
