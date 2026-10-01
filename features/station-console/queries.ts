import { toClock } from "@/lib/clock";
import { stationEfficiency } from "./efficiency";
import { incidentCard } from "./incident";
import { optionComparison } from "./options";
import { pagerCard } from "./pagerCard";
import { trackPlan } from "./plan";
import { stationSchema } from "./schema";
import type { ConsoleState, Live, Neighbors } from "./types";

export { getApprovalRequests } from "./approval";
export { getLive } from "./live";
export { getLiveIndexes } from "./networkIndex";

// Пульт станции: ход инцидента из базы (live) и вид экрана из URL (state).
export async function getStationConsole(
  stationId: string,
  state: ConsoleState,
  neighbors: Neighbors,
  live: Live,
) {
  const clock = toClock(live.now);
  return {
    stationId,
    clock,
    efficiency: stationEfficiency(state, live),
    schema: stationSchema(state, neighbors, live),
    plan: trackPlan(state, live),
    incident: incidentCard(state, neighbors, live),
    comparison: optionComparison(state, live, neighbors),
    pager: pagerCard(live, clock),
    workOrder: live.workOrder,
  };
}

export type StationConsoleData = Awaited<ReturnType<typeof getStationConsole>>;
