"use client";

import type { PathOptions } from "leaflet";
import { memo } from "react";
import { Polyline } from "react-leaflet";
import { STATUS_COLOR } from "../status";
import type { Station, Status, ZoneSection } from "../types";
import { SectionFlowLabel } from "./SectionFlowLabel";
import { SectionTooltip } from "./SectionTooltip";

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
        interactive={false}
      />
      <SectionFlowLabel from={from} to={to} flow={section.flow}>
        <SectionTooltip section={section} from={from} to={to} />
      </SectionFlowLabel>
    </>
  );
});

function pathOptions(status: Status, isHighlighted: boolean): PathOptions {
  const base = PATH_OPTIONS[status];
  if (!isHighlighted) return base;

  const color = status === "normal" ? HIGHLIGHT_COLOR : base.color;
  return { ...base, color, opacity: 1, weight: (base.weight ?? 2) + 2 };
}
