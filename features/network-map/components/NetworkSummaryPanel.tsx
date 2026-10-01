import {
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_TEXT_CLASS,
  toStatus,
} from "../status";
import type { NetworkSummary } from "../types";
import { IndexRing } from "./IndexRing";

export function NetworkSummaryPanel({ summary }: { summary: NetworkSummary }) {
  const status = toStatus(summary.avgEfficiencyIndex);

  return (
    <section className="space-y-4 border-line border-b p-4">
      <div className="flex items-center gap-4">
        <IndexRing value={summary.avgEfficiencyIndex} />
        <div className="space-y-2">
          <p className="text-muted text-xs leading-snug">
            Средний индекс эффективности сети
          </p>
          <span
            className={`inline-flex rounded border px-2 py-0.5 font-medium text-xs uppercase tracking-wider ${STATUS_BADGE_CLASS[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      <StatusBreakdown summary={summary} />

      <dl className="grid grid-cols-2 gap-2">
        <Metric label="Поездов на станциях" value={summary.trainCount} />
        <Metric
          label="Активных сбоев"
          value={summary.incidentCount}
          accent={summary.incidentCount > 0}
        />
      </dl>
    </section>
  );
}

function StatusBreakdown({ summary }: { summary: NetworkSummary }) {
  const { stationCount, stationCountByStatus } = summary;

  return (
    <div className="space-y-2">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-line">
        {STATUS_ORDER.map((status) => (
          <div
            key={status}
            className={STATUS_DOT_CLASS[status]}
            style={{
              width: `${(stationCountByStatus[status] / stationCount) * 100}%`,
            }}
          />
        ))}
      </div>
      <ul className="flex justify-between text-xs">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span
              className={`size-2 rounded-full ${STATUS_DOT_CLASS[status]}`}
            />
            <span className="text-muted">{STATUS_LABEL[status]}</span>
            <span
              className={`font-mono font-semibold ${STATUS_TEXT_CLASS[status]}`}
            >
              {stationCountByStatus[status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type MetricProps = {
  label: string;
  value: number;
  accent?: boolean;
};

function Metric({ label, value, accent = false }: MetricProps) {
  return (
    <div className="rounded border border-line bg-surface-1 px-3 py-2">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd
        className={`font-mono font-semibold text-xl tabular-nums ${accent ? "text-rose-400" : "text-white"}`}
      >
        {value}
      </dd>
    </div>
  );
}
