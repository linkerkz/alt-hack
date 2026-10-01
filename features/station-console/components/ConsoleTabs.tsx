import Link from "next/link";
import { consoleHref } from "../state";
import type { ConsoleState, ConsoleTab } from "../types";
import { CollapseLink } from "./CollapseLink";

type Props = {
  state: ConsoleState;
  // Код инцидента; null — инцидента нет, и вкладки для него тоже.
  incidentCode: string | null;
};

// Вкладки правой панели: обзор станции и карточка инцидента.
export function ConsoleTabs({ state, incidentCode }: Props) {
  const tabs: { id: ConsoleTab; label: string }[] = [
    { id: "overview", label: "Обзор" },
    ...(incidentCode == null
      ? []
      : [{ id: "incident" as const, label: `Инцидент ${incidentCode}` }]),
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
      <CollapseLink state={state} />
    </nav>
  );
}
