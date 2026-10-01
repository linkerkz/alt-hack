"use client";

import { divIcon } from "leaflet";
import { memo, useMemo } from "react";
import { Marker } from "react-leaflet";
import { STATUS_DOT_CLASS, toStatus } from "@/lib/status";
import { FLOW_LABEL, FLOW_ORDER, flowCounterClass } from "../status";
import type { ZoneStation } from "../types";

type Props = {
  station: ZoneStation;
  isSelected: boolean;
  onSelect: (stationId: string) => void;
};

// Новая иконка заставляет Leaflet пересоздать DOM маркера, поэтому
// и иконку, и обработчики держим стабильными между рендерами.
export const StationMarker = memo(function StationMarker({
  station,
  isSelected,
  onSelect,
}: Props) {
  const icon = useMemo(
    () =>
      station.isInScope
        ? stationIcon(station, isSelected)
        : neighborIcon(station),
    [station, isSelected],
  );
  const eventHandlers = useMemo(
    () => ({ click: () => onSelect(station.id) }),
    [onSelect, station.id],
  );

  if (!station.isInScope) {
    return (
      <Marker
        position={[station.lat, station.lon]}
        icon={icon}
        interactive={false}
      />
    );
  }

  return (
    <Marker
      position={[station.lat, station.lon]}
      icon={icon}
      zIndexOffset={isSelected ? 1000 : 100}
      eventHandlers={eventHandlers}
      title={station.name}
    />
  );
});

// Leaflet рисует маркер вне React, поэтому иконка — HTML-строка.
// Классы Tailwind пишем целиком, чтобы сканер их нашёл.
function stationIcon(station: ZoneStation, isSelected: boolean) {
  const status = toStatus(station.efficiencyIndex);
  const dot = STATUS_DOT_CLASS[status];
  const size = station.kind === "sorting" ? "size-4" : "size-3";
  const ring = isSelected
    ? "ring-2 ring-ink ring-offset-2 ring-offset-surface-0"
    : "ring-2 ring-surface-0";
  const pulse =
    status === "critical"
      ? `<span class="absolute inset-0 animate-ping rounded-full ${dot} opacity-60"></span>`
      : "";
  const indexColor = {
    normal: "text-status-normal",
    warning: "text-status-warning",
    critical: "text-status-critical",
  }[status];
  const chip = isSelected
    ? "border-accent/70 bg-surface-2 text-ink shadow-md"
    : "border-line bg-surface-1 text-ink shadow-sm";

  return divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <div class="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center">
        <span class="relative flex ${size} items-center justify-center">
          ${pulse}
          <span class="relative ${size} rounded-full ${dot} ${ring}"></span>
        </span>
        <span class="absolute left-full ml-2.5 flex flex-col gap-1 whitespace-nowrap rounded-md border px-2 py-1.5 leading-none group-hover:border-accent/40 ${chip}">
          <span class="flex items-center justify-between gap-3 font-medium text-[13px]">
            ${station.name}
            <span class="font-heading font-semibold ${indexColor}">${station.efficiencyIndex}</span>
          </span>
          <span class="flex gap-2.5 text-[12px] tabular-nums">${flowCounters(station)}</span>
        </span>
      </div>`,
  });
}

function flowCounters(station: ZoneStation) {
  return FLOW_ORDER.map((key) => {
    const value = station.flow[key];
    const color = flowCounterClass(key, value);
    return `<span class="${color}" title="${FLOW_LABEL[key].label}">${FLOW_LABEL[key].icon}${value}</span>`;
  }).join("");
}

function neighborIcon(station: ZoneStation) {
  return divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <div class="absolute flex -translate-x-1/2 -translate-y-1/2 items-center opacity-60">
        <span class="size-2 rounded-full bg-muted ring-2 ring-surface-0"></span>
        <span class="absolute left-full ml-1.5 whitespace-nowrap rounded bg-surface-0/80 px-1 text-[11px] text-muted">
          ${station.name}
        </span>
      </div>`,
  });
}
