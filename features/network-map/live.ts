import { simClock } from "@/lib/clock";
import { createSupabaseClient } from "@/lib/supabase";
import type { Incident, IncidentKind } from "./types";

// Открытые сбои станций из базы: живой сценарий ведёт пульт, остальные —
// из сида. Открытый — пока объект не вернули в эксплуатацию.

const KIND: Record<IncidentRow["kind"], IncidentKind> = {
  switch_fault: "breakdown",
  breakdown: "breakdown",
  train_delay: "delay",
  track_closure: "track-closure",
  route_conflict: "route-conflict",
  resource_shortage: "resource-shortage",
};

export async function openIncidents() {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("incidents")
    .select("code, station_id, kind, title, detected_at, timeline_events(at)")
    .not("status", "in", "(restored,closed)")
    .order("detected_at", { ascending: false })
    .order("at", { referencedTable: "timeline_events", ascending: true })
    .limit(1, { referencedTable: "timeline_events" })
    .overrideTypes<IncidentRow[], { merge: false }>();

  const byStation = new Map<string, Incident[]>();
  for (const row of data ?? []) {
    const incidents = byStation.get(row.station_id) ?? [];
    byStation.set(row.station_id, [...incidents, toIncident(row)]);
  }
  return byStation;
}

// Время обнаружения — первое событие хронологии: оно во времени симуляции.
// У сбоев без хронологии — момент обнаружения.
function toIncident(row: IncidentRow): Incident {
  const [firstEvent] = row.timeline_events;
  return {
    id: row.code,
    kind: KIND[row.kind],
    title: row.title,
    startedAt: simClock(firstEvent?.at ?? row.detected_at),
  };
}

// Строка из базы без сгенерированных типов — форму задаём руками.
type IncidentRow = {
  code: string;
  station_id: string;
  kind:
    | "switch_fault"
    | "breakdown"
    | "train_delay"
    | "track_closure"
    | "route_conflict"
    | "resource_shortage";
  title: string;
  detected_at: string;
  timeline_events: { at: string }[];
};
