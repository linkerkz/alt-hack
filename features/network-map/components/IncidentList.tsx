import { Kicker } from "@/components/ui/Kicker";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { INCIDENT_KIND_LABEL } from "../status";
import type { Incident } from "../types";

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <p className="rounded border border-normal px-3 py-2 text-[13px] text-normal">
        <StatusGlyph tone="normal" /> Активных сбоев нет
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <Kicker>Активные сбои · {incidents.length}</Kicker>
      <ul>
        {incidents.map((incident) => (
          <li
            key={incident.id}
            className="border-line border-t py-2 first:border-t-0"
          >
            <div className="flex justify-between text-[11px]">
              <span className="text-critical uppercase tracking-[0.08em]">
                <StatusGlyph tone="critical" />{" "}
                {INCIDENT_KIND_LABEL[incident.kind]}
              </span>
              <span className="text-muted">{incident.startedAt}</span>
            </div>
            <p className="mt-0.5 font-heading font-semibold text-[16px] leading-snug">
              {incident.title}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
