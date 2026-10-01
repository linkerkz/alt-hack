import { stationEfficiency } from "./efficiency";
import { incidentCard } from "./incident";
import { getLive } from "./live";
import { STEP_MINUTE } from "./mock";
import { stationPlan } from "./operations";
import { optionComparison } from "./options";
import { pagerCard } from "./pagerCard";
import { trackPlan } from "./plan";
import { stationSchema } from "./schema";
import { parseConsoleState } from "./state";
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
    pager: pagerCard(live, clock),
    workOrder: live.workOrder,
  };
}

// Индекс станции тем же расчётом, что на пульте; null — плана путей у
// станции нет, и пульт её не ведёт. План читаем первым: у большинства
// станций сети его нет, и остальное читать незачем.
export async function getLiveIndex(stationId: string) {
  const plan = await stationPlan(stationId);
  if (plan.length === 0) return null;
  const live = await getLive(stationId);
  return stationEfficiency(parseConsoleState({}, live), live).index;
}

export type StationConsoleData = Awaited<ReturnType<typeof getStationConsole>>;
