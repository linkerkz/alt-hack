"use client";

import type { ConsoleTab } from "../types";
import { CollapseLink } from "./CollapseLink";
import { ConsoleLink } from "./ConsoleLink";
import { useConsoleView } from "./ConsoleView";

type Props = {
  // Код инцидента; null — инцидента нет, и вкладки для него тоже.
  incidentCode: string | null;
  // Ход за тем, кто смотрит: вкладку инцидента помечаем.
  myTurn: boolean;
};

// Вкладки правой панели: станция и карточка инцидента.
export function ConsoleTabs({ incidentCode, myTurn }: Props) {
  const view = useConsoleView();
  const tabs: { id: ConsoleTab; label: string }[] = [
    { id: "overview", label: "Станция" },
    ...(incidentCode == null
      ? []
      : [
          {
            id: "incident" as const,
            label: `${myTurn ? "▲ " : ""}Инцидент ${incidentCode}`,
          },
        ]),
  ];

  return (
    <nav className="flex border-line border-b">
      {tabs.map((tab) => {
        const isCurrent = tab.id === view.tab;
        return (
          <ConsoleLink
            key={tab.id}
            patch={{ tab: tab.id }}
            aria-current={isCurrent ? "page" : undefined}
            className={`flex-1 px-3.5 py-[11px] text-center font-heading font-semibold text-[16px] ${
              isCurrent
                ? "text-accent-700 shadow-[inset_0_-2px_0_var(--color-accent)]"
                : "text-muted hover:text-ink"
            }`}
          >
            {tab.label}
          </ConsoleLink>
        );
      })}
      <CollapseLink />
    </nav>
  );
}
