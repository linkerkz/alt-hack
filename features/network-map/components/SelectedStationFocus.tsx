"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { Station } from "../types";

// Справа карту перекрывает карточка станции — сдвигаем центр влево на половину её ширины.
const PREVIEW_OFFSET_PX = 200;

// Карта уже приближена к зоне, поэтому только сдвигаем её к станции, не меняя зум.
export function SelectedStationFocus({ station }: { station: Station | null }) {
  const map = useMap();

  useEffect(() => {
    if (station == null) return;

    const zoom = map.getZoom();
    const point = map
      .project([station.lat, station.lon], zoom)
      .add([PREVIEW_OFFSET_PX, 0]);
    map.panTo(map.unproject(point, zoom), { duration: 0.8 });
  }, [map, station]);

  return null;
}
