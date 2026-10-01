"use client";

import dynamic from "next/dynamic";
import type { ZoneSection, ZoneStation } from "../types";

// Leaflet обращается к window при импорте, поэтому карту грузим только в браузере.
const MapCanvas = dynamic(
  () => import("./MapCanvas").then((mod) => mod.MapCanvas),
  { ssr: false, loading: MapPlaceholder },
);

type Props = {
  stations: ZoneStation[];
  sections: ZoneSection[];
  selectedStationId: string | null;
  onSelect: (stationId: string | null) => void;
};

export function NetworkMap(props: Props) {
  return <MapCanvas {...props} />;
}

function MapPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-surface-0">
      <span className="font-mono text-muted text-xs uppercase tracking-widest">
        Загрузка карты…
      </span>
    </div>
  );
}
