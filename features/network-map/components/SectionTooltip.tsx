"use client";

import { Tooltip } from "react-leaflet";
import { STATUS_LABEL } from "../status";
import type { Station, ZoneSection } from "../types";

type Props = {
  section: ZoneSection;
  from: Station;
  to: Station;
};

// Подсказка над плашкой с числами поездов участка.
export function SectionTooltip({ section, from, to }: Props) {
  return (
    <Tooltip className="map-tooltip" direction="top" offset={[0, -12]}>
      <div className="font-medium">
        {from.name} → {to.name}: {section.flow.forward} · {to.name} →{" "}
        {from.name}: {section.flow.backward}
      </div>
      <div className="text-muted">
        {STATUS_LABEL[section.status]}
        {section.note == null ? null : ` · ${section.note}`}
      </div>
    </Tooltip>
  );
}
