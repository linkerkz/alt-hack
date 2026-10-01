import { Kicker } from "@/components/ui/Kicker";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import { toStatus } from "../status";
import type { ZoneStation } from "../types";
import { FlowCounters } from "./FlowCounters";

type Props = {
  stations: ZoneStation[];
  selectedStationId: string | null;
  onSelect: (stationId: string) => void;
};

export function StationList({ stations, selectedStationId, onSelect }: Props) {
  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-baseline justify-between px-4 pt-4 pb-2">
        <Kicker>Станции · {stations.length}</Kicker>
        <span className="text-[11px] text-muted">
          ↓ к нам ↑ от нас ⇢ проезд
        </span>
      </header>
      <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {stations.map((station) => (
          <li
            key={station.id}
            className="border-line border-t first:border-t-0"
          >
            <StationRow
              station={station}
              isSelected={station.id === selectedStationId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

type RowProps = {
  station: ZoneStation;
  isSelected: boolean;
  onSelect: (stationId: string) => void;
};

function StationRow({ station, isSelected, onSelect }: RowProps) {
  const status = toStatus(station.efficiencyIndex);
  const incidentCount = station.incidents.length;

  return (
    <button
      type="button"
      onClick={() => onSelect(station.id)}
      aria-current={isSelected ? "true" : undefined}
      className={`flex w-full cursor-pointer items-center gap-3 border-l-2 px-2 py-2 text-left transition-colors ${isSelected ? "border-accent bg-accent-100" : "border-transparent hover:bg-ink/4"}`}
    >
      <StatusGlyph tone={status} />
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="flex items-baseline gap-2">
          <span className="truncate font-heading font-semibold text-[17px] leading-tight">
            {station.name}
          </span>
          {incidentCount > 0 && (
            <span className="text-[11px] text-critical">
              сбоев: {incidentCount}
            </span>
          )}
        </span>
        <FlowCounters flow={station.flow} />
      </span>
      <span
        className={`font-heading text-[22px] leading-none ${TONE_TEXT_CLASS[status]}`}
      >
        {station.efficiencyIndex}
      </span>
    </button>
  );
}
