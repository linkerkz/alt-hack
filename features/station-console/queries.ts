import { dspObjects } from "./dspObjects";
import { stationEfficiency } from "./efficiency";
import { incidentCard } from "./incident";
import { STEP_MINUTE } from "./mock";
import { optionComparison } from "./options";
import { pagerCard } from "./pagerCard";
import { trackPlan } from "./plan";
import { stationSchema } from "./schema";
import { clockAt } from "./status";
import type { ConsoleState, Live, Neighbors } from "./types";

export { getApprovalRequests } from "./approval";
export { getLive } from "./live";

// Пульт станции: ход инцидента из базы (live) и вид экрана из URL (state).
export async function getStationConsole(
  stationId: string,
  state: ConsoleState,
  neighbors: Neighbors,
  live: Live,
) {
  const clock = clockAt(STEP_MINUTE[state.step]);
  return {
    stationId,
    clock,
    efficiency: stationEfficiency(state, live),
    schema: stationSchema(state, neighbors, live),
    plan: trackPlan(state, live),
    incident: incidentCard(state, neighbors, live),
    comparison: optionComparison(state, live, neighbors),
    objects: dspObjects(state),
    pager: pagerCard(live, clock),
    workOrder: live.workOrder,
  };
}

export type StationConsoleData = Awaited<ReturnType<typeof getStationConsole>>;
