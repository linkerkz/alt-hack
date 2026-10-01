import Link from "next/link";
import {
  STATION_KIND_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  toStatus,
} from "../status";
import type { Station, StationTraffic } from "../types";
import { DirectionList } from "./DirectionList";
import { FlowCounters } from "./FlowCounters";
import { IncidentList } from "./IncidentList";
import { IndexRing } from "./IndexRing";
import { TrainEventList } from "./TrainEventList";

type Props = {
  station: Station;
  traffic: StationTraffic;
  canOpenConsole: boolean;
};

export function StationPreview({ station, traffic, canOpenConsole }: Props) {
  const status = toStatus(station.efficiencyIndex);

  return (
    <aside className="flex max-h-full w-[380px] flex-col overflow-hidden rounded-lg border border-line bg-surface-1/95 shadow-2xl backdrop-blur">
      <header className="flex items-center gap-4 border-line border-b p-4">
        <IndexRing value={station.efficiencyIndex} size={64} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] text-muted uppercase tracking-wider">
            {STATION_KIND_LABEL[station.kind]} · ЕСР {station.code}
          </p>
          <h2 className="mt-0.5 truncate font-semibold text-lg text-white">
            {station.name}
          </h2>
          <span
            className={`mt-1 inline-flex rounded border px-2 py-0.5 font-medium text-[11px] uppercase tracking-wider ${STATUS_BADGE_CLASS[status]}`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>
        <Link
          href="/"
          scroll={false}
          aria-label="Закрыть карточку станции"
          className="self-start rounded px-2 py-1 text-muted hover:bg-surface-2 hover:text-white"
        >
          ✕
        </Link>
      </header>

      <div className="space-y-5 overflow-y-auto p-4">
        <FlowCounters flow={traffic.flow} size="lg" />
        <DirectionList directions={traffic.directions} />
        <TrainEventList events={traffic.events} />
        <IncidentList incidents={station.incidents} />
      </div>

      <footer className="border-line border-t p-4">
        {canOpenConsole ? (
          <Link
            href={`/stations/${station.id}`}
            className="flex w-full items-center justify-center gap-2 rounded bg-sky-500 px-4 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-sky-400"
          >
            Открыть пульт станции
            <span aria-hidden>→</span>
          </Link>
        ) : (
          <p className="text-center text-muted text-xs">
            Пульт этой станции вне вашей зоны ответственности
          </p>
        )}
      </footer>
    </aside>
  );
}
