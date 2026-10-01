import { decisionChain } from "./chain";
import { dspPanel } from "./dsp";
import { stationEfficiency } from "./efficiency";
import { incidentCard } from "./incident";
import { STEP_MINUTE, STEP_NAME } from "./mock";
import { optionComparison } from "./options";
import { trackPlan } from "./plan";
import { commandLabel, nextCommand } from "./scenario";
import { stationSchema } from "./schema";
import { clockAt } from "./status";
import type { ConsoleState, Live, Neighbors } from "./types";

export { getLive } from "./live";

// Пульт станции: ход инцидента из базы (live) и вид экрана из URL (state).
export async function getStationConsole(
  stationId: string,
  state: ConsoleState,
  neighbors: Neighbors,
  live: Live,
) {
  return {
    stationId,
    clock: clockAt(STEP_MINUTE[state.step]),
    stepName: STEP_NAME[state.step],
    efficiency: stationEfficiency(state.step),
    schema: stationSchema(state, neighbors),
    plan: trackPlan(state),
    incident: incidentCard(state, neighbors, live),
    comparison: optionComparison(state, neighbors),
    chain: decisionChain(state, neighbors),
    dsp: dspPanel(state, neighbors, live.workOrder),
    workOrder: live.workOrder,
    demo: demoNext(live),
  };
}

// Что сделает «Далее» на демо-пульте; null — сценарий пройден.
function demoNext(live: Live) {
  const command = nextCommand(live);
  return command == null ? null : commandLabel(command);
}

export type StationConsoleData = Awaited<ReturnType<typeof getStationConsole>>;
