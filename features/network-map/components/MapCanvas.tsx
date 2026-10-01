"use client";

import { type FitBoundsOptions, latLngBounds } from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap, useMapEvent } from "react-leaflet";
import type { ZoneSection, ZoneStation } from "../types";
import { SectionLine } from "./SectionLine";
import { SelectedStationFocus } from "./SelectedStationFocus";
import { StationMarker } from "./StationMarker";

// Светлая подложка Esri без подписей: работает без API-ключа (CARTO теперь его требует).
const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ";

// Отступ рамки зоны: справа место под карточку станции и подписи станций.
const FIT_PADDING: FitBoundsOptions = {
  paddingTopLeft: [60, 60],
  paddingBottomRight: [420, 60],
};

type Props = {
  stations: ZoneStation[];
  sections: ZoneSection[];
  selectedStationId: string | null;
  onSelect: (stationId: string | null) => void;
};

// Маркеры и участки мемоизированы: при выборе станции перерисовываются
// только те, у кого поменялся признак выбора или подсветки.
export function MapCanvas({
  stations,
  sections,
  selectedStationId,
  onSelect,
}: Props) {
  const stationById = useMemo(
    () => new Map(stations.map((station) => [station.id, station])),
    [stations],
  );
  const zoneBounds = useMemo(
    () => latLngBounds(stations.map((station) => [station.lat, station.lon])),
    [stations],
  );
  const selectedStation =
    selectedStationId == null ? null : stationById.get(selectedStationId);

  return (
    <MapContainer
      bounds={zoneBounds}
      boundsOptions={FIT_PADDING}
      maxBounds={zoneBounds.pad(0.8)}
      maxBoundsViscosity={1}
      zoomSnap={0.25}
      maxZoom={11}
      zoomControl={false}
      className="h-full w-full"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />

      {sections.map((section) => (
        <SectionLine
          key={section.id}
          section={section}
          from={stationById.get(section.fromId)}
          to={stationById.get(section.toId)}
          isHighlighted={
            section.fromId === selectedStationId ||
            section.toId === selectedStationId
          }
        />
      ))}

      {stations.map((station) => (
        <StationMarker
          key={station.id}
          station={station}
          isSelected={station.id === selectedStationId}
          onSelect={onSelect}
        />
      ))}

      <SelectedStationFocus station={selectedStation ?? null} />
      <DeselectOnMapClick onDeselect={() => onSelect(null)} />
      <LimitZoomOut />
    </MapContainer>
  );
}

function DeselectOnMapClick({ onDeselect }: { onDeselect: () => void }) {
  useMapEvent("click", onDeselect);
  return null;
}

// Дальше зоны отдалять нельзя: минимальный зум — чуть меньше стартового.
function LimitZoomOut() {
  const map = useMap();
  useEffect(() => {
    map.setMinZoom(map.getZoom() - 0.5);
  }, [map]);
  return null;
}
