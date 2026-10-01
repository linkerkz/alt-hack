import { STEP } from "./mock";
import type { ConsoleState, ConsoleTab, RouteTask } from "./types";

const ROUTE_TASKS: RouteTask[] = ["r101", "r2001"];

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
    done: parseDone(first(params.done)),
    confirm: first(params.confirm) === "1",
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
  if (next.done.length > 0) query.set("done", next.done.join(","));
  if (next.confirm) query.set("confirm", "1");
  return `?${query}`;
}

function parseDone(value: string | undefined): RouteTask[] {
  const ids = (value ?? "").split(",");
  return ROUTE_TASKS.filter((task) => ids.includes(task));
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
