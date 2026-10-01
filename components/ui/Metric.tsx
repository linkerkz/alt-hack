import type { ReactNode } from "react";

type Props = {
  label: ReactNode;
  value: ReactNode;
  // Класс цвета значения: тон состояния или приглушённый для нуля.
  valueClass?: string;
  // Пояснение под значением или полоса Meter.
  children?: ReactNode;
  title?: string;
};

// Показатель: подпись мелко, значение — крупным числом.
export function Metric({
  label,
  value,
  valueClass = "text-ink",
  children,
  title,
}: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5" title={title}>
      <dt className="truncate text-[12px] text-muted">{label}</dt>
      <dd
        className={`font-heading font-semibold text-[22px] leading-[1.15] tracking-[-0.01em] ${valueClass}`}
      >
        {value}
      </dd>
      {children}
    </div>
  );
}
