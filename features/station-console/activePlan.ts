import { toClock, toMinutes } from "@/lib/clock";
import { forecastPlan, type Run } from "./forecast";
import { WINDOW_MINUTES } from "./metrics";
import { FAULT, OPTION_CHANGES, STEP } from "./mock";
import { stepOf } from "./scenario";
import type { ChosenOption, Live, OptionId, PlannedTrain } from "./types";

// Какой план путей действует сейчас: до сбоя — исходный, до решения —
// «ничего не менять» при закрытой С3, после — принятый вариант. По его
// прогнозу рисуются схема и план путей и поручаются операции бригаде.

// Для прогноза из хода станции нужны только план путей и устройство.
export type PlanSource = Pick<Live, "plan" | "layout">;

// null — исходный план, сбоя нет.
export function activeOption(step: number, chosen: ChosenOption | null) {
  if (step === STEP.normal) return null;
  if (step < STEP.decided || chosen == null) return "none";
  return chosen;
}

export function forecastFor(source: PlanSource, option: OptionId | null) {
  return forecastPlan({
    ...source,
    changes: option == null ? [] : OPTION_CHANGES[option],
    closures: option == null ? [] : [faultClosure()],
  });
}

// План путей по прогнозу, в той же форме, что план из базы: поезда на своих
// путях и во времени по прогнозу.
export function activePlan(live: Live): PlannedTrain[] {
  const option = activeOption(stepOf(live), live.incident?.option ?? null);
  return forecastFor(live, option).map(toPlannedTrain);
}

// Конец окна прогноза после сбоя: «14:38».
export function forecastUntil() {
  return toClock(toMinutes(FAULT.from) + WINDOW_MINUTES);
}

export function faultClosure() {
  const span = { from: toMinutes(FAULT.from), to: toMinutes(FAULT.until) };
  return { switchId: FAULT.switchId, span };
}

function toPlannedTrain(run: Run): PlannedTrain {
  return {
    train: run.train,
    kind: run.kind,
    track: run.track,
    entryRoute: run.entryRoute,
    exitRoute: run.exitRoute,
    arrival: toClock(run.forecast.from),
    departure: toClock(run.forecast.to),
  };
}
