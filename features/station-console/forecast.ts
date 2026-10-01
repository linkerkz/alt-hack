import { toMinutes } from "@/lib/clock";
import type { PlanChange, PlannedTrain, StationLayout } from "./types";

// Прогноз плана путей без симулятора: поезда по порядку прибытия идут по
// плану или по изменению варианта, а если маршрут закрыт, путь занят или
// враждебный маршрут уже собран — ждут. Так считается и цепочка задержек.

export type Run = {
  train: string;
  kind: PlannedTrain["kind"];
  track: number;
  // Занятость пути по исходному плану и по прогнозу, минуты от полуночи.
  planned: Span;
  forecast: Span;
  // Поезд ждал не по плану: это конфликт, который прогноз разрешил ожиданием.
  waited: boolean;
};

export type Span = { from: number; to: number };

// Закрытая стрелка: маршруты через неё недоступны на этом окне.
export type Closure = { switchId: string; span: Span };

type Params = {
  plan: PlannedTrain[];
  layout: StationLayout;
  changes: PlanChange[];
  closures: Closure[];
};

// Маршрут занят, пока его готовят и поезд по нему проходит.
const ROUTE_MINUTES = 2;

// Дольше не ищем окно: поезд встаёт в конец ожидания.
const MAX_WAIT_MINUTES = 180;

export function forecastPlan({ plan, layout, changes, closures }: Params) {
  const switchesOf = new Map(layout.routes.map((r) => [r.id, r.switches]));
  const world: World = { runs: [], uses: [], closures, switchesOf };
  const targets = plan
    .map((train) => targetOf(train, changes))
    .toSorted((a, b) => a.span.from - b.span.from);

  for (const target of targets) world.runs.push(schedule(target, world));
  return world.runs;
}

// Что поезд должен сделать: исходный план или изменение варианта; стоянка
// при изменении та же.
function targetOf(train: PlannedTrain, changes: PlanChange[]): Target {
  const planned = {
    from: toMinutes(train.arrival),
    to: toMinutes(train.departure),
  };
  const change = changes.find((item) => item.train === train.train);
  if (change == null) return { ...train, planned, span: planned };

  const from = toMinutes(change.arrival);
  const span = { from, to: from + planned.to - planned.from };
  return { ...train, ...change, planned, span };
}

function schedule(target: Target, world: World): Run {
  const { span, track } = target;
  const dwell = span.to - span.from;
  const from = earliest(
    span.from,
    (t) =>
      isRouteFree(target.entryRoute, t, world) &&
      isTrackFree(track, { from: t, to: t + dwell }, world.runs),
  );
  const to = earliest(from + dwell, (t) =>
    isRouteFree(target.exitRoute, t, world),
  );
  world.uses.push(
    { switches: switchesOf(target.entryRoute, world), at: from },
    { switches: switchesOf(target.exitRoute, world), at: to },
  );

  return {
    train: target.train,
    kind: target.kind,
    track,
    planned: target.planned,
    forecast: { from, to },
    waited: from > span.from || to > from + dwell,
  };
}

function earliest(start: number, isFree: (t: number) => boolean) {
  for (let t = start; t < start + MAX_WAIT_MINUTES; t++) {
    if (isFree(t)) return t;
  }
  return start + MAX_WAIT_MINUTES;
}

// Маршрут свободен: ни одна его стрелка не закрыта и не занята другим
// маршрутом в эти минуты.
function isRouteFree(route: string, t: number, world: World) {
  const switches = switchesOf(route, world);
  const isClosed = world.closures.some(
    ({ switchId, span }) =>
      switches.includes(switchId) && t >= span.from && t < span.to,
  );
  const isHostile = world.uses.some(
    (use) =>
      Math.abs(use.at - t) < ROUTE_MINUTES &&
      use.switches.some((id) => switches.includes(id)),
  );
  return !isClosed && !isHostile;
}

function isTrackFree(track: number, span: Span, runs: Run[]) {
  return !runs.some(
    (run) =>
      run.track === track &&
      run.forecast.from < span.to &&
      span.from < run.forecast.to,
  );
}

function switchesOf(route: string, world: World) {
  return world.switchesOf.get(route) ?? [];
}

type World = {
  runs: Run[];
  uses: { switches: string[]; at: number }[];
  closures: Closure[];
  switchesOf: Map<string, string[]>;
};

type Target = PlannedTrain & { planned: Span; span: Span };
