import { INCIDENT_KIND_LABEL } from "../status";
import type { Incident } from "../types";

export function IncidentList({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) {
    return (
      <p className="rounded border border-status-normal/30 px-3 py-2 text-status-normal text-xs">
        Активных сбоев нет
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-[11px] text-muted uppercase tracking-widest">
        Активные сбои · {incidents.length}
      </h3>
      <ul className="space-y-1.5">
        {incidents.map((incident) => (
          <li
            key={incident.id}
            className="rounded border-status-critical border-l-2 bg-status-critical/5 px-3 py-2"
          >
            <div className="flex justify-between text-[11px]">
              <span className="font-medium text-status-critical">
                {INCIDENT_KIND_LABEL[incident.kind]}
              </span>
              <span className="text-muted tabular-nums">
                {incident.startedAt}
              </span>
            </div>
            <p className="mt-0.5 text-ink text-sm leading-snug">
              {incident.title}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
