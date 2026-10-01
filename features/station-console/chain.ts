import { replanOptions, STEP } from "./mock";
import type { ConsoleState, Neighbors } from "./types";

export type ChainState = "done" | "current" | "todo";

// Путь решения: кто из участников уже выполнил свою часть, кто следующий.
export function decisionChain(
  { step, option }: ConsoleState,
  neighbors: Neighbors,
) {
  if (step < STEP.decided) return [];
  const name = replanOptions(neighbors)[option].name.toLowerCase();
  const routed = step >= STEP.repairing;
  const links = [
    { who: "ДСЦС", what: `выбрал ${name}`, done: true },
    ...(option === "B"
      ? [{ who: "ДНЦ", what: "согласовал удержание", done: true }]
      : []),
    { who: "ДСП", what: "задал маршрут 101", done: routed },
    { who: "ДНЦ", what: "получил «маршрут готов»", done: routed },
    { who: "Машинист 101", what: "подтвердил", done: routed },
  ];
  const firstOpen = links.findIndex((link) => !link.done);

  return links.map((link, i) => ({
    who: link.who,
    what: link.what,
    state: chainState(link.done, i === firstOpen),
  }));
}

function chainState(done: boolean, isNext: boolean): ChainState {
  if (done) return "done";
  return isNext ? "current" : "todo";
}
