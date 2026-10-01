import { stationMinutes } from "@/lib/clock";
import { currentMinute } from "@/lib/simulation/network";
import { stationLayout } from "./layout";
import { SCENARIO_TRAINS, STEP } from "./mock";
import { simulatedPlan } from "./simulatedPlan";
import type { Live, LiveIncident, PlannedTrain } from "./types";

// Откуда пульт берёт план путей и время станции. План — всегда из
// симуляции по реальным часам. Пока идёт сценарий сбоя, в него встают
// поезда сценария: их время отсчитывается от обнаружения сбоя (t0).
// Все минуты — от полуночи текущих суток: t0 вчерашнего вечера меньше нуля.
export async function planSourceOf(
  stationId: string,
  step: number,
  incident: LiveIncident | null,
): Promise<Pick<Live, "plan" | "layout" | "now" | "anchor">> {
  const epochMinute = currentMinute();
  const now = stationMinutes(new Date(epochMinute * 60_000));
  const anchor =
    step === STEP.normal || incident == null
      ? null
      : now - (epochMinute - minuteOf(incident.detectedAt));
  const layout = await stationLayout(stationId);
  const reserved = anchor == null ? [] : scenarioPlan(anchor);
  const plan = await simulatedPlan({
    stationId,
    layout,
    reserved,
    epochMinute,
    now,
  });
  return { plan, layout, now, anchor };
}

function scenarioPlan(anchor: number): PlannedTrain[] {
  return SCENARIO_TRAINS.map((train) => ({
    ...train,
    arrival: anchor + train.arrival,
    departure: anchor + train.departure,
  }));
}

// Минута эпохи Unix для записи из базы.
function minuteOf(at: string) {
  return Math.floor(new Date(at).getTime() / 60_000);
}
