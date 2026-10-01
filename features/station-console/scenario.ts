import { STEP } from "./mock";
import type { Command, Live, LiveIncident, LiveWorkOrder } from "./types";

// Шаг сценария из того, что лежит в базе: статус инцидента, решение по нему
// и ход наряда. Закрыт без решения (ложная тревога или путейцы убрали
// предмет) — снова штатная работа.
export function stepOf({
  incident,
  workOrder,
}: Pick<Live, "incident" | "workOrder">) {
  if (incident == null) return STEP.normal;

  switch (incident.status) {
    case "suspected":
      return STEP.suspected;
    case "dispatched":
      return STEP.dispatched;
    case "escalated":
      return STEP.escalated;
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
// Путейцы в демо идут по длинному пути — сообщают о повреждении. null — до
// инцидента (его открывает только камера) и в конце сценария.
export function nextCommand(live: Live): Command | null {
  const { incident } = live;
  switch (stepOf(live)) {
    case STEP.suspected:
      return { kind: "callCrew" };
    case STEP.dispatched:
      return { kind: "escalate" };
    case STEP.escalated:
      return { kind: "callRepair" };
    case STEP.choosing:
      // ДНЦ уже отклонил Б — станция берёт вариант А.
      return { kind: "accept", option: incident?.dncRejected ? "A" : "B" };
    case STEP.approval:
      return { kind: "approve", comment: null };
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

// Решение принято: ДСП принимает поезда и формирует план работ, бригада
// ведёт работы, ДСП возвращает стрелку. Поезда принимаются первыми.
function afterDecision({ routeTasks }: LiveIncident, { workOrder }: Live) {
  if (!routeTasks.includes("r101")) return ROUTE_101;
  if (!routeTasks.includes("r2001")) return ROUTE_2001;
  if (workOrder == null) return PLAN_WORK;
  if (workOrder.status === "issued") return START_WORK;
  return workOrder.status === "done" ? RESTORE : FINISH_WORK;
}

const ROUTE_101: Command = { kind: "route", task: "r101" };
const ROUTE_2001: Command = { kind: "route", task: "r2001" };
const PLAN_WORK: Command = { kind: "planWork" };
const START_WORK: Command = { kind: "startWork" };
const FINISH_WORK: Command = { kind: "finishWork" };
const RESTORE: Command = { kind: "restore" };

function repairStep(workOrder: LiveWorkOrder | null) {
  if (workOrder?.status === "done") return STEP.repaired;
  if (workOrder?.status === "in_progress") return STEP.repairing;
  return STEP.decided;
}
