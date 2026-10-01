"use client";

import { divIcon } from "leaflet";
import { memo, useMemo } from "react";
import { Marker } from "react-leaflet";
import {
  TONE_BG_CLASS,
  TONE_GLYPH,
  TONE_TEXT_CLASS,
} from "@/components/ui/tone";
import { FLOW_LABEL, FLOW_ORDER, flowCounterClass, toStatus } from "../status";
import type { ZoneStation } from "../types";

type Props = {
  station: ZoneStation;
  isSelected: boolean;
  // Станция ждёт ответа ДНЦ на запрос на согласование.
  hasRequest: boolean;
  onSelect: (stationId: string) => void;
};

// Новая иконка заставляет Leaflet пересоздать DOM маркера, поэтому
// и иконку, и обработчики держим стабильными между рендерами. Автообновление
// присылает новые объекты станций — иконку пересоздаём, только если
// изменилась её разметка.
export const StationMarker = memo(function StationMarker({
  station,
  isSelected,
  hasRequest,
  onSelect,
}: Props) {
  const html = station.isInScope
    ? stationHtml(station, isSelected, hasRequest)
    : neighborHtml(station);
  const icon = useMemo(
    () => divIcon({ className: "", iconSize: [0, 0], html }),
    [html],
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
function stationHtml(
  station: ZoneStation,
  isSelected: boolean,
  hasRequest: boolean,
) {
  const status = toStatus(station.efficiencyIndex);
  const chip =
    isSelected || hasRequest
      ? "border-accent shadow-md"
      : "border-line shadow-sm group-hover:border-accent";

  return `
      <div class="group absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center">
        ${stationDot(station, isSelected)}
        <span class="absolute left-full ml-2.5 flex flex-col gap-1 whitespace-nowrap rounded border bg-paper px-2 py-1.5 leading-none text-ink ${chip}">
          <span class="flex items-baseline justify-between gap-3">
            <span class="font-heading font-semibold text-[16px]">${station.name}</span>
            <span class="font-heading text-[17px] ${TONE_TEXT_CLASS[status]}"><span class="text-[10px]">${TONE_GLYPH[status]}</span> ${station.efficiencyIndex}</span>
          </span>
          <span class="flex gap-2.5 text-[12px]">${flowCounters(station)}</span>
          ${hasRequest ? REQUEST_LINE : ""}
        </span>
      </div>`;
}

const REQUEST_LINE = `<span class="text-[11px] text-accent-700">${TONE_GLYPH.warning} Запрос на согласование</span>`;

// Точка станции: кольцо на бумаге, внутри — цвет состояния.
// Выбранная — с акцентным ореолом, как «наша станция» в дизайне.
function stationDot(station: ZoneStation, isSelected: boolean) {
  const status = toStatus(station.efficiencyIndex);
  const fill = TONE_BG_CLASS[status];
  const size = station.kind === "sorting" ? "size-4" : "size-3.5";
  const ring = isSelected
    ? "border-2 border-accent ring-[6px] ring-accent/20"
    : "border-2 border-paper ring-1 ring-ink/60";
  const pulse =
    status === "critical"
      ? `<span class="absolute inset-0 animate-ping rounded-full ${fill} opacity-50"></span>`
      : "";

  return `
    <span class="relative flex ${size} items-center justify-center">
      ${pulse}
      <span class="relative ${size} rounded-full ${fill} ${ring}"></span>
    </span>`;
}

function flowCounters(station: ZoneStation) {
  return FLOW_ORDER.map((key) => {
    const value = station.flow[key];
    const color = flowCounterClass(key, value);
    return `<span class="${color}" title="${FLOW_LABEL[key].label}: ${FLOW_LABEL[key].hint}">${FLOW_LABEL[key].icon}${value}</span>`;
  }).join("");
}

// Соседняя станция вне зоны: серая точка и подпись с ореолом бумаги, как на схеме сети.
function neighborHtml(station: ZoneStation) {
  return `
      <div class="absolute flex -translate-x-1/2 -translate-y-1/2 items-center">
        <span class="size-2 rounded-full bg-neutral-500"></span>
        <span class="absolute left-full ml-1.5 whitespace-nowrap rounded-sm bg-paper/80 px-1 text-[11px] text-neutral-600 italic">
          ${station.name}
        </span>
      </div>`;
}
