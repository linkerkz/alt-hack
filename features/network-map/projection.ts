import type { Map as LeafletMap } from "leaflet";
import type { Station } from "./types";

// Участок на нулевом зуме карты: линия участка прямая в проекции, а Меркатор
// сохраняет углы, поэтому по этим точкам считаем и направление вдоль
// участка (градусы, по часовой от востока), и положение поезда на нём.
export function projectSection(map: LeafletMap, from: Station, to: Station) {
  const start = map.project([from.lat, from.lon], 0);
  const end = map.project([to.lat, to.lon], 0);
  const angle = (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI;
  return { start, end, angle };
}
