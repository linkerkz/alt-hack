"use client";

import type { ReactNode } from "react";
import { useConsoleView } from "./ConsoleView";

type Props = {
  tabs: ReactNode;
  overview: ReactNode;
  // Вкладка инцидента; null — инцидента нет.
  incident: ReactNode;
};

// Открытая правая панель: вкладки и содержимое текущей. Обе вкладки
// приходят с сервера готовыми, переключение — без запроса.
export function ExpandedPanel({ tabs, overview, incident }: Props) {
  const { tab, panel } = useConsoleView();
  if (!panel) return null;

  return (
    <aside className="sticky top-0 flex max-h-screen min-w-0 max-w-full flex-[1_1_440px] flex-col">
      {tabs}
      <div className="flex flex-1 flex-col gap-[18px] overflow-auto px-5 pt-4 pb-[120px]">
        {tab === "incident" ? incident : overview}
      </div>
    </aside>
  );
}
