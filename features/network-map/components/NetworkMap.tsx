"use client";

import dynamic from "next/dynamic";
import type { MovingTrain, ZoneSection, ZoneStation } from "../types";

// Leaflet обращается к window при импорте, поэтому карту грузим только в браузере.
const MapCanvas = dynamic(
  () => import("./MapCanvas").then((mod) => mod.MapCanvas),
  { ssr: false, loading: MapPlaceholder },
);

type Props = {
  stations: ZoneStation[];
  sections: ZoneSection[];
  movingTrains: MovingTrain[];
  selectedStationId: string | null;
  requestStationIds: string[];
  onSelect: (stationId: string | null) => void;
};

export function NetworkMap(props: Props) {
  return <MapCanvas {...props} />;
}

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface">
      <span className="font-heading text-lg text-muted italic">
        Загрузка карты…
      </span>
    </div>
  );
}
