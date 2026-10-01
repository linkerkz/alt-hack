import type { StationStatistics } from "../types";

export function Statistics({ stats }: { stats: StationStatistics }) {
  return (
    <section className="space-y-3 rounded-lg border border-line bg-surface-1 p-5">
      <p className="text-[11px] text-muted uppercase tracking-widest">
        Статистика смены
      </p>
      <dl className="grid grid-cols-2 gap-3">
        <Row label="Обработано поездов" value={stats.trainsProcessed} />
        <Row
          label="Среднее время обработки"
          value={`${stats.avgProcessingMinutes} мин`}
        />
        <Row label="Задержки" value={stats.delayCount} />
        <Row label="Средняя задержка" value={`${stats.avgDelayMinutes} мин`} />
        <Row label="Операций выполнено" value={stats.operationsCompleted} />
      </dl>
    </section>
  );
}

type RowProps = {
  label: string;
  value: string | number;
};

function Row({ label, value }: RowProps) {
  return (
    <div className="rounded border border-line bg-surface-0/60 px-3 py-2">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="font-mono font-semibold text-base text-white tabular-nums">
        {value}
      </dd>
    </div>
  );
}
