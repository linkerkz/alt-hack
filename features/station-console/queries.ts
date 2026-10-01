import { decisionChain } from "./chain";
import { stationEfficiency } from "./efficiency";
import { incidentCard } from "./incident";
import { STEP_MINUTE, STEP_NAME } from "./mock";
import { optionComparison } from "./options";
import { trackPlan } from "./plan";
import { stationSchema } from "./schema";
import { clockAt } from "./status";
import type { ConsoleState, Neighbors } from "./types";

// Пульт станции на шаге демо-сценария. Сигнатура останется, когда данные
// придут из симулятора.
export async function getStationConsole(
  state: ConsoleState,
  neighbors: Neighbors,
) {
  return {
    clock: clockAt(STEP_MINUTE[state.step]),
    stepName: STEP_NAME[state.step],
    efficiency: stationEfficiency(state.step),
    schema: stationSchema(state, neighbors),
    plan: trackPlan(state),
    incident: incidentCard(state, neighbors),
    comparison: optionComparison(state, neighbors),
    chain: decisionChain(state, neighbors),
  };
}

export type StationConsoleData = Awaited<ReturnType<typeof getStationConsole>>;
