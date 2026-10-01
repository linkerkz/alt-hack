import { toClock } from "@/lib/clock";
import { forecastPlan, type Run } from "./forecast";
import { WINDOW_MINUTES } from "./metrics";
import { FAULT, STEP } from "./mock";
import { optionChanges } from "./replan";
import { stepOf } from "./scenario";
import type { ChosenOption, Live, OptionId, PlannedTrain } from "./types";

// Какой план путей действует сейчас: до сбоя — исходный, до решения —
// «ничего не менять» при закрытой С3, после — принятый вариант. По его
// прогнозу рисуются схема и план путей и поручаются операции бригаде.

// Для прогноза из хода станции нужны план путей, устройство и время станции.
export type PlanSource = Pick<Live, "plan" | "layout" | "now" | "anchor">;

// null — исходный план, сбоя нет.
export function activeOption(step: number, chosen: ChosenOption | null) {
  if (step === STEP.normal) return null;
  if (step < STEP.decided || chosen == null) return "none";
  return chosen;
}

export function forecastFor(source: PlanSource, option: OptionId | null) {
  return forecastPlan({
    plan: source.plan,
    layout: source.layout,
    changes: option == null ? [] : optionChanges(source, option),
    closures: option == null ? [] : [faultClosure(source)],
  });
}

// План путей по прогнозу, в той же форме, что исходный: поезда на своих
// путях и во времени по прогнозу.
export function activePlan(live: Live): PlannedTrain[] {
  const option = activeOption(stepOf(live), live.incident?.option ?? null);
  return forecastFor(live, option).map(toPlannedTrain);
}

// Обнаружение сбоя (t0); без сценария — текущая минута: так варианты
// можно посчитать в любой момент.
export function anchorOf({ anchor, now }: PlanSource) {
  return anchor ?? now;
}

// Конец окна прогноза после сбоя: «14:38».
export function forecastUntil(source: PlanSource) {
  return toClock(anchorOf(source) + WINDOW_MINUTES);
}

// С3 закрыта с обнаружения на время ремонта по прогнозу.
export function faultClosure(source: PlanSource) {
  const from = anchorOf(source);
  const span = { from, to: from + FAULT.repairMinutes };
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
