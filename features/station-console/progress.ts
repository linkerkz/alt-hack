import { STEP } from "./mock";
import type { ConsoleState } from "./types";

// Прогресс инцидента: шесть этапов на весь путь от камеры до возврата
// стрелки. Согласование нужно только варианту Б — у варианта А его пропускаем.

export type StageState = "done" | "current" | "todo" | "skipped";

const STAGES = [
  "Обнаружен",
  "Путейцы",
  "Вариант",
  "Согласование",
  "Ремонт",
  "Возврат",
];

// Этап на шаге сценария; STAGES.length — инцидент закрыт.
const STEP_STAGE = [0, 0, 1, 1, 2, 3, 4, 4, 4, 5, 6];

const APPROVAL_STAGE = 3;

export function incidentProgress({ step, option }: ConsoleState) {
  const current = STEP_STAGE[step];
  const approvalSkipped = option === "A" && step >= STEP.decided;
  const stages = STAGES.map((label, i) => ({
    label,
    state: stateOf(i, current, i === APPROVAL_STAGE && approvalSkipped),
  }));
  return {
    stages,
    // Название текущего этапа для обзора: «Согласование».
    current: STAGES[current] ?? "Закрыт",
  };
}

function stateOf(index: number, current: number, skipped: boolean): StageState {
  if (skipped) return "skipped";
  if (index < current) return "done";
  return index === current ? "current" : "todo";
}
