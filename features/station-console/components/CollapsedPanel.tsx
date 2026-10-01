import Link from "next/link";
import type { ReactNode } from "react";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";

type Props = {
  state: ConsoleState;
  // Название панели, вертикально вдоль полосы.
  label: string;
  // Значок о том, что в панели есть срочное: инцидент или новые задачи.
  marker?: ReactNode;
};

// Свёрнутая правая панель: узкая полоса, по клику панель открывается.
export function CollapsedPanel({ state, label, marker }: Props) {
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
        {label}
      </span>
      {marker}
      <span className="sr-only">Развернуть панель</span>
    </Link>
  );
}
