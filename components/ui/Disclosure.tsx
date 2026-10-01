import type { ReactNode } from "react";

type Props = {
  title: string;
  // Короткая подпись справа: «4 участника», «12 событий».
  meta?: string;
  // Раскрыт сразу; дальше человек сворачивает и разворачивает сам.
  open?: boolean;
  children: ReactNode;
};

// Раскрывающийся раздел: заголовок капителью над тонкой линией, содержимое —
// по клику. Подробности, которые не нужны каждую секунду.
export function Disclosure({ title, meta, open = false, children }: Props) {
  return (
    <details open={open} className="group border-line border-t">
      <summary className="flex cursor-pointer list-none items-baseline justify-between gap-2 py-2.5 hover:text-accent-700 [&::-webkit-details-marker]:hidden">
        <span className="flex items-baseline gap-2 text-[11px] uppercase tracking-[0.1em]">
          <span
            aria-hidden
            className="inline-block transition-transform group-open:rotate-90"
          >
            ›
          </span>
          {title}
        </span>
        {meta != null && <span className="text-[11px] text-muted">{meta}</span>}
      </summary>
      <div className="flex flex-col gap-2.5 pb-3.5">{children}</div>
    </details>
  );
}
