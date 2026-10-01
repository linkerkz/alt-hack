import type {
  Section,
  SectionFlow,
  StationFlow,
  Train,
  TrainStop,
} from "./types";

// Горизонт прогноза: 3 часа вперёд от текущего момента.
export const HORIZON_MINUTES = 180;

// Всё считаем в одной единице — движение поезда по участку A → B. Движение
// активно, если поезд уже идёт по участку или выйдет на него за горизонт.
// Из одних и тех же движений собраны стрелка на карте, счётчики станции и
// список поездов в карточке, поэтому числа везде совпадают.
export type Leg = {
  train: Train;
  from: TrainStop;
  to: TrainStop;
  // Проходит ли поезд станцию без остановки: from — для движения от неё, to — к ней.
  passesFrom: boolean;
  passesTo: boolean;
};

export function sectionFlow(trains: Train[], section: Section): SectionFlow {
  return {
    forward: legsBetween(trains, section.fromId, section.toId).length,
    backward: legsBetween(trains, section.toId, section.fromId).length,
  };
}

// К нам = остановятся у нас, от нас = стояли у нас и уходят,
// проездом = идут к нам без остановки. Сумма «к нам» по всем соседям
// в карточке равна «к нам» + «проездом».
export function stationFlow(trains: Train[], stationId: string): StationFlow {
  const legs = activeLegs(trains);
  const incoming = legs.filter((leg) => leg.to.stationId === stationId);
  const outgoing = legs.filter((leg) => leg.from.stationId === stationId);

  return {
    arriving: incoming.filter((leg) => !leg.passesTo).length,
    departing: outgoing.filter((leg) => !leg.passesFrom).length,
    passing: incoming.filter((leg) => leg.passesTo).length,
  };
}

export function legsBetween(trains: Train[], fromId: string, toId: string) {
  return activeLegs(trains).filter(
    (leg) => leg.from.stationId === fromId && leg.to.stationId === toId,
  );
}

// Поезд сейчас на станции из набора или на участке, касающемся набора.
export function isTrainWithin(train: Train, stationIds: Set<string>) {
  const standing = train.route.find(
    (stop) => stop.arrival <= 0 && stop.departure > 0,
  );
  if (standing != null) return stationIds.has(standing.stationId);

  const moving = legsOf(train).find(
    (leg) => leg.from.departure <= 0 && leg.to.arrival > 0,
  );
  if (moving == null) return false;
  const { from, to } = moving;
  return stationIds.has(from.stationId) || stationIds.has(to.stationId);
}

function activeLegs(trains: Train[]) {
  return trains.flatMap(legsOf).filter(isActive);
}

function isActive(leg: Leg) {
  return leg.to.arrival > 0 && leg.from.departure <= HORIZON_MINUTES;
}

function legsOf(train: Train): Leg[] {
  const { route } = train;
  return route.slice(1).map((to, index) => ({
    train,
    from: route[index],
    to,
    passesFrom: isPassing(route, index),
    passesTo: isPassing(route, index + 1),
  }));
}

// Начальная и конечная станции — всегда остановка, промежуточная — проезд,
// если поезд на ней не стоит.
function isPassing(route: TrainStop[], index: number) {
  const isEndpoint = index === 0 || index === route.length - 1;
  const stop = route[index];
  return !isEndpoint && stop.departure === stop.arrival;
}
