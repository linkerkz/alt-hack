import type { GivenDeparture, Live, PlannedTrain } from "./types";

// Отправление поезда — задача ДСП, как приём: задать маршрут отправления
// с пути в горловину и уведомить машиниста. Данное отправление пишется в
// хронологию с ключом операции; по нему схема уводит поезд со станции.

// given — дано; ready — поезд на пути, можно давать; early — поезд ещё не
// прибыл или до отправления далеко: состав готовят.
type DepartureState = "given" | "ready" | "early";

// Раньше ДСП отправление не даёт: бригада ещё готовит состав.
const READY_MINUTES = 10;

export function departureState(
  train: PlannedTrain,
  { departures, now }: Pick<Live, "departures" | "now">,
): DepartureState {
  if (givenAt(train.train, train.arrival, departures) != null) return "given";
  const standing = train.arrival <= now && now <= train.departure;
  return standing && train.departure - now <= READY_MINUTES ? "ready" : "early";
}

// Минута, когда ДСП дал отправление этому заходу поезда; null — не давал.
// Отправление с тем же номером до прибытия — прошлый заход: прошлый прогон
// сценария или вчерашний поезд симуляции.
export function givenAt(
  train: string,
  arrival: number,
  departures: GivenDeparture[],
) {
  const key = departureKey(train);
  const given = departures.find(
    (item) => item.operation === key && item.at >= arrival,
  );
  return given?.at ?? null;
}

// Ключ операции отправления — тот же, что у поручения бригаде на пейджер.
export function departureKey(train: string) {
  return `${train}-departure`;
}

// Поезд действующего плана по ключу операции; null — такого нет.
export function departingTrain(plan: PlannedTrain[], key: string) {
  return plan.find((train) => departureKey(train.train) === key) ?? null;
}

export function departureText({ train, track, exitRoute }: PlannedTrain) {
  return `ДСП дал отправление ${train} с пути ${track}: маршрут ${exitRoute} задан, машинист уведомлён`;
}
