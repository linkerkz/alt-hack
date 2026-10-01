"use client";

import { divIcon } from "leaflet";
import { memo, useMemo } from "react";
import { Marker, useMap } from "react-leaflet";
import { TRAIN_KIND_LABEL } from "../status";
import type { MovingTrain, Station, TrainKind } from "../types";

type Props = {
  train: MovingTrain;
  from: Station;
  to: Station;
  // Доля пройденного участка, 0…1.
  progress: number;
};

// Иконка зависит только от вида поезда и направления — DOM маркера живёт
// между тиками, Leaflet лишь сдвигает его.
export const TrainMarker = memo(function TrainMarker({
  train,
  from,
  to,
  progress,
}: Props) {
  const map = useMap();
  // Точки участка на нулевом зуме: линия участка прямая в проекции карты,
  // поэтому и поезд ведём по прямой в проекции, а не по широте/долготе.
  const [start, end] = useMemo(
    () => [
      map.project([from.lat, from.lon], 0),
      map.project([to.lat, to.lon], 0),
    ],
    [map, from, to],
  );
  const icon = useMemo(() => {
    const angle =
      (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
    return trainIcon(train.kind, angle);
  }, [train.kind, start, end]);

  const position = map.unproject(
    start.add(end.subtract(start).multiplyBy(progress)),
    0,
  );

  return (
    <Marker
      position={position}
      icon={icon}
      pane="trains"
      keyboard={false}
      title={`${TRAIN_KIND_LABEL[train.kind]} № ${train.number}`}
    />
  );
});

const KIND_FILL: Record<TrainKind, string> = {
  passenger: "bg-accent-700",
  freight: "bg-ink",
};

// Точка с шевроном по ходу движения и медленно «дышащим» ореолом.
// Классы Tailwind пишем целиком, чтобы сканер их нашёл.
function trainIcon(kind: TrainKind, angle: number) {
  return divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <span class="absolute flex size-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span class="absolute -inset-1 rounded-full bg-accent/40 motion-safe:animate-breathe"></span>
        <span class="relative flex size-3 items-center justify-center rounded-full border border-paper shadow-sm ${KIND_FILL[kind]}">
          <svg viewBox="0 0 8 8" class="size-2 text-paper" style="transform: rotate(${angle.toFixed(0)}deg)" fill="currentColor" aria-hidden="true"><path d="M2 1l4 3-4 3z"/></svg>
        </span>
      </span>`,
  });
}
