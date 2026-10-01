import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import type { DspTask } from "../dsp";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";

type Props = { task: DspTask; state: ConsoleState };

// Входящая задача ДСП: от кого, что сделать и кнопки; выполненная — с итогом.
export function DspTaskCard({ task, state }: Props) {
  const { from, time, title, detail, result, done, primary, secondary } = task;

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
          <div className="flex flex-wrap gap-2">
            {primary != null && (
              <ButtonLink
                href={consoleHref(state, primary.patch)}
                scroll={false}
                variant="primary"
              >
                {primary.label}
              </ButtonLink>
            )}
            {secondary != null && (
              <ButtonLink
                href={consoleHref(state, secondary.patch)}
                scroll={false}
              >
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
