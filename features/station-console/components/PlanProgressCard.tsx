import type { PlanProgress } from "../types";

export function PlanProgressCard({ progress }: { progress: PlanProgress }) {
  const { completed, inProgress, problems, total } = progress;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="space-y-3 rounded-lg border border-line bg-surface-1 p-5">
      <p className="text-[11px] text-muted uppercase tracking-widest">
        Выполнение плана
      </p>
      <p className="font-mono font-semibold text-3xl text-white tabular-nums">
        {percent}%
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-sky-400"
          style={{ width: `${percent}%` }}
        />
      </div>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Stat
          label="Выполнено"
          value={completed}
          className="text-emerald-300"
        />
        <Stat label="В работе" value={inProgress} className="text-sky-300" />
        <Stat label="Проблемы" value={problems} className="text-rose-300" />
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
      <dd className={`font-mono font-semibold tabular-nums ${className}`}>
        {value}
      </dd>
    </div>
  );
}
