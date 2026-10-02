import type {
  Section,
  SectionFlow,
  StationFlow,
  Train,
  TrainFlow,
  TrainStop,
} from "./types";

// Горизонт прогноза: 3 часа вперёд от текущего момента.
export const HORIZON_MINUTES = 180;

// Всё считаем в одной единице — движение поезда по участку A → B. Движение
// активно, если поезд уже идёт по участку или выйдет на него за горизонт.
// Из одних и тех же движений собраны стрелка на карте, счётчики станции и
// список поездов в карточке, поэтому числа везде совпадают.
type Leg = {
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

// Каждый поезд станции попадает ровно в одну категорию, поэтому сумма
// счётчиков равна числу поездов в карточке станции.
export function stationFlow(trains: Train[], stationId: string): StationFlow {
  const flow = { arriving: 0, departing: 0, passing: 0 };
  for (const stationTrain of stationTrains(trains, stationId)) {
    flow[stationTrain.flow] += 1;
  }
  return flow;
}

// Поезда станции — те, у кого есть активное движение к ней или от неё.
// incoming / outgoing — эти движения; их же считают стрелки участков.
export function stationTrains(trains: Train[], stationId: string) {
  return trains.flatMap((train) => {
    const legs = legsOf(train).filter(isActive);
    const incoming = legs.find((leg) => leg.to.stationId === stationId) ?? null;
    const outgoing =
      legs.find((leg) => leg.from.stationId === stationId) ?? null;
    const stop = incoming?.to ?? outgoing?.from;
    if (stop == null) return [];

    const passes = incoming?.passesTo ?? outgoing?.passesFrom ?? false;
    return { train, stop, incoming, outgoing, flow: flowOf(passes, incoming) };
  });
}

// Поезд сейчас на станции из набора или на участке, касающемся набора.
export function isTrainWithin(train: Train, stationIds: Set<string>) {
  const standing = train.route.find(
    (stop) => stop.arrival <= 0 && stop.departure > 0,
  );
  if (standing != null) return stationIds.has(standing.stationId);

  const moving = legsOf(train).find(isMoving);
  if (moving == null) return false;
  const { from, to } = moving;
  return stationIds.has(from.stationId) || stationIds.has(to.stationId);
}

// Движения поездов, которые прямо сейчас идут по участку.
export function movingLegs(trains: Train[]) {
  return trains.flatMap(legsOf).filter(isMoving);
}

// Проездом — не останавливается у нас, где бы поезд ни был. Иначе по тому,
// прибыл ли он: активное движение к станции есть, только пока поезд не приехал.
function flowOf(passes: boolean, incoming: Leg | null): TrainFlow {
  if (passes) return "passing";
  return incoming != null ? "arriving" : "departing";
}

function legsBetween(trains: Train[], fromId: string, toId: string) {
  return activeLegs(trains).filter(
    (leg) => leg.from.stationId === fromId && leg.to.stationId === toId,
  );
}

function activeLegs(trains: Train[]) {
  return trains.flatMap(legsOf).filter(isActive);
}

function isActive(leg: Leg) {
  return leg.to.arrival > 0 && leg.from.departure <= HORIZON_MINUTES;
}

function isMoving(leg: Leg) {
  return leg.from.departure <= 0 && leg.to.arrival > 0;
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
