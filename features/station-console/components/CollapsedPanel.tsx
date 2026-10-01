import Link from "next/link";
import { INCIDENT } from "../mock";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";

type Props = {
  state: ConsoleState;
  // Активный инцидент: полоса напоминает о нём, даже когда панель свёрнута.
  hasActiveIncident: boolean;
};

// Свёрнутая правая панель: узкая полоса, по клику панель открывается.
export function CollapsedPanel({ state, hasActiveIncident }: Props) {
  return (
    <Link
      href={consoleHref(state, { panel: true })}
      scroll={false}
      title="Развернуть панель"
      className="sticky top-0 flex max-h-screen w-11 flex-none flex-col items-center gap-3 py-3 text-muted hover:bg-ink/4 hover:text-accent-700"
    >
      <span aria-hidden className="font-heading text-[20px] leading-none">
        ‹
      </span>
      <span className="font-heading font-semibold text-[15px] [writing-mode:vertical-rl]">
        {state.tab === "incident" ? `Инцидент ${INCIDENT.id}` : "Обзор"}
      </span>
      {hasActiveIncident && (
        <span className="text-[12px] text-critical" title="Активный инцидент">
          ■
        </span>
      )}
      <span className="sr-only">Развернуть панель</span>
    </Link>
  );
}
