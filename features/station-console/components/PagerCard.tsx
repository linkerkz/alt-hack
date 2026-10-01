import { Kicker } from "@/components/ui/Kicker";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import { CommandButton } from "./CommandButton";

type Props = {
  stationId: string;
  pager: StationConsoleData["pager"];
  // Отправлять задачи бригаде может только ДСП; остальные видят ответы.
  canSend: boolean;
};

// Пейджер станционной бригады: что ДСП отправил и как бригада ответила,
// и готовые задачи — одна кнопка, и задача уже на пейджере.
export function PagerCard({ stationId, pager, canSend }: Props) {
  return (
    <section className="flex flex-col gap-1">
      <Kicker className="mb-1">Пейджер бригады</Kicker>
      {pager.messages.length === 0 ? (
        <p className="border-line border-t py-1.5 text-[13px] text-muted">
          Сообщений бригаде ещё не было.
        </p>
      ) : (
        <ul>
          {pager.messages.map((message) => (
            <li
              key={message.id}
              className="flex flex-col gap-0.5 border-line border-t py-1.5 text-[13px]"
            >
              <span className="flex justify-between gap-2.5 text-[11px] uppercase tracking-[0.08em]">
                <span className="text-muted">{message.kind}</span>
                <span className={TONE_TEXT_CLASS[message.tone]}>
                  <StatusGlyph tone={message.tone} /> {message.label}
                </span>
              </span>
              <span>{message.text}</span>
            </li>
          ))}
        </ul>
      )}
      {canSend && (
        <>
          <p className="mt-1.5 text-[11px] text-muted uppercase tracking-[0.08em]">
            Отправить задачу
          </p>
          <div className="flex flex-col gap-1.5">
            {pager.tasks.map((task) => (
              <CommandButton
                key={task.text}
                stationId={stationId}
                command={task.command}
                className="w-full justify-start text-left"
              >
                {task.text}
              </CommandButton>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
