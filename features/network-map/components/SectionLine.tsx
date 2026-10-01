"use client";

import type { PathOptions } from "leaflet";
import { Polyline, Tooltip } from "react-leaflet";
import type { Status } from "@/lib/status";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/status";
import type { Section, Station } from "../types";

type Props = {
  section: Section;
  from: Station | undefined;
  to: Station | undefined;
};

const PATH_OPTIONS: Record<Status, PathOptions> = {
  normal: { color: "#64748b", weight: 2, opacity: 0.55 },
  warning: { color: STATUS_COLOR.warning, weight: 3, opacity: 0.85 },
  critical: {
    color: STATUS_COLOR.critical,
    weight: 4,
    opacity: 0.95,
    dashArray: "8 6",
  },
};

export function SectionLine({ section, from, to }: Props) {
  if (from == null || to == null) return null;

  return (
    <Polyline
      positions={[
        [from.lat, from.lon],
        [to.lat, to.lon],
      ]}
      pathOptions={PATH_OPTIONS[section.status]}
    >
      <Tooltip sticky className="map-tooltip">
        <div className="font-medium">
          {from.name} — {to.name}
        </div>
        <div className="text-muted">
          {STATUS_LABEL[section.status]}
          {section.note == null ? null : ` · ${section.note}`}
        </div>
      </Tooltip>
    </Polyline>
  );
}
