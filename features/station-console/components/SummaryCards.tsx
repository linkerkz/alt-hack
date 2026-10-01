import { STATUS_TEXT_CLASS, toStatus } from "@/lib/status";

type Props = {
  efficiencyIndex: number;
  planPercent: number;
  trainCount: number;
  delayCount: number;
  trackLoad: number;
};

export function SummaryCards({
  efficiencyIndex,
  planPercent,
  trainCount,
  delayCount,
  trackLoad,
}: Props) {
  const status = toStatus(efficiencyIndex);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Card
        label="Индекс эффективности"
        value={`${efficiencyIndex}%`}
        valueClass={STATUS_TEXT_CLASS[status]}
      />
      <Card label="Выполнение плана" value={`${planPercent}%`} />
      <Card label="Поезда" value={`${trainCount}`} />
      <Card
        label="Задержки"
        value={`${delayCount}`}
        valueClass={delayCount > 0 ? "text-status-warning" : undefined}
      />
      <Card
        label="Загрузка путей"
        value={`${trackLoad}%`}
        valueClass={trackLoad >= 85 ? "text-status-warning" : undefined}
      />
    </div>
  );
}

type CardProps = {
  label: string;
  value: string;
  valueClass?: string;
};

function Card({ label, value, valueClass }: CardProps) {
  return (
    <div className="rounded-md border border-line px-4 py-3">
      <p className="text-[10px] text-muted uppercase tracking-widest">
        {label}
      </p>
      <p
        className={`mt-1 font-heading text-2xl tabular-nums ${valueClass ?? "text-ink"}`}
      >
        {value}
      </p>
    </div>
  );
}
