import { anchorOf, forecastFor, type PlanSource } from "./activePlan";
import { scorePlan } from "./efficiency";
import { WINDOW_MINUTES } from "./metrics";
import { needsDnc, optionChanges } from "./replan";
import type { ChosenOption, Neighbors } from "./types";

// Рекомендация по варианту — как будто её пишет ИИ, а на деле собрана из
// посчитанных показателей: последствия, нужен ли ДНЦ и сравнение индексов.

type Scored = { index: number; values: number[]; maxDelay: number };

type Params = {
  source: PlanSource;
  neighbors: Neighbors;
  options: Record<ChosenOption, Scored>;
  recommended: ChosenOption;
};

const LETTER: Record<ChosenOption, string> = { A: "А", B: "Б" };

// Индекс конфликтов в показателях evaluatePlan.
const CONFLICTS = 3;

export function adviceOf(id: ChosenOption, params: Params) {
  return [
    consequences(id, params),
    approvalOf(id, params),
    verdictOf(id, params),
  ].join(" ");
}

// Вариант с лучшим индексом; при равенстве — Б: остальные поезда идут по графику.
export function recommendedOf(
  options: Record<ChosenOption, Scored>,
): ChosenOption {
  return options.A.index > options.B.index ? "A" : "B";
}

// Рекомендованный вариант по плану станции — для «Далее» и выбора по умолчанию.
export function recommendedFor(source: PlanSource) {
  return recommendedOf({
    A: scorePlan(source, "A"),
    B: scorePlan(source, "B"),
  });
}

function consequences(id: ChosenOption, { source, options }: Params) {
  const { values, maxDelay } = options[id];
  const conflicts = values[CONFLICTS];
  const waiting = waitingTrains(source, id);
  const head =
    conflicts === 0
      ? "Конфликтов нет"
      : `Конфликтов: ${conflicts}${waiting.length > 0 ? ` — ждут ${waiting.join(", ")}` : ""}`;
  return maxDelay === 0
    ? `${head}, поезда идут по графику.`
    : `${head}, задержка до ${maxDelay} мин.`;
}

function approvalOf(id: ChosenOption, { source, neighbors }: Params) {
  if (!needsDnc(id)) return "Решается силами станции, без ДНЦ.";
  const held = optionChanges(source, id).find((change) => change.hold > 0);
  if (held == null) return "Требует согласования ДНЦ.";
  return `${held.train} ждёт ${held.hold} мин на ст. ${neighbors.odd} — нужно согласование ДНЦ.`;
}

function verdictOf(id: ChosenOption, { options, recommended }: Params) {
  const other: ChosenOption = id === "A" ? "B" : "A";
  const index = options[id].index;
  const otherIndex = options[other].index;
  return id === recommended
    ? `Рекомендую этот вариант: индекс ${index} против ${otherIndex} у варианта ${LETTER[other]}.`
    : `Индекс ${index} против ${otherIndex} у рекомендованного варианта ${LETTER[other]}.`;
}

// Поезда, которые по прогнозу ждут на окне решения.
function waitingTrains(source: PlanSource, id: ChosenOption) {
  const from = anchorOf(source);
  return forecastFor(source, id)
    .filter(
      (run) =>
        run.waited &&
        run.forecast.from < from + WINDOW_MINUTES &&
        run.forecast.to > from,
    )
    .map((run) => run.train);
}
