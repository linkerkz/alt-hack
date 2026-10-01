import { simClock } from "@/lib/clock";
import type { PagerMessage, PagerMessageStatus } from "../types";

type Props = { messages: PagerMessage[] };

// Чем закончилось сообщение: значок, цвет и подпись.
const OUTCOME: Record<PagerMessageStatus, { text: string; className: string }> =
  {
    sent: { text: "▲ Ждёт ответа", className: "text-device-warn" },
    accepted: { text: "▲ Принято", className: "text-device-warn" },
    done: { text: "● Выполнено", className: "text-device-ok" },
    escalated: {
      text: "■ Передано ремонтной бригаде",
      className: "text-device-alert",
    },
    cancelled: {
      text: "● Отбой: камера видит, что стрелка свободна",
      className: "text-device-ok",
    },
  };

// Журнал пейджера: закрытые вызовы и задачи, свежие сверху.
export function PagerHistory({ messages }: Props) {
  return (
    <section className="flex flex-col gap-1">
      <p className="text-[11px] text-device-dim uppercase tracking-[0.12em]">
        Журнал
      </p>
      <ul className="flex flex-col border-device-line border-t">
        {messages.map((message) => {
          const outcome = OUTCOME[message.status];
          return (
            <li
              key={message.id}
              className="flex flex-col gap-0.5 border-device-line border-b py-2 text-[13px]"
            >
              <span className="text-device-dim">
                {simClock(message.createdAt)} ·{" "}
                {message.isCall ? "Вызов" : "Задача"}
              </span>
              <span>{message.text}</span>
              <span className={`text-[12px] ${outcome.className}`}>
                {outcome.text}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
