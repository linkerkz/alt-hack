import { STEP } from "./mock";
import type { ConsoleState, ConsoleTab } from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

// Состояние пульта из URL: битые и пустые параметры заменяем умолчаниями.
export function parseConsoleState(params: SearchParams): ConsoleState {
  const step = parseStep(first(params.step));
  return {
    step,
    option: first(params.opt) === "A" ? "A" : "B",
    tab: parseTab(first(params.tab), step),
    focus: first(params.focus) !== "off",
    panel: first(params.panel) !== "off",
  };
}

// Ссылка на то же состояние с изменёнными полями.
export function consoleHref(state: ConsoleState, patch: Partial<ConsoleState>) {
  const next = { ...state, ...patch };
  const query = new URLSearchParams({
    step: String(next.step),
    opt: next.option,
    tab: next.tab,
  });
  if (!next.focus) query.set("focus", "off");
  if (!next.panel) query.set("panel", "off");
  return `?${query}`;
}

function parseStep(value: string | undefined) {
  const step = Number(value);
  if (!Number.isInteger(step)) return STEP.normal;
  return Math.min(Math.max(step, STEP.normal), STEP.closed);
}

// До инцидента вкладки инцидента нет; после — она открыта по умолчанию.
function parseTab(value: string | undefined, step: number): ConsoleTab {
  if (step === STEP.normal) return "overview";
  return value === "overview" ? "overview" : "incident";
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
