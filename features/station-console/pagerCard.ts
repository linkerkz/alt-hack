import { toClock } from "@/lib/clock";
import { activePlan } from "./activePlan";
import { departingTrain, departureState } from "./departure";
import { type Operation, upcomingOperations } from "./operations";
import type {
  Command,
  Live,
  PagerMessage,
  PagerMessageStatus,
  PlannedTrain,
  Status,
} from "./types";

// Работа бригады на вкладке «Станция»: ближайшие операции плана с кнопкой
// «Поручить» и журнал пейджера — что отправлено и как бригада ответила. У
// отправления ещё и задача ДСП — дать отправление поезду.

const STATUS: Record<PagerMessageStatus, { label: string; tone: Status }> = {
  sent: { label: "Отправлено", tone: "warning" },
  accepted: { label: "Принято", tone: "warning" },
  done: { label: "Выполнено", tone: "normal" },
  escalated: { label: "Нужен ремонт", tone: "critical" },
  cancelled: { label: "Отбой, камера: свободно", tone: "normal" },
};

// Операции показываем от времени станции вперёд, по действующему плану —
// после сбоя поезда идут на другие пути и позже.
export function pagerCard(live: Live) {
  const { pager, now } = live;
  const plan = activePlan(live);
  return {
    operations: upcomingOperations(plan, now, pager).map((operation) => ({
      id: operation.id,
      time: toClock(operation.time),
      text: operation.text,
      status:
        operation.message == null ? null : STATUS[operation.message.status],
      command: { kind: "assign", operation: operation.id } satisfies Command,
      departure: departureOf(operation, plan, live),
    })),
    messages: pager.map((message) => ({
      id: message.id,
      kind: kindOf(message),
      text: message.text,
      ...STATUS[message.status],
    })),
  };
}

// Отправление поезда операции; null — операция не отправление.
function departureOf(operation: Operation, plan: PlannedTrain[], live: Live) {
  if (operation.kind !== "departure") return null;
  const train = departingTrain(plan, operation.id);
  if (train == null) return null;
  return {
    state: departureState(train, live),
    route: train.exitRoute,
    command: { kind: "depart", operation: operation.id } satisfies Command,
  };
}

function kindOf(message: PagerMessage) {
  if (message.incidentId != null) return "Вызов";
  return message.operation == null ? "Поручение ДСП" : "По плану";
}
