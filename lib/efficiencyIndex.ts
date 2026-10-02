// Состояние станции по индексу эффективности — одно для карты сети, пульта
// и отчётов (docs/case_solution.md §5): от normal — «Норма», от warning —
// «Внимание», ниже — «Критично».
export const INDEX_THRESHOLDS = { normal: 80, warning: 60 };

type IndexStatus = "normal" | "warning" | "critical";

export function indexStatus(index: number): IndexStatus {
  if (index >= INDEX_THRESHOLDS.normal) return "normal";
  if (index >= INDEX_THRESHOLDS.warning) return "warning";
  return "critical";
}
