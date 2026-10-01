import { upcomingOperations } from "./operations";
import type {
  Command,
  Live,
  PagerMessage,
  PagerMessageStatus,
  Status,
} from "./types";

// Работа бригады на вкладке «Станция»: ближайшие операции плана с кнопкой
// «Поручить» и журнал пейджера — что отправлено и как бригада ответила.

const STATUS: Record<PagerMessageStatus, { label: string; tone: Status }> = {
  sent: { label: "Отправлено", tone: "warning" },
  accepted: { label: "Принято", tone: "warning" },
  done: { label: "Выполнено", tone: "normal" },
  escalated: { label: "Нужен ремонт", tone: "critical" },
  cancelled: { label: "Отбой, камера: свободно", tone: "normal" },
};

// now — время станции «14:05»: операции показываем от него вперёд.
export function pagerCard({ plan, pager }: Live, now: string) {
  return {
    operations: upcomingOperations(plan, now, pager).map((operation) => ({
      id: operation.id,
      time: operation.time,
      text: operation.text,
      status:
        operation.message == null ? null : STATUS[operation.message.status],
      command: { kind: "assign", operation: operation.id } satisfies Command,
    })),
    messages: pager.map((message) => ({
      id: message.id,
      kind: kindOf(message),
      text: message.text,
      ...STATUS[message.status],
    })),
  };
}

function kindOf(message: PagerMessage) {
  if (message.incidentId != null) return "Вызов";
  return message.operation == null ? "Поручение ДСП" : "По плану";
}
