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
        valueClass={delayCount > 0 ? "text-amber-300" : undefined}
      />
      <Card
        label="Загрузка путей"
        value={`${trackLoad}%`}
        valueClass={trackLoad >= 85 ? "text-amber-300" : undefined}
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
    <div className="rounded-lg border border-line bg-surface-1 px-4 py-3">
      <p className="text-[11px] text-muted uppercase tracking-wider">{label}</p>
      <p
        className={`mt-1 font-mono font-semibold text-2xl tabular-nums ${valueClass ?? "text-white"}`}
      >
        {value}
      </p>
    </div>
  );
}
