import type { ChainState } from "./chain";
import type { PlanBarKind } from "./plan";
import type { Status } from "./types";

// Пороги индекса по продуктовому решению: от 80 — Норма, 60–79 — Внимание.
const INDEX_THRESHOLDS = { normal: 80, warning: 60 };

// Пороги оценки одного показателя из 20 баллов.
const SCORE_THRESHOLDS = { normal: 17, warning: 12 };

export function indexStatus(index: number) {
  return statusOf(index, INDEX_THRESHOLDS);
}

export function scoreStatus(score: number) {
  return statusOf(score, SCORE_THRESHOLDS);
}

export const STATUS_LABEL: Record<Status, string> = {
  normal: "Норма",
  warning: "Внимание",
  critical: "Критично",
};

function statusOf(
  value: number,
  thresholds: { normal: number; warning: number },
): Status {
  if (value >= thresholds.normal) return "normal";
  if (value >= thresholds.warning) return "warning";
  return "critical";
}

// Дробные минуты пишем через запятую: «4,2 мин».
export function formatNumber(value: number) {
  return String(value).replace(".", ",");
}

export function clockAt(minute: number) {
  return `14:${String(minute).padStart(2, "0")}`;
}

// Полосы плана занятости путей: факт, план, конфликт, предпросмотр варианта,
// принятый новый план и закрытый объект.
export const PLAN_BAR_CLASS: Record<PlanBarKind, string> = {
  fact: "border border-neutral-500 bg-neutral-300 text-ink",
  plan: "border border-neutral-700 text-ink",
  conflict: "border-[1.5px] border-critical bg-critical/8 text-critical",
  preview:
    "border-[1.5px] border-accent border-dashed bg-accent-100 text-accent-800",
  new: "border-[1.5px] border-accent bg-accent-100 text-accent-900",
  closed:
    "border border-critical text-critical bg-[repeating-linear-gradient(135deg,transparent_0_5px,color-mix(in_srgb,var(--color-critical)_30%,transparent)_5px_7px)]",
};

// Шаги статуса инцидента и пути решения: сделано, текущий, впереди.
export const PROGRESS_CLASS: Record<
  ChainState,
  { bar: string; text: string; mark: string }
> = {
  done: { bar: "bg-ink", text: "text-ink", mark: "●" },
  current: { bar: "bg-accent", text: "text-accent-700", mark: "▲" },
  todo: { bar: "bg-neutral-300", text: "text-neutral-500", mark: "○" },
};
