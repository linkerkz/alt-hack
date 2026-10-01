"use client";

import type { LatLngBoundsExpression } from "leaflet";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, useMapEvent } from "react-leaflet";
import type { Section, Station } from "../types";
import { SectionLine } from "./SectionLine";
import { SelectedStationFocus } from "./SelectedStationFocus";
import { StationMarker } from "./StationMarker";

// Тёмная подложка Esri без подписей: работает без API-ключа (CARTO теперь его требует).
const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTRIBUTION = "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ";

type Props = {
  stations: Station[];
  sections: Section[];
  selectedStationId: string | null;
};

export function MapCanvas({ stations, sections, selectedStationId }: Props) {
  const router = useRouter();
  const stationById = new Map(stations.map((station) => [station.id, station]));
  const selectedStation =
    selectedStationId == null ? null : stationById.get(selectedStationId);

  const selectStation = (stationId: string | null) => {
    const href = stationId == null ? "/" : `/?station=${stationId}`;
    router.push(href, { scroll: false });
  };

  return (
    <MapContainer
      bounds={boundsOf(stations)}
      boundsOptions={{ padding: [56, 56] }}
      zoomSnap={0.25}
      minZoom={5}
      maxZoom={10}
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
        />
      ))}

      {stations.map((station) => (
        <StationMarker
          key={station.id}
          station={station}
          isSelected={station.id === selectedStationId}
          onSelect={selectStation}
        />
      ))}

      <SelectedStationFocus station={selectedStation ?? null} />
      <DeselectOnMapClick onDeselect={() => selectStation(null)} />
    </MapContainer>
  );
}

function DeselectOnMapClick({ onDeselect }: { onDeselect: () => void }) {
  useMapEvent("click", onDeselect);
  return null;
}

function boundsOf(stations: Station[]): LatLngBoundsExpression {
  const lats = stations.map((station) => station.lat);
  const lons = stations.map((station) => station.lon);
  return [
    [Math.min(...lats), Math.min(...lons)],
    [Math.max(...lats), Math.max(...lons)],
  ];
}
