import Link from "next/link";
import {
  INCIDENT_KIND_LABEL,
  STATION_KIND_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  toStatus,
} from "../status";
import type { Incident, Station } from "../types";
import { IndexRing } from "./IndexRing";

export function StationPreview({ station }: { station: Station }) {
  const status = toStatus(station.efficiencyIndex);

  return (
    <aside className="flex max-h-full w-[360px] flex-col overflow-hidden rounded-lg border border-line bg-surface-1/95 shadow-2xl backdrop-blur">
      <header className="flex items-start justify-between gap-3 border-line border-b p-4">
        <div className="min-w-0">
          <p className="font-mono text-[11px] text-muted uppercase tracking-wider">
            {STATION_KIND_LABEL[station.kind]} · ЕСР {station.code}
          </p>
          <h2 className="mt-1 truncate font-semibold text-lg text-white">
            {station.name}
          </h2>
        </div>
        <Link
          href="/"
          scroll={false}
          aria-label="Закрыть превью станции"
          className="rounded px-2 py-1 text-muted hover:bg-surface-2 hover:text-white"
        >
          ✕
        </Link>
      </header>

      <div className="space-y-4 overflow-y-auto p-4">
        <div className="flex items-center gap-4">
          <IndexRing value={station.efficiencyIndex} size={84} />
          <div className="space-y-2">
            <p className="text-muted text-xs">Индекс эффективности станции</p>
            <span
              className={`inline-flex rounded border px-2 py-0.5 font-medium text-xs uppercase tracking-wider ${STATUS_BADGE_CLASS[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-2">
          <Metric label="Поездов на станции" value={`${station.trainCount}`} />
          <Metric
            label="Загрузка путей"
            value={`${station.trackLoad}%`}
            warn={station.trackLoad >= 85}
          />
          <Metric
            label="Отклонение от графика"
            value={`${station.avgDelayMinutes} мин`}
            warn={station.avgDelayMinutes >= 15}
          />
          <Metric
            label="Конфликтов маршрутов"
            value={`${station.conflictCount}`}
            warn={station.conflictCount >= 3}
          />
        </dl>

        <IncidentList incidents={station.incidents} />
      </div>

      <footer className="border-line border-t p-4">
        <Link
          href={`/stations/${station.id}`}
          className="flex w-full items-center justify-center gap-2 rounded bg-sky-500 px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-sky-400"
        >
          Открыть пульт станции
          <span aria-hidden>→</span>
        </Link>
      </footer>
    </aside>
  );
}

type MetricProps = {
  label: string;
  value: string;
  warn?: boolean;
};

function Metric({ label, value, warn = false }: MetricProps) {
  return (
    <div className="rounded border border-line bg-surface-0/60 px-3 py-2">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd
        className={`font-mono font-semibold text-base tabular-nums ${warn ? "text-amber-300" : "text-white"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <p className="rounded border border-emerald-400/20 bg-emerald-400/5 px-3 py-2 text-emerald-300 text-xs">
        Активных сбоев нет
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-[11px] text-muted uppercase tracking-widest">
        Активные сбои · {incidents.length}
      </h3>
      <ul className="space-y-1.5">
        {incidents.map((incident) => (
          <li
            key={incident.id}
            className="rounded border-rose-500 border-l-2 bg-rose-500/10 px-3 py-2"
          >
            <div className="flex justify-between text-[11px]">
              <span className="font-medium text-rose-300">
                {INCIDENT_KIND_LABEL[incident.kind]}
              </span>
              <span className="font-mono text-muted">{incident.startedAt}</span>
            </div>
            <p className="mt-0.5 text-sm text-zinc-200 leading-snug">
              {incident.title}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
