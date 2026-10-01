import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  // Пояснение мелким шрифтом справа от заголовка.
  note?: ReactNode;
  level?: 1 | 2 | 3;
  className?: string;
};

// Заголовок: 1 — экран, 2 — карточка, 3 — раздел внутри неё.
const LEVEL_CLASS = {
  1: "text-[24px] leading-[1.15] tracking-[-0.01em]",
  2: "text-[19px] leading-tight tracking-[-0.005em]",
  3: "text-[16px] leading-tight",
};

export function Heading({ children, note, level = 3, className = "" }: Props) {
  const Tag = (["h1", "h2", "h3"] as const)[level - 1];
  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${className}`}
    >
      <Tag className={`font-heading font-semibold ${LEVEL_CLASS[level]}`}>
        {children}
      </Tag>
      {note != null && <span className="text-[12px] text-muted">{note}</span>}
    </div>
  );
}
