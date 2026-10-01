"use client";

import type { ReactNode } from "react";
import { useConsoleView } from "./ConsoleView";

// Баннер инцидента виден, пока карточка инцидента скрыта: открыта вкладка
// «Станция» или панель свёрнута.
export function BannerGate({ children }: { children: ReactNode }) {
  const { tab, panel } = useConsoleView();
  return tab === "overview" || !panel ? children : null;
}
