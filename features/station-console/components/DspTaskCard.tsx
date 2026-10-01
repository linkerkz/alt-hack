import Image from "next/image";
import type { ButtonVariant } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import type { DspTask } from "../dsp";
import { consoleHref } from "../state";
import type { ActionLink, ConsoleState } from "../types";
import { CommandButton } from "./CommandButton";

type Props = { stationId: string; task: DspTask; state: ConsoleState };

// Входящая задача ДСП: от кого, что сделать и кнопки; выполненная — с итогом.
export function DspTaskCard({ stationId, task, state }: Props) {
  const { from, time, title, detail, result, done, evidence } = task;
  const { primary, secondary } = task;

  return (
    <Card
      emphasis={done ? "default" : "accent"}
      className="flex flex-col gap-2 p-3.5"
    >
      <div className="flex justify-between gap-2.5 text-[11px] uppercase tracking-[0.08em]">
        <span className={done ? "text-normal" : "text-accent-700"}>
          {done ? "● Выполнено" : "▲ Новая задача"}
        </span>
        <span className="text-muted">
          {from} · {time}
        </span>
      </div>
      <p className="font-heading font-semibold text-[21px] leading-[1.15]">
        {title}
      </p>
      {done ? (
        <p className="text-[12.5px] text-neutral-800">{result}</p>
      ) : (
        <>
          <p className="text-justify text-[13px] text-neutral-800">{detail}</p>
          {evidence != null && (
            <figure className="flex flex-col gap-1">
              <Image
                src={evidence.snapshot}
                alt="Снимок камеры в момент обнаружения"
                width={480}
                height={360}
                unoptimized
                className="h-auto w-full rounded-[3px] border border-line"
              />
              {evidence.analysis != null && (
                <figcaption className="border-accent border-l-2 pl-2.5 text-[13px]">
                  <span className="text-accent-700">ИИ:</span>{" "}
                  {evidence.analysis}
                </figcaption>
              )}
            </figure>
          )}
          <div className="flex flex-wrap gap-2">
            {primary != null && (
              <TaskButton
                stationId={stationId}
                action={primary}
                state={state}
                variant="primary"
              />
            )}
            {secondary != null && (
              <TaskButton
                stationId={stationId}
                action={secondary}
                state={state}
              />
            )}
          </div>
        </>
      )}
    </Card>
  );
}

type TaskButtonProps = {
  stationId: string;
  action: ActionLink;
  state: ConsoleState;
  variant?: ButtonVariant;
};

// Команда уходит в базу; смена вида (открыть диалог) — ссылкой в URL.
function TaskButton({ stationId, action, state, variant }: TaskButtonProps) {
  if ("command" in action) {
    return (
      <CommandButton
        stationId={stationId}
        command={action.command}
        variant={variant}
      >
        {action.label}
      </CommandButton>
    );
  }
  return (
    <ButtonLink
      href={consoleHref(state, action.patch)}
      scroll={false}
      variant={variant}
    >
      {action.label}
    </ButtonLink>
  );
}
