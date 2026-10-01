import { PAGER_TASKS } from "./mock";
import type {
  Command,
  PagerMessage,
  PagerMessageStatus,
  Status,
} from "./types";

// Пейджер бригады на панели ДСП: что отправлено и как ответили, и готовые
// задачи, которые можно отправить одной кнопкой.

const STATUS: Record<PagerMessageStatus, { label: string; tone: Status }> = {
  sent: { label: "Отправлено", tone: "warning" },
  accepted: { label: "Принято", tone: "warning" },
  done: { label: "Выполнено", tone: "normal" },
  escalated: { label: "Нужен ремонт", tone: "critical" },
  cancelled: { label: "Отбой, камера: свободно", tone: "normal" },
};

export function pagerCard(messages: PagerMessage[]) {
  return {
    messages: messages.map((message) => ({
      id: message.id,
      kind: message.incidentId == null ? "Задача" : "Вызов",
      text: message.text,
      ...STATUS[message.status],
    })),
    tasks: PAGER_TASKS.map(({ id, text }) => ({
      text,
      command: { kind: "page", task: id } satisfies Command,
    })),
  };
}
