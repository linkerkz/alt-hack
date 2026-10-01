"use client";

import type { ReactNode } from "react";
import { useConsoleView } from "./ConsoleView";

type Props = { className: string; children: ReactNode };

// Левая часть пульта: схема и план путей. В фокусе на инциденте помечена
// data-focus — приглушение остального задают классы group-data-[focus]/console
// у самих элементов, серверные части не перерисовываются.
export function FocusScope({ className, children }: Props) {
  const { isFocused } = useConsoleView();
  return (
    <section
      data-focus={isFocused ? "" : undefined}
      className={`group/console ${className}`}
    >
      {children}
    </section>
  );
}
