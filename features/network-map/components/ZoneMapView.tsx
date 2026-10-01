"use client";

import { useSearchParams } from "next/navigation";
import type {
  StationTraffic,
  ZoneSection,
  ZoneStation,
  ZoneSummary,
} from "../types";
import { MapLegend } from "./MapLegend";
import { NetworkMap } from "./NetworkMap";
import { StationList } from "./StationList";
import { StationPreview } from "./StationPreview";
import { ZoneSummaryPanel } from "./ZoneSummaryPanel";

type Props = {
  title: string;
  summary: ZoneSummary;
  stations: ZoneStation[];
  sections: ZoneSection[];
  trafficByStation: Record<string, StationTraffic>;
  // Станция, выбранная по умолчанию: у ДСП/ДСЦС/ДС — своя.
  defaultStationId: string | null;
  consoleStationIds: string[];
};

// Выбранная станция живёт в URL (?station=), но меняется через History API:
// Next синхронизирует useSearchParams без запроса к серверу.
export function ZoneMapView(props: Props) {
  const { stations, trafficByStation, defaultStationId } = props;
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("station") ?? defaultStationId;

  const scopeStations = stations.filter((station) => station.isInScope);
  const selectedStation =
    scopeStations.find((station) => station.id === selectedId) ?? null;
  const traffic =
    selectedStation == null ? null : trafficByStation[selectedStation.id];
  const selectedStationId = selectedStation?.id ?? null;

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-80 shrink-0 flex-col border-line border-r bg-surface-1">
        <ZoneSummaryPanel title={props.title} summary={props.summary} />
        <StationList
          stations={scopeStations}
          selectedStationId={selectedStationId}
          onSelect={selectStation}
        />
      </aside>

      <main className="relative min-w-0 flex-1">
        <NetworkMap
          stations={stations}
          sections={props.sections}
          selectedStationId={selectedStationId}
          onSelect={selectStation}
        />
        {selectedStation != null && traffic != null && (
          <div className="absolute top-4 right-4 bottom-4 z-[1000] flex items-start">
            <StationPreview
              station={selectedStation}
              traffic={traffic}
              canOpenConsole={props.consoleStationIds.includes(
                selectedStation.id,
              )}
              onClose={
                selectedStationId === defaultStationId
                  ? null
                  : () => selectStation(null)
              }
            />
          </div>
        )}
        <div className="absolute bottom-6 left-4 z-[1000]">
          <MapLegend />
        </div>
      </main>
    </div>
  );
}

function selectStation(stationId: string | null) {
  const query = stationId == null ? "" : `?station=${stationId}`;
  window.history.pushState(null, "", `${window.location.pathname}${query}`);
}
