import type { ComponentProps } from "react";

// Таблица данных: шапка капителью, строки разделены тонкими линиями.
// Ячейки — обычные <th>/<td>: оформление задаётся здесь, на всю таблицу.
export function Table({ className = "", ...props }: ComponentProps<"table">) {
  return (
    <table
      className={`w-full border-collapse text-[13px] [&_td]:border-line [&_td]:border-b [&_td]:p-2 [&_th]:border-line [&_th]:border-b [&_th]:p-2 [&_th]:text-left [&_th]:font-normal [&_th]:text-[11px] [&_th]:text-ink/60 [&_th]:uppercase [&_th]:tracking-[0.08em] [&_tbody_tr:hover]:bg-ink/4 ${className}`}
      {...props}
    />
  );
}
