import { toClock } from "@/lib/clock";
import { indexStatus } from "@/lib/efficiencyIndex";
import {
  activeOption,
  anchorOf,
  forecastFor,
  forecastUntil,
  type PlanSource,
} from "./activePlan";
import { evaluatePlan } from "./metrics";
import { STEP } from "./mock";
import { formatNumber, MAX_SCORE, METRICS, scoreStatus } from "./status";
import type { ConsoleState, OptionId } from "./types";

// Оценка плана варианта option при закрытой стрелке. Окно — полчаса от
// обнаружения сбоя: прогноз не «плывёт», пока диспетчеры решают, и после
// решения показывает то же, что обещало сравнение вариантов.
export function scorePlan(source: PlanSource, option: OptionId) {
  const runs = forecastFor(source, option);
  return evaluatePlan(runs, source.layout, anchorOf(source));
}

// Исходный план без сбоя — с ним сравниваем индекс после сбоя. Без
// сценария — на текущую минуту, в сценарии — на минуту обнаружения.
export function scoreBaseline(source: PlanSource) {
  const runs = forecastFor(source, null);
  return evaluatePlan(runs, source.layout, anchorOf(source));
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
    trend: trendOf(step, index, baseline.index, anchorOf(source)),
    metrics,
    reason: reasonOf(metrics),
    // Пока решение не принято, индекс — прогноз «если ничего не менять».
    forecast:
      step >= STEP.suspected && step <= STEP.approval
        ? `Прогноз до ${forecastUntil(source)}, если ничего не менять`
        : null,
  };
}

function trendOf(step: number, index: number, baseline: number, at: number) {
  if (step === STEP.normal) return "Штатная работа по графику";
  const delta = index - baseline;
  const sign = delta >= 0 ? "+" : "−";
  return `было ${baseline} в ${toClock(at)} · ${sign}${Math.abs(delta)}`;
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
