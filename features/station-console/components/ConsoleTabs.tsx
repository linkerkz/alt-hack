import Link from "next/link";
import { INCIDENT } from "../mock";
import { consoleHref } from "../state";
import type { ConsoleState, ConsoleTab } from "../types";

type Props = {
  state: ConsoleState;
  // Вкладка инцидента появляется, когда инцидент возник.
  hasIncident: boolean;
};

// Вкладки правой панели: обзор станции и карточка инцидента.
export function ConsoleTabs({ state, hasIncident }: Props) {
  const tabs: { id: ConsoleTab; label: string }[] = [
    { id: "overview", label: "Обзор" },
    ...(hasIncident
      ? [{ id: "incident" as const, label: `Инцидент ${INCIDENT.id}` }]
      : []),
  ];

  return (
    <nav className="flex border-line border-b">
      {tabs.map((tab) => {
        const isCurrent = tab.id === state.tab;
        return (
          <Link
            key={tab.id}
            href={consoleHref(state, { tab: tab.id })}
            scroll={false}
            aria-current={isCurrent ? "page" : undefined}
            className={`flex-1 px-3.5 py-[11px] text-center font-heading font-semibold text-[16px] ${
              isCurrent
                ? "text-accent-700 shadow-[inset_0_-2px_0_var(--color-accent)]"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
      <Link
        href={consoleHref(state, { panel: false })}
        scroll={false}
        title="Свернуть панель"
        aria-label="Свернуть панель"
        className="flex w-11 flex-none items-center justify-center border-line border-l font-heading text-[20px] text-muted hover:bg-ink/4 hover:text-accent-700"
      >
        ›
      </Link>
    </nav>
  );
}
