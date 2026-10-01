"use client";

import { divIcon } from "leaflet";
import { memo, useMemo } from "react";
import { Marker, useMap } from "react-leaflet";
import { projectSection } from "../projection";
import { TRAIN_KIND_FILL, TRAIN_KIND_LABEL } from "../status";
import type { MovingTrain, Station, TrainKind } from "../types";

type Props = {
  train: MovingTrain;
  from: Station;
  to: Station;
  // Доля пройденного участка, 0…1.
  progress: number;
};

// Иконка зависит только от вида поезда и направления. Автообновление
// присылает новые объекты станций, поэтому иконку держим по числам, а не по
// объектам: DOM маркера живёт между тиками и обновлениями, Leaflet лишь
// сдвигает его, и «дыхание» ореола не сбивается.
export const TrainMarker = memo(function TrainMarker({
  train,
  from,
  to,
  progress,
}: Props) {
  const map = useMap();
  // Поезд ведём по прямой в проекции карты, как и линию участка.
  const { start, end, angle } = projectSection(map, from, to);
  const heading = Math.round(angle);
  const icon = useMemo(
    () => trainIcon(train.kind, heading),
    [train.kind, heading],
  );

  const position = map.unproject(
    start.add(end.subtract(start).multiplyBy(progress)),
    0,
  );

  return (
    <Marker
      position={position}
      icon={icon}
      keyboard={false}
      title={`${TRAIN_KIND_LABEL[train.kind]} № ${train.number}`}
    />
  );
});

// Точка с шевроном по ходу движения и медленно «дышащим» ореолом.
// Классы Tailwind пишем целиком, чтобы сканер их нашёл.
function trainIcon(kind: TrainKind, heading: number) {
  return divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <span class="absolute flex size-3 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <span class="absolute -inset-1 rounded-full bg-accent/40 motion-safe:animate-breathe"></span>
        <span class="relative flex size-3 items-center justify-center rounded-full border border-paper shadow-sm ${TRAIN_KIND_FILL[kind]}">
          <svg viewBox="0 0 8 8" class="size-2 text-paper" style="transform: rotate(${heading}deg)" fill="currentColor" aria-hidden="true"><path d="M2 1l4 3-4 3z"/></svg>
        </span>
      </span>`,
  });
}
