import { simClock } from "@/lib/clock";
import { createSupabaseClient } from "@/lib/supabase";
import type { Incident, IncidentKind } from "./types";

// Инциденты из базы: их ведут пульты станций. Открытый — пока объект
// не вернули в эксплуатацию.

const KIND: Record<IncidentRow["kind"], IncidentKind> = {
  switch_fault: "breakdown",
  train_delay: "delay",
  track_closure: "track-closure",
};

export async function liveIncidents(stationIds: string[]) {
  const supabase = await createSupabaseClient();
  // Время обнаружения — первое событие хронологии: оно во времени симуляции.
  const { data } = await supabase
    .from("incidents")
    .select("code, station_id, kind, title, timeline_events(at)")
    .in("station_id", stationIds)
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

function toIncident(row: IncidentRow): Incident {
  const [firstEvent] = row.timeline_events;
  return {
    id: row.code,
    kind: KIND[row.kind],
    title: `${row.code} · ${row.title}`,
    startedAt: firstEvent == null ? "—" : simClock(firstEvent.at),
  };
}

// Строка из базы без сгенерированных типов — форму задаём руками.
type IncidentRow = {
  code: string;
  station_id: string;
  kind: "switch_fault" | "train_delay" | "track_closure";
  title: string;
  timeline_events: { at: string }[];
};
