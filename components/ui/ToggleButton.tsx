import type { ComponentProps } from "react";
import { FIREFOX_NO_RESTORE } from "./noRestore";

type Props = ComponentProps<"button"> & {
  active: boolean;
};

// Кнопка-фильтр в ряду вариантов: выбранная — подложкой акцента (выбор),
// остальные — тонкой линией. Не главное действие, поэтому без заливки.
export function ToggleButton({
  active,
  className = "",
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      aria-pressed={active}
      {...FIREFOX_NO_RESTORE}
      className={`cursor-pointer whitespace-nowrap rounded-md border px-2.5 py-1 text-[13px] leading-tight transition-colors ${active ? ACTIVE_CLASS : IDLE_CLASS} ${className}`}
      {...props}
    />
  );
}

const ACTIVE_CLASS = "border-accent bg-accent-100 text-accent-800";
const IDLE_CLASS =
  "border-line text-neutral-800 hover:border-neutral-400 hover:bg-neutral-100";
