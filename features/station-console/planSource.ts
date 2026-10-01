import { stationLayout } from "./layout";
import { STEP, scenarioMinute } from "./mock";
import { stationPlan } from "./operations";
import { simulatedPlan } from "./simulatedPlan";
import type { Live } from "./types";

// Откуда пульт берёт план путей и время станции. Пока сценария сбоя нет —
// живой план из симуляции по реальным часам; в сценарии — демо-план из
// базы во времени шага (14:05…14:32): на его поезда завязаны варианты.
export async function planSourceOf(
  stationId: string,
  step: number,
): Promise<Pick<Live, "plan" | "layout" | "now" | "simulated">> {
  const layout = await stationLayout(stationId);
  if (step === STEP.normal) {
    const { plan, now } = await simulatedPlan(stationId, layout);
    return { plan, layout, now, simulated: true };
  }
  const plan = await stationPlan(stationId);
  return { plan, layout, now: scenarioMinute(step), simulated: false };
}
