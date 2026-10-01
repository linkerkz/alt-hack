import { BASELINE, MAX_SCORE, METRIC_VALUES, METRICS, STEP } from "./mock";
import { formatNumber, indexStatus, scoreStatus } from "./status";

// Индекс эффективности станции на шаге сценария и показатели, из которых он сложен.
export function stationEfficiency(step: number) {
  const { values, scores } = METRIC_VALUES[step];
  const index = scores.reduce((sum, score) => sum + score, 0);
  const metrics = METRICS.map((metric, i) => ({
    label: metric.label,
    value: formatNumber(values[i]) + metric.unit,
    share: (scores[i] / MAX_SCORE) * 100,
    status: scoreStatus(scores[i]),
    loss: METRIC_VALUES[STEP.normal].scores[i] - scores[i],
  }));

  return {
    index,
    status: indexStatus(index),
    trend: trendOf(step, index),
    metrics,
    reason: reasonOf(metrics),
    // Прогноз «если ничего не менять» — пока решение не принято.
    showForecast: step >= STEP.suspected && step <= STEP.approval,
  };
}

function trendOf(step: number, index: number) {
  if (step === STEP.normal) return "Все показатели в норме";
  const delta = index - BASELINE.index;
  const sign = delta > 0 ? "+" : "−";
  return `было ${BASELINE.index} в ${BASELINE.time} · ${sign}${Math.abs(delta)}`;
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
