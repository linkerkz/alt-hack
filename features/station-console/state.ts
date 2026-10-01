import { recommendedFor } from "./advice";
import { stepOf } from "./scenario";
import type { ChosenOption, ConsoleState, Live } from "./types";

type SearchParams = Record<string, string | string[] | undefined>;

// Состояние пульта: ход инцидента — из базы, вариант, который ДСЦС смотрит
// до решения, — из URL. Остальной вид экрана сервер не читает: см. view.ts.
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
    done: incident?.routeTasks ?? [],
  };
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

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
