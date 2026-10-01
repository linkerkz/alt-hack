"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type {
  StationTrain,
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
  trainsByStation: Record<string, StationTrain[]>;
  // Станция, выбранная по умолчанию: у ДСП/ДСЦС/ДС — своя.
  defaultStationId: string | null;
  consoleStationIds: string[];
  // Станции, которые ждут ответа ДНЦ на запрос на согласование.
  requestStationIds: string[];
  // Карточки поверх карты слева сверху; их собирает страница.
  overlay?: ReactNode;
};

// Выбранная станция живёт в URL (?station=), но меняется через History API:
// Next синхронизирует useSearchParams без запроса к серверу.
export function ZoneMapView(props: Props) {
  const { stations, trainsByStation, defaultStationId, requestStationIds } =
    props;
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("station") ?? defaultStationId;

  const scopeStations = stations.filter((station) => station.isInScope);
  const selectedStation =
    scopeStations.find((station) => station.id === selectedId) ?? null;
  const trains =
    selectedStation == null ? null : trainsByStation[selectedStation.id];
  const selectedStationId = selectedStation?.id ?? null;

  return (
    <div className="flex min-h-0 flex-1">
      <aside className="flex w-80 shrink-0 flex-col border-line border-r bg-paper">
        <ZoneSummaryPanel
          title={props.title}
          summary={props.summary}
          requestCount={requestStationIds.length}
        />
        <StationList
          stations={scopeStations}
          selectedStationId={selectedStationId}
          requestStationIds={requestStationIds}
          onSelect={selectStation}
        />
      </aside>

      <main className="relative min-w-0 flex-1">
        <NetworkMap
          stations={stations}
          sections={props.sections}
          selectedStationId={selectedStationId}
          requestStationIds={requestStationIds}
          onSelect={selectStation}
        />
        {props.overlay && (
          // Пустые места слоя пропускают клики к карте; справа — место карточке станции.
          <div
            className={`pointer-events-none absolute top-4 left-4 z-[1000] *:pointer-events-auto ${selectedStation == null ? "right-4" : "right-[412px]"}`}
          >
            {props.overlay}
          </div>
        )}
        {selectedStation != null && trains != null && (
          <div className="absolute top-4 right-4 bottom-4 z-[1000] flex items-start">
            <StationPreview
              station={selectedStation}
              trains={trains}
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
