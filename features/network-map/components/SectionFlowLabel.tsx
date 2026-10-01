"use client";

import { divIcon } from "leaflet";
import { type ReactNode, useMemo } from "react";
import { Marker, useMap } from "react-leaflet";
import type { SectionFlow, Station } from "../types";

type Props = {
  from: Station;
  to: Station;
  flow: SectionFlow;
  // Подсказка при наведении на плашку.
  children?: ReactNode;
};

// Метка посередине участка: стрелки вдоль линии и число поездов в каждую сторону.
export function SectionFlowLabel({ from, to, flow, children }: Props) {
  const map = useMap();
  const icon = useMemo(() => {
    // Меркатор сохраняет углы, поэтому направление считаем на нулевом зуме.
    const start = map.project([from.lat, from.lon], 0);
    const end = map.project([to.lat, to.lon], 0);
    const angle =
      (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
    return labelIcon(flow, angle);
  }, [map, from, to, flow]);

  if (flow.forward === 0 && flow.backward === 0) return null;

  return (
    <Marker
      position={[(from.lat + to.lat) / 2, (from.lon + to.lon) / 2]}
      icon={icon}
    >
      {children}
    </Marker>
  );
}

function labelIcon(flow: SectionFlow, angle: number) {
  const parts = [
    arrowCount(flow.forward, angle),
    arrowCount(flow.backward, angle + 180),
  ].filter((part) => part !== "");

  return divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <div class="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-help items-center gap-2.5 whitespace-nowrap rounded-full border border-line bg-paper/95 px-2 py-0.5 text-[12px] text-ink shadow-sm">
        ${parts.join("")}
      </div>`,
  });
}

// SVG-стрелка смотрит вправо, поворачиваем её вдоль участка.
function arrowCount(count: number, angle: number) {
  if (count === 0) return "";
  return `<span class="flex items-center gap-1"><svg viewBox="0 0 12 12" class="size-3 text-accent-700" style="transform: rotate(${angle.toFixed(0)}deg)" fill="currentColor" aria-hidden="true"><path d="M1 5h6.5V2L12 6l-4.5 4V7H1z"/></svg>${count}</span>`;
}
