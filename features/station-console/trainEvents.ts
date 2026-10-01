import { toClock } from "@/lib/clock";
import type { PlannedTrain, ScenarioEvent } from "./types";

// Лента живого плана: что уже случилось с поездами станции — прибыл,
// отправлен, проследовал. Свежие сверху.

const FEED_SIZE = 8;

// Событие поезда в минутах плана: время на часы переводим в самом конце,
// чтобы порядок через полночь не путался.
type TrainEvent = { id: string; at: number; text: string };

export function trainEvents(plan: PlannedTrain[], now: number) {
  return plan
    .flatMap(eventsOf)
    .filter((event) => event.at <= now)
    .toSorted((a, b) => b.at - a.at)
    .slice(0, FEED_SIZE)
    .map(
      ({ id, at, text }): ScenarioEvent => ({ id, time: toClock(at), text }),
    );
}

function eventsOf(train: PlannedTrain): TrainEvent[] {
  const { train: number, track, arrival, departure } = train;
  if (departure - arrival <= 1) {
    const text = `${number} проследовал по пути ${track}`;
    return [{ id: `${number}-pass`, at: arrival, text }];
  }
  return [
    {
      id: `${number}-arrival`,
      at: arrival,
      text: `${number} прибыл на путь ${track}`,
    },
    {
      id: `${number}-departure`,
      at: departure,
      text: `${number} отправлен с пути ${track}`,
    },
  ];
}
