import { ConsoleLink } from "./ConsoleLink";

// Кнопка «›» в шапке правой панели: сворачивает её в узкую полосу.
export function CollapseLink() {
  return (
    <ConsoleLink
      patch={{ panel: false }}
      title="Свернуть панель"
      aria-label="Свернуть панель"
      className="flex w-11 flex-none items-center justify-center border-line border-l font-heading text-[20px] text-muted hover:bg-ink/4 hover:text-accent-700"
    >
      ›
    </ConsoleLink>
  );
}
