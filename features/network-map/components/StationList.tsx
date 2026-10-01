import Link from "next/link";
import {
  STATION_KIND_LABEL,
  STATUS_DOT_CLASS,
  STATUS_TEXT_CLASS,
  toStatus,
} from "../status";
import type { Station } from "../types";

type Props = {
  stations: Station[];
  selectedStationId: string | null;
};

export function StationList({ stations, selectedStationId }: Props) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-baseline justify-between px-4 pt-4 pb-2">
        <h2 className="font-semibold text-[11px] text-muted uppercase tracking-widest">
          Станции · {stations.length}
        </h2>
        <span className="text-[11px] text-muted">по критичности</span>
      </header>
      <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {stations.map((station) => (
          <li key={station.id}>
            <StationRow
              station={station}
              isSelected={station.id === selectedStationId}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

type RowProps = {
  station: Station;
  isSelected: boolean;
};

function StationRow({ station, isSelected }: RowProps) {
  const status = toStatus(station.efficiencyIndex);
  const incidentCount = station.incidents.length;

  return (
    <Link
      href={`/?station=${station.id}`}
      scroll={false}
      aria-current={isSelected ? "true" : undefined}
      className={`flex items-center gap-3 rounded px-2 py-2 transition-colors hover:bg-surface-2 ${isSelected ? "bg-surface-2 ring-1 ring-white/15" : ""}`}
    >
      <span
        className={`size-2 shrink-0 rounded-full ${STATUS_DOT_CLASS[status]}`}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-zinc-100">
          {station.name}
        </span>
        <span className="block text-[11px] text-muted">
          {STATION_KIND_LABEL[station.kind]}
          {incidentCount > 0 && (
            <span className="text-rose-400"> · сбоев: {incidentCount}</span>
          )}
        </span>
      </span>
      <span
        className={`font-mono font-semibold text-sm tabular-nums ${STATUS_TEXT_CLASS[status]}`}
      >
        {station.efficiencyIndex}
      </span>
    </Link>
  );
}
