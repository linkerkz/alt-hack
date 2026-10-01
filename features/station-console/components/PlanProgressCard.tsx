import type { PlanProgress } from "../types";

export function PlanProgressCard({ progress }: { progress: PlanProgress }) {
  const { completed, inProgress, problems, total } = progress;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="space-y-3 rounded-md border border-line p-5">
      <p className="text-[10px] text-muted uppercase tracking-widest">
        Выполнение плана
      </p>
      <p className="font-heading text-3xl text-ink tabular-nums">{percent}%</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Stat
          label="Выполнено"
          value={completed}
          className="text-status-normal"
        />
        <Stat label="В работе" value={inProgress} className="text-accent-700" />
        <Stat
          label="Проблемы"
          value={problems}
          className="text-status-critical"
        />
      </dl>
      <p className="text-[11px] text-muted">Всего операций: {total}</p>
    </section>
  );
}

type StatProps = {
  label: string;
  value: number;
  className: string;
};

function Stat({ label, value, className }: StatProps) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className={`font-heading tabular-nums ${className}`}>{value}</dd>
    </div>
  );
}
