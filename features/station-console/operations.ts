import { toClock } from "@/lib/clock";
import { departureKey } from "./departure";
import type { PagerMessage, PlannedTrain } from "./types";

// Ближайшие операции станции по плану путей: прибытия и отправления, по
// которым бригаде есть работа. Пропуск без остановки бригаде не поручаем.

export type Operation = {
  // Ключ операции на пейджере: «101-arrival».
  id: string;
  kind: "arrival" | "departure";
  // Минуты плана, как у PlannedTrain.
  time: number;
  train: string;
  // Поручение бригаде: что сделать, где и к какому времени.
  text: string;
};

// Сколько операций показываем вперёд от текущего времени.
const UPCOMING = 5;

// Стоянка короче — поезд проходит станцию, работы бригаде нет.
const MIN_STOP_MINUTES = 2;

// К отправлению грузовой собирают заранее: сцепка и опробование тормозов.
const PREPARE_MINUTES = 15;

// Операции от текущего времени станции (минуты плана), ближайшие сверху, со
// статусом поручения: последнее сообщение пейджера по этой операции.
export function upcomingOperations(
  plan: PlannedTrain[],
  now: number,
  pager: PagerMessage[],
) {
  return allOperations(plan)
    .filter((operation) => operation.time >= now)
    .toSorted((a, b) => a.time - b.time)
    .slice(0, UPCOMING)
    .map((operation) => ({
      ...operation,
      message: pager.find((message) => message.operation === operation.id),
    }));
}

// Операция по ключу из команды; null — такой в плане нет.
export function operationById(plan: PlannedTrain[], id: string) {
  return allOperations(plan).find((operation) => operation.id === id) ?? null;
}

function allOperations(plan: PlannedTrain[]) {
  return plan
    .filter((train) => train.departure - train.arrival >= MIN_STOP_MINUTES)
    .flatMap((train) => [arrivalOf(train), departureOf(train)]);
}

function arrivalOf({ train, kind, track, arrival }: PlannedTrain): Operation {
  const work =
    kind === "passenger"
      ? "осмотреть состав с междупутья"
      : "закрепить состав тормозными башмаками";
  return {
    id: `${train}-arrival`,
    kind: "arrival",
    time: arrival,
    train,
    text: `Встретить ${train} на пути ${track} в ${toClock(arrival)}: ${work}`,
  };
}

function departureOf({
  train,
  kind,
  track,
  departure,
}: PlannedTrain): Operation {
  const text =
    kind === "passenger"
      ? `Проводить ${train} с пути ${track} в ${toClock(departure)}: осмотреть состав, нет ли людей на путях`
      : `Подготовить ${train} к отправлению с пути ${track} в ${toClock(departure)}: сцепить вагоны, опробовать тормоза к ${toClock(departure - PREPARE_MINUTES)}`;
  return {
    id: departureKey(train),
    kind: "departure",
    time: departure,
    train,
    text,
  };
}
