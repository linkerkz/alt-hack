import type { IncidentDelay } from "@/lib/simulation/trains";
import { createSupabaseClient } from "@/lib/supabase";
import { INCIDENT_DELAY_MINUTES } from "./status";

// Сбои, которые задерживают поезда в симуляции: открытые и закрытые за
// последние сутки. Закрытый держит поезда только до закрытия, но
// опоздание, набранное до того, ещё идёт с поездом по маршруту.
const CLOSED_WITHIN_MS = 24 * 60 * 60_000;

export async function incidentDelays(): Promise<IncidentDelay[]> {
  const supabase = await createSupabaseClient();
  const closedSince = new Date(Date.now() - CLOSED_WITHIN_MS).toISOString();
  const { data } = await supabase
    .from("incidents")
    .select("station_id, severity, detected_at, closed_at")
    .or(`closed_at.is.null,closed_at.gt.${closedSince}`)
    .overrideTypes<DelayRow[], { merge: false }>();

  return (data ?? []).map((row) => ({
    stationId: row.station_id,
    minutes: INCIDENT_DELAY_MINUTES[row.severity ?? "unrated"],
    from: epochMinutes(row.detected_at),
    until: row.closed_at == null ? null : epochMinutes(row.closed_at),
  }));
}

function epochMinutes(at: string) {
  return Math.floor(new Date(at).getTime() / 60_000);
}

// Строка из базы без сгенерированных типов — форму задаём руками.
// severity null — сбой ещё не оценён.
type DelayRow = {
  station_id: string;
  severity: "low" | "medium" | "high" | null;
  detected_at: string;
  closed_at: string | null;
};
