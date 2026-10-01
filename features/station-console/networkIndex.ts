import { createSupabaseClient } from "@/lib/supabase";
import { activeOption } from "./activePlan";
import { scoreActive } from "./efficiency";
import { stationLayout } from "./layout";
import { lastIncidents } from "./live";
import { stationPlan } from "./operations";
import { stepOf } from "./scenario";

// Индекс станций, у которых в базе есть план путей, — тот же, что на пульте.
// Карта сети показывает его вместо записанного в stations: у остальных
// станций плана нет, и для них остаётся число из базы.
export async function getLiveIndexes() {
  const stationIds = await plannedStations();
  const incidents = await lastIncidents(stationIds);
  const entries = await Promise.all(
    stationIds.map(async (stationId) => {
      const [plan, layout] = await Promise.all([
        stationPlan(stationId),
        stationLayout(stationId),
      ]);
      const incident = incidents.get(stationId) ?? null;
      const step = stepOf({ incident, workOrder: null });
      const option = activeOption(step, incident?.option ?? null);
      return [stationId, scoreActive({ plan, layout }, option).index] as const;
    }),
  );
  return new Map(entries);
}

async function plannedStations() {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("track_plan")
    .select("station_id")
    .overrideTypes<{ station_id: string }[], { merge: false }>();
  return [...new Set((data ?? []).map((row) => row.station_id))];
}
