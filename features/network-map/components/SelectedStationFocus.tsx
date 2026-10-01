"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Station } from "../types";

const FOCUS_ZOOM = 8;
// Справа карту перекрывает превью станции — сдвигаем центр влево на половину его ширины.
const PREVIEW_OFFSET_PX = 190;

export function SelectedStationFocus({ station }: { station: Station | null }) {
  const map = useMap();

  useEffect(() => {
    if (station == null) return;

    const point = map
      .project([station.lat, station.lon], FOCUS_ZOOM)
      .add([PREVIEW_OFFSET_PX, 0]);
    map.flyTo(map.unproject(point, FOCUS_ZOOM), FOCUS_ZOOM, { duration: 1 });
  }, [map, station]);

  return null;
}
