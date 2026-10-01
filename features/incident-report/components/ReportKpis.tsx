import type { ReportKpi } from "../types";

// Итог инцидента: факт крупно, рядом — с чем сравниваем, ниже — пояснение.
export function ReportKpis({ kpis }: { kpis: ReportKpi[] }) {
  return (
    <dl className="grid grid-cols-2 border-ink border-t border-b border-b-line sm:grid-cols-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="flex flex-col gap-1 py-3.5 pr-3.5">
          <dt className="text-[11px] text-muted uppercase tracking-[0.08em]">
            {kpi.label}
          </dt>
          <dd className="flex items-baseline gap-2.5">
            <span className="font-heading text-[34px] leading-none">
              {kpi.fact}
            </span>
            <span className="text-[12px] text-neutral-600">{kpi.compare}</span>
          </dd>
          <dd className="text-[11.5px] text-accent-700 italic">{kpi.note}</dd>
        </div>
      ))}
    </dl>
  );
}
