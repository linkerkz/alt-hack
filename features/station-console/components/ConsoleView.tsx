"use client";

import { useSearchParams } from "next/navigation";
import { createContext, type ReactNode, use } from "react";
import { type ConsoleView, parseView, type ViewPatch, viewHref } from "../view";

type Props = {
  // Инцидент открыт: есть его вкладка.
  hasIncident: boolean;
  // Шаг сценария, на котором есть зона инцидента для фокуса.
  focusStep: boolean;
  children: ReactNode;
};

type ViewContext = ConsoleView & {
  // Фокус можно включить: открыта вкладка инцидента на нужном шаге.
  canFocus: boolean;
  isFocused: boolean;
  hrefFor: (patch: ViewPatch) => string;
};

const Context = createContext<ViewContext | null>(null);

// Вид пульта из URL для клиентских частей экрана. Next синхронизирует
// useSearchParams с History API, поэтому переключение вида не ходит на сервер.
export function ConsoleViewProvider({
  hasIncident,
  focusStep,
  children,
}: Props) {
  const params = useSearchParams();
  const view = parseView(params, hasIncident);
  const canFocus = focusStep && view.tab === "incident";
  const value = {
    ...view,
    canFocus,
    isFocused: canFocus && view.focus,
    hrefFor: (patch: ViewPatch) => viewHref(params, patch),
  };
  return <Context value={value}>{children}</Context>;
}

export function useConsoleView() {
  const view = use(Context);
  if (view == null)
    throw new Error("Вид пульта нужен внутри ConsoleViewProvider");
  return view;
}
