"use client";

import { divIcon } from "leaflet";
import { Marker } from "react-leaflet";
import { STATUS_DOT_CLASS, toStatus } from "../status";
import type { Station } from "../types";

type Props = {
  station: Station;
  isSelected: boolean;
  onSelect: (stationId: string) => void;
};

export function StationMarker({ station, isSelected, onSelect }: Props) {
  return (
    <Marker
      position={[station.lat, station.lon]}
      icon={stationIcon(station, isSelected)}
      zIndexOffset={isSelected ? 1000 : 0}
      eventHandlers={{ click: () => onSelect(station.id) }}
      title={station.name}
    />
  );
}

// Leaflet рисует маркер вне React, поэтому иконка — HTML-строка.
// Классы Tailwind пишем целиком, чтобы сканер их нашёл.
function stationIcon(station: Station, isSelected: boolean) {
  const status = toStatus(station.efficiencyIndex);
  const dot = STATUS_DOT_CLASS[status];
  const size = station.kind === "sorting" ? "size-3.5" : "size-2.5";
  const ring = isSelected
    ? "ring-2 ring-white ring-offset-2 ring-offset-surface-0"
    : "ring-2 ring-surface-0";
  const pulse =
    status === "normal"
      ? ""
      : `<span class="absolute inset-0 animate-ping rounded-full ${dot} opacity-60"></span>`;
  const index =
    status === "normal"
      ? ""
      : `<span class="font-mono font-semibold ${status === "critical" ? "text-rose-400" : "text-amber-300"}">${station.efficiencyIndex}</span>`;
  const label = isSelected
    ? "border-white/40 bg-surface-2 text-white"
    : "border-line bg-surface-1/85 text-zinc-300";

  return divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <div class="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center">
        <span class="relative flex ${size} items-center justify-center">
          ${pulse}
          <span class="relative ${size} rounded-full ${dot} ${ring}"></span>
        </span>
        <span class="absolute left-full ml-2 flex items-center gap-1.5 whitespace-nowrap rounded border px-1.5 py-0.5 text-[11px] leading-none shadow-lg backdrop-blur-sm group-hover:border-white/40 group-hover:text-white ${label}">
          ${station.name}${index}
        </span>
      </div>`,
  });
}
