import { ButtonLink } from "@/components/ui/ButtonLink";
import { INCIDENT } from "../mock";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";

type Props = {
  suggestion: string;
  state: ConsoleState;
};

// Полоса над пультом: новый инцидент, пока диспетчер на вкладке обзора.
export function IncidentBanner({ suggestion, state }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2 border-critical border-t-2 border-b px-5 py-2.5">
      <span className="whitespace-nowrap text-[11px] text-critical uppercase tracking-[0.08em]">
        ■ Новый инцидент · {INCIDENT.id} · {INCIDENT.detectedAt}
      </span>
      <span className="font-heading font-semibold text-[19px]">
        {INCIDENT.title}
      </span>
      <span className="text-[13px] text-neutral-800">{suggestion}</span>
      <ButtonLink
        href={consoleHref(state, { tab: "incident", focus: true })}
        scroll={false}
        variant="primary"
        className="ml-auto"
      >
        Открыть инцидент
      </ButtonLink>
    </div>
  );
}
