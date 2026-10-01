import { stationMinutes, toClock } from "@/lib/clock";
import { stationLayout } from "./layout";
import { SCENARIO_TRAINS, STEP } from "./mock";
import { simulatedPlan } from "./simulatedPlan";
import type { Live, LiveIncident, PlannedTrain } from "./types";

// Откуда пульт берёт план путей и время станции. План — всегда из
// симуляции по реальным часам. Пока идёт сценарий сбоя, в него встают
// поезда сценария: их время отсчитывается от обнаружения сбоя (t0).
export async function planSourceOf(
  stationId: string,
  step: number,
  incident: LiveIncident | null,
): Promise<Pick<Live, "plan" | "layout" | "now" | "anchor">> {
  const layout = await stationLayout(stationId);
  const anchor =
    step === STEP.normal || incident == null
      ? null
      : stationMinutes(new Date(incident.detectedAt));
  const reserved = anchor == null ? [] : scenarioPlan(anchor);
  const { plan, now } = await simulatedPlan(stationId, layout, reserved);
  return { plan, layout, now, anchor };
}

function scenarioPlan(anchor: number): PlannedTrain[] {
  return SCENARIO_TRAINS.map((train) => ({
    ...train,
    arrival: toClock(anchor + train.arrival),
    departure: toClock(anchor + train.departure),
  }));
}
