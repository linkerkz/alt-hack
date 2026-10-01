import { toMinutes } from "@/lib/clock";
import { indexStatus } from "@/lib/efficiencyIndex";
import {
  activeOption,
  forecastFor,
  forecastUntil,
  type PlanSource,
} from "./activePlan";
import { evaluatePlan } from "./metrics";
import { FAULT, STEP, STEP_MINUTE, scenarioMinute } from "./mock";
import {
  clockAt,
  formatNumber,
  MAX_SCORE,
  METRICS,
  scoreStatus,
} from "./status";
import type { ConsoleState, OptionId } from "./types";

// Оценка плана варианта option при закрытой стрелке. Окно — полчаса от
// обнаружения сбоя: прогноз не «плывёт», пока диспетчеры решают, и после
// решения показывает то же, что обещало сравнение вариантов.
export function scorePlan(source: PlanSource, option: OptionId) {
  const runs = forecastFor(source, option);
  return evaluatePlan(runs, source.layout, toMinutes(FAULT.from));
}

// Исходный план без сбоя — с ним сравниваем индекс после сбоя. В живом
// плане — на текущую минуту, в сценарии — на минуту до сбоя.
export function scoreBaseline(source: PlanSource) {
  const at = source.simulated ? source.now : scenarioMinute(STEP.normal);
  return evaluatePlan(forecastFor(source, null), source.layout, at);
}

// Оценка действующего плана; null — исходный план, сбоя нет.
export function scoreActive(source: PlanSource, option: OptionId | null) {
  return option == null ? scoreBaseline(source) : scorePlan(source, option);
}

// Индекс эффективности станции на шаге сценария: до сбоя — исходный план,
// до решения — «ничего не менять», после — принятый вариант.
export function stationEfficiency(state: ConsoleState, source: PlanSource) {
  const { step } = state;
  const option = activeOption(step, state.option);
  const baseline = scoreBaseline(source);
  const { values, scores, index } = scoreActive(source, option);
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
    // Пока решение не принято, индекс — прогноз «если ничего не менять».
    forecast:
      step >= STEP.suspected && step <= STEP.approval
        ? `Прогноз до ${forecastUntil()}, если ничего не менять`
        : null,
  };
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
