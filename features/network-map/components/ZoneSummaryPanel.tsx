import { HORIZON_MINUTES } from "../flows";
import {
  STATUS_BADGE_CLASS,
  STATUS_DOT_CLASS,
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_TEXT_CLASS,
  toStatus,
} from "../status";
import type { ZoneSummary } from "../types";
import { IndexRing } from "./IndexRing";

type Props = {
  title: string;
  summary: ZoneSummary;
};

export function ZoneSummaryPanel({ title, summary }: Props) {
  const status = toStatus(summary.avgEfficiencyIndex);

  return (
    <section className="space-y-4 border-line border-b p-4">
      <div>
        <p className="font-mono text-[11px] text-muted uppercase tracking-widest">
          Зона ответственности
        </p>
        <h1 className="mt-0.5 font-semibold text-lg text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <IndexRing value={summary.avgEfficiencyIndex} size={80} />
        <div className="space-y-2">
          <p className="text-muted text-xs leading-snug">
            Средний индекс эффективности зоны
          </p>
          <span
            className={`inline-flex rounded border px-2 py-0.5 font-medium text-xs uppercase tracking-wider ${STATUS_BADGE_CLASS[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>

      {summary.stationCount > 1 && <StatusBreakdown summary={summary} />}

      <dl className="grid grid-cols-3 gap-2">
        <Metric label="Поездов в зоне" value={summary.trainsWithinCount} />
        <Metric
          label={`Прибытий за ${HORIZON_MINUTES / 60} ч`}
          value={summary.arrivingCount}
        />
        <Metric
          label="Сбоев"
          value={summary.incidentCount}
          accent={summary.incidentCount > 0}
        />
      </dl>
    </section>
  );
}

function StatusBreakdown({ summary }: { summary: ZoneSummary }) {
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
    <div className="flex flex-col justify-between gap-1 rounded border border-line bg-surface-1 px-2.5 py-2">
      <dt className="text-[11px] text-muted leading-tight">{label}</dt>
      <dd
        className={`font-mono font-semibold text-xl tabular-nums ${accent ? "text-rose-400" : "text-white"}`}
      >
        {value}
      </dd>
    </div>
  );
}
