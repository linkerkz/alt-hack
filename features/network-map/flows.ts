import type {
  Section,
  SectionFlow,
  StationFlow,
  Train,
  TrainEvent,
  TrainStop,
} from "./types";

type StopEvent = Pick<TrainEvent, "type" | "minutes" | "departureMinutes">;

// Горизонт прогноза: считаем поезда, которые будут на станции в ближайшие 3 часа.
export const HORIZON_MINUTES = 180;

export function stationFlow(trains: Train[], stationId: string): StationFlow {
  const flow = { arriving: 0, departing: 0, passing: 0 };

  for (const train of trains) {
    for (const [index, stop] of train.route.entries()) {
      if (stop.stationId !== stationId) continue;
      const type = eventType(train, index);
      if (type.isArrival && isAhead(stop.arrival)) flow.arriving += 1;
      if (type.isDeparture && isAhead(stop.departure)) flow.departing += 1;
      if (type.isPassing && isAhead(stop.arrival)) flow.passing += 1;
    }
  }
  return flow;
}

// Поезда на участке в каждую сторону: уже идущие по нему и те, что выйдут
// на него за горизонт.
export function sectionFlow(trains: Train[], section: Section): SectionFlow {
  const isOnSection = (from: TrainStop, to: TrainStop) =>
    to.arrival > 0 && from.departure <= HORIZON_MINUTES;
  return {
    forward: countLegs(trains, section.fromId, section.toId, isOnSection),
    backward: countLegs(trains, section.toId, section.fromId, isOnSection),
  };
}

// Направления станции считаем по её событиям — так «к нам» сходится
// с ↓ прибывают + ⇢ проездом, а «от нас» — с ↑ отправляются + ⇢ проездом.
export function arrivalsFrom(
  trains: Train[],
  neighborId: string,
  stationId: string,
) {
  return countLegs(trains, neighborId, stationId, (_, to) =>
    isAhead(to.arrival),
  );
}

export function departuresTo(
  trains: Train[],
  stationId: string,
  neighborId: string,
) {
  return countLegs(trains, stationId, neighborId, (from) =>
    isAhead(from.departure),
  );
}

// Поезд сейчас на станции из набора или на участке, касающемся набора.
export function isTrainWithin(train: Train, stationIds: Set<string>) {
  const { route } = train;
  const standing = route.find(
    (stop) => stop.arrival <= 0 && stop.departure > 0,
  );
  if (standing != null) return stationIds.has(standing.stationId);

  const moving = legs(route).find(
    ([from, to]) => from.departure <= 0 && to.arrival > 0,
  );
  if (moving == null) return false;
  const [from, to] = moving;
  return stationIds.has(from.stationId) || stationIds.has(to.stationId);
}

// Ближайшие события станции по времени: одна строка на поезд.
export function stationEvents(
  trains: Train[],
  stationId: string,
  nameOf: (stationId: string) => string,
): TrainEvent[] {
  const events: TrainEvent[] = [];

  for (const train of trains) {
    for (const [index, stop] of train.route.entries()) {
      if (stop.stationId !== stationId) continue;
      const event = eventAt(train, index);
      if (event == null) continue;
      events.push({
        ...event,
        trainId: train.id,
        number: train.number,
        kind: train.kind,
        originName: nameOf(train.route[0].stationId),
        destinationName: nameOf(train.route[train.route.length - 1].stationId),
      });
    }
  }
  return events.toSorted((a, b) => a.minutes - b.minutes);
}

// Стоянка, у которой в горизонте и прибытие, и отправление, — одно событие «stop».
function eventAt(train: Train, index: number): StopEvent | null {
  const stop = train.route[index];
  const type = eventType(train, index);
  const arrives = type.isArrival && isAhead(stop.arrival);
  const departs = type.isDeparture && isAhead(stop.departure);

  if (type.isPassing && isAhead(stop.arrival)) {
    return {
      type: "passing",
      minutes: stop.arrival,
      departureMinutes: null,
    };
  }
  if (arrives && departs) {
    return {
      type: "stop",
      minutes: stop.arrival,
      departureMinutes: stop.departure,
    };
  }
  if (arrives) {
    return {
      type: "arrival",
      minutes: stop.arrival,
      departureMinutes: null,
    };
  }
  if (departs) {
    return {
      type: "departure",
      minutes: stop.departure,
      departureMinutes: null,
    };
  }
  return null;
}

// Начальная станция — только отправление, конечная — только прибытие,
// промежуточная — стоянка (прибытие и отправление) или проезд.
function eventType(train: Train, index: number) {
  const stop = train.route[index];
  const isFirst = index === 0;
  const isLast = index === train.route.length - 1;
  const isStop = isFirst || isLast || stop.departure > stop.arrival;

  return {
    isArrival: isStop && !isFirst,
    isDeparture: isStop && !isLast,
    isPassing: !isStop,
  };
}

function isAhead(minutes: number) {
  return minutes > 0 && minutes <= HORIZON_MINUTES;
}

function countLegs(
  trains: Train[],
  fromId: string,
  toId: string,
  isCounted: (from: TrainStop, to: TrainStop) => boolean,
) {
  let count = 0;
  for (const train of trains) {
    for (const [from, to] of legs(train.route)) {
      if (from.stationId !== fromId || to.stationId !== toId) continue;
      if (isCounted(from, to)) count += 1;
    }
  }
  return count;
}

function legs(route: TrainStop[]): [TrainStop, TrainStop][] {
  return route.slice(1).map((stop, index) => [route[index], stop]);
}
