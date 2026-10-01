import { toMinutes } from "@/lib/clock";
import { forecastPlan } from "./forecast";
import { evaluatePlan } from "./metrics";
import { FAULT, replanOptions, STEP, STEP_MINUTE } from "./mock";
import {
  clockAt,
  formatNumber,
  indexStatus,
  MAX_SCORE,
  METRICS,
  scoreStatus,
} from "./status";
import type { ConsoleState, Live, Neighbors, OptionId } from "./types";

// Для оценки плана из хода станции нужны только план путей и устройство.
export type PlanSource = Pick<Live, "plan" | "layout">;

type Params = { live: PlanSource; neighbors: Neighbors; option: OptionId };

// Оценка плана варианта option при закрытой стрелке. Окно — полчаса от
// обнаружения сбоя: прогноз не «плывёт», пока диспетчеры решают, и после
// решения показывает то же, что обещало сравнение вариантов.
export function scorePlan({ live, neighbors, option }: Params) {
  const runs = forecastPlan({
    plan: live.plan,
    layout: live.layout,
    changes: replanOptions(neighbors)[option].changes,
    closures: [faultClosure()],
  });
  return evaluatePlan(runs, live.layout, toMinutes(FAULT.from));
}

// Исходный план без сбоя — с ним сравниваем индекс после сбоя.
export function scoreBaseline(live: PlanSource) {
  const runs = forecastPlan({ ...live, changes: [], closures: [] });
  const now = clockAt(STEP_MINUTE[STEP.normal]);
  return evaluatePlan(runs, live.layout, toMinutes(now));
}

// Индекс эффективности станции на шаге сценария: до сбоя — исходный план,
// до решения — «ничего не менять», после — принятый вариант.
export function stationEfficiency(
  state: ConsoleState,
  live: Live,
  neighbors: Neighbors,
) {
  const { step } = state;
  const option = step >= STEP.decided ? state.option : "none";
  const baseline = scoreBaseline(live);
  const { values, scores, index } =
    step === STEP.normal ? baseline : scorePlan({ live, neighbors, option });
  const metrics = METRICS.map((metric, i) => ({
    label: metric.label,
    value: formatNumber(values[i]) + metric.unit,
    share: (scores[i] / MAX_SCORE) * 100,
    status: scoreStatus(scores[i]),
    loss: baseline.scores[i] - scores[i],
  }));

  return {
    index,
    status: indexStatus(index),
    trend: trendOf(step, index, baseline.index),
    metrics,
    reason: reasonOf(metrics),
    // Прогноз «если ничего не менять» — пока решение не принято.
    showForecast: step >= STEP.suspected && step <= STEP.approval,
  };
}

function faultClosure() {
  const span = { from: toMinutes(FAULT.from), to: toMinutes(FAULT.until) };
  return { switchId: FAULT.switchId, span };
}

function trendOf(step: number, index: number, baseline: number) {
  if (step === STEP.normal) return "Штатная работа по графику";
  const delta = index - baseline;
  const sign = delta >= 0 ? "+" : "−";
  const time = clockAt(STEP_MINUTE[STEP.normal]);
  return `было ${baseline} в ${time} · ${sign}${Math.abs(delta)}`;
}

// Два показателя, которые сильнее всего снизили индекс: диспетчеру нужна причина.
function reasonOf(metrics: { label: string; loss: number }[]) {
  const worst = metrics
    .filter((metric) => metric.loss > 0)
    .sort((a, b) => b.loss - a.loss)
    .slice(0, 2);
  if (worst.length === 0) {
    return `Каждый показатель даёт до ${MAX_SCORE} баллов из 100`;
  }
  const items = worst.map(
    (metric) => `${metric.label.toLowerCase()} (−${metric.loss} б.)`,
  );
  return `Сильнее всего снижают индекс: ${items.join(", ")}`;
}
