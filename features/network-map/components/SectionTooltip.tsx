"use client";

import { Tooltip } from "react-leaflet";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import { STATUS_LABEL } from "../status";
import type { Station, ZoneSection } from "../types";

type Props = {
  section: ZoneSection;
  from: Station;
  to: Station;
};

// Подсказка над плашкой с числами поездов участка.
export function SectionTooltip({ section, from, to }: Props) {
  const { status } = section;

  return (
    <Tooltip className="map-tooltip" direction="top" offset={[0, -12]}>
      <div className="font-heading font-semibold text-[15px]">
        {from.name} → {to.name}: {section.flow.forward} · {to.name} →{" "}
        {from.name}: {section.flow.backward}
      </div>
      <div className="text-muted">Все поезда по участку, включая проездом</div>
      <div className={TONE_TEXT_CLASS[status]}>
        <StatusGlyph tone={status} /> {STATUS_LABEL[status]}
        {section.note == null ? null : (
          <span className="text-muted"> · {section.note}</span>
        )}
      </div>
    </Tooltip>
  );
}
