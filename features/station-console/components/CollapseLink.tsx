import Link from "next/link";
import { consoleHref } from "../state";
import type { ConsoleState } from "../types";

// Кнопка «›» в шапке правой панели: сворачивает её в узкую полосу.
export function CollapseLink({ state }: { state: ConsoleState }) {
  return (
    <Link
      prefetch={false}
      href={consoleHref(state, { panel: false })}
      scroll={false}
      title="Свернуть панель"
      aria-label="Свернуть панель"
      className="flex w-11 flex-none items-center justify-center border-line border-l font-heading text-[20px] text-muted hover:bg-ink/4 hover:text-accent-700"
    >
      ›
    </Link>
  );
}
