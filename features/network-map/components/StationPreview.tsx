import Link from "next/link";
import {
  STATION_KIND_LABEL,
  STATUS_BADGE_CLASS,
  STATUS_LABEL,
  toStatus,
} from "../status";
import type { StationTraffic, ZoneStation } from "../types";
import { DirectionList } from "./DirectionList";
import { FlowCounters } from "./FlowCounters";
import { IncidentList } from "./IncidentList";
import { IndexRing } from "./IndexRing";
import { TrainEventList } from "./TrainEventList";

type Props = {
  station: ZoneStation;
  traffic: StationTraffic;
  canOpenConsole: boolean;
  // null — карточку закрыть нельзя (своя станция ДСП).
  onClose: (() => void) | null;
};

export function StationPreview({
  station,
  traffic,
  canOpenConsole,
  onClose,
}: Props) {
  const status = toStatus(station.efficiencyIndex);

  return (
    <aside className="flex max-h-full w-[380px] flex-col overflow-hidden rounded-lg border border-line bg-surface-1 shadow-2xl">
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
        {onClose != null && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть карточку станции"
            className="self-start rounded px-2 py-1 text-muted hover:bg-surface-2 hover:text-white"
          >
            ✕
          </button>
        )}
      </header>

      <div className="space-y-5 overflow-y-auto p-4">
        <FlowCounters flow={station.flow} size="lg" />
        <DirectionList directions={traffic.directions} />
        <TrainEventList events={traffic.events} />
        <IncidentList incidents={station.incidents} />
      </div>

      <footer className="border-line border-t p-4">
        {canOpenConsole ? (
          <Link
            href={`/stations/${station.id}`}
            // Без предзагрузки: иначе каждый выбор станции дёргает сервер и Supabase.
            prefetch={false}
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
