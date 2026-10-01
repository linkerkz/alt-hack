import { toClock } from "@/lib/clock";
import { indexStatus } from "@/lib/efficiencyIndex";
import {
  faultClosure,
  forecastFor,
  forecastUntil,
  type PlanSource,
} from "./activePlan";
import { scoreBaseline, scorePlan } from "./efficiency";
import { FAULT } from "./mock";

// Влияние сбоя, если ничего не менять: какие поезда идут через закрытую
// стрелку, какие маршруты недоступны, чьи бригады ждут и как падает индекс.

export function incidentImpact(source: PlanSource) {
  const after = scorePlan(source, "none").index;
  const trains = affectedTrains(source);
  return {
    before: scoreBaseline(source).index,
    after,
    status: indexStatus(after),
    until: forecastUntil(source),
    trains,
    routes: closedRoutes(source),
    crews: trains
      .filter((train) => train.kind === "freight" && train.waits)
      .map((train) => train.train),
  };
}

// Поезда, чей маршрут приёма или отправления идёт через стрелку, пока она закрыта.
function affectedTrains(source: PlanSource) {
  const closure = faultClosure(source);
  const blocked = new Set(blockedRoutes(source).map((route) => route.id));
  return forecastFor(source, "none")
    .filter(
      (run) =>
        (blocked.has(run.entryRoute) || blocked.has(run.exitRoute)) &&
        run.planned.from < closure.span.to &&
        run.planned.to > closure.span.from,
    )
    .map((run) => ({
      train: run.train,
      kind: run.kind,
      track: run.track,
      arrival: toClock(run.planned.from),
      waits: run.waited,
    }));
}

// «Н → путь 3»: светофор маршрута и путь.
function closedRoutes(source: PlanSource) {
  return blockedRoutes(source).map(
    (route) => `${route.id.split("-")[0]} → путь ${route.track}`,
  );
}

function blockedRoutes({ layout }: PlanSource) {
  return layout.routes.filter((route) =>
    route.switches.includes(FAULT.switchId),
  );
}
