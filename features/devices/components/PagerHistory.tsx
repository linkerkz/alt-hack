import { simClock } from "@/lib/clock";
import type { PagerMessage, PagerMessageStatus } from "../types";

type Props = { messages: PagerMessage[] };

// Чем закончилось сообщение: значок, цвет и короткая подпись.
const OUTCOME: Record<PagerMessageStatus, { text: string; className: string }> =
  {
    sent: { text: "▲ Ждёт", className: "text-device-warn" },
    accepted: { text: "▲ Принято", className: "text-device-warn" },
    done: { text: "● Готово", className: "text-device-ok" },
    escalated: { text: "■ Ремонт", className: "text-device-alert" },
    cancelled: { text: "● Отбой", className: "text-device-ok" },
  };

// Журнал пейджера: закрытые вызовы и задачи по строке, свежие сверху.
export function PagerHistory({ messages }: Props) {
  return (
    <section className="mt-auto flex flex-col gap-1">
      <p className="text-[11px] text-device-dim uppercase tracking-[0.12em]">
        Журнал
      </p>
      <ul className="flex flex-col border-device-line border-t text-[12px]">
        {messages.map((message) => {
          const outcome = OUTCOME[message.status];
          return (
            <li
              key={message.id}
              className="flex items-baseline gap-2 border-device-line border-b py-1.5"
            >
              <span className="text-device-dim">
                {simClock(message.createdAt)}
              </span>
              <span className="min-w-0 flex-1 truncate">{message.text}</span>
              <span className={`shrink-0 uppercase ${outcome.className}`}>
                {outcome.text}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
