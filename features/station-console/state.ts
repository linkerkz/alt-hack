import { recommendedFor } from "./advice";
import { STEP } from "./mock";
import { stepOf } from "./scenario";
import type { ChosenOption, ConsoleState, ConsoleTab, Live } from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

// Состояние пульта: ход инцидента — из базы, вид экрана — из URL.
// Битые и пустые параметры заменяем умолчаниями.
export function parseConsoleState(
  params: SearchParams,
  live: Live,
): ConsoleState {
  const step = stepOf(live);
  const { incident } = live;
  return {
    step,
    // Принятый вариант — из базы; до решения ДСЦС смотрит любой.
    option:
      incident?.option ??
      viewedOption(first(params.opt), incident?.dncRejected === true, live),
    tab: parseTab(first(params.tab), step),
    focus: first(params.focus) !== "off",
    panel: first(params.panel) !== "off",
    done: incident?.routeTasks ?? [],
  };
}

// Ссылка на тот же вид пульта с изменёнными полями.
export function consoleHref(state: ConsoleState, patch: Partial<ConsoleState>) {
  const next = { ...state, ...patch };
  const query = new URLSearchParams({ opt: next.option, tab: next.tab });
  if (!next.focus) query.set("focus", "off");
  if (!next.panel) query.set("panel", "off");
  return `?${query}`;
}

// По умолчанию — рекомендованный системой, а если ДНЦ отклонил Б — А.
function viewedOption(
  value: string | undefined,
  dncRejected: boolean,
  live: Live,
): ChosenOption {
  if (value === "A" || value === "B") return value;
  return dncRejected ? "A" : recommendedFor(live);
}

// До инцидента вкладки инцидента нет; после — она открыта по умолчанию.
function parseTab(value: string | undefined, step: number): ConsoleTab {
  if (step === STEP.normal) return "overview";
  return value === "overview" ? "overview" : "incident";
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
