"use client";

import type { PathOptions } from "leaflet";
import { memo } from "react";
import { Polyline, Tooltip } from "react-leaflet";
import { STATUS_COLOR, STATUS_LABEL } from "../status";
import type { Station, Status, ZoneSection } from "../types";
import { SectionFlowLabel } from "./SectionFlowLabel";

type Props = {
  section: ZoneSection;
  from: Station | undefined;
  to: Station | undefined;
  isHighlighted: boolean;
};

const PATH_OPTIONS: Record<Status, PathOptions> = {
  normal: { color: "#64748b", weight: 2, opacity: 0.6 },
  warning: { color: STATUS_COLOR.warning, weight: 3, opacity: 0.85 },
  critical: {
    color: STATUS_COLOR.critical,
    weight: 4,
    opacity: 0.95,
    dashArray: "8 6",
  },
};

// Участки выбранной станции: нормальные — голубым, проблемные — своим цветом, но толще.
const HIGHLIGHT_COLOR = "#38bdf8";

export const SectionLine = memo(function SectionLine({
  section,
  from,
  to,
  isHighlighted,
}: Props) {
  if (from == null || to == null) return null;

  return (
    <>
      <Polyline
        positions={[
          [from.lat, from.lon],
          [to.lat, to.lon],
        ]}
        pathOptions={pathOptions(section.status, isHighlighted)}
      >
        <Tooltip sticky className="map-tooltip">
          <div className="font-medium">
            {from.name} → {to.name}: {section.flow.forward} · {to.name} →{" "}
            {from.name}: {section.flow.backward}
          </div>
          <div className="text-muted">
            {STATUS_LABEL[section.status]}
            {section.note == null ? null : ` · ${section.note}`}
          </div>
        </Tooltip>
      </Polyline>
      <SectionFlowLabel from={from} to={to} flow={section.flow} />
    </>
  );
});

function pathOptions(status: Status, isHighlighted: boolean): PathOptions {
  const base = PATH_OPTIONS[status];
  if (!isHighlighted) return base;

  const color = status === "normal" ? HIGHLIGHT_COLOR : base.color;
  return { ...base, color, opacity: 1, weight: (base.weight ?? 2) + 2 };
}
