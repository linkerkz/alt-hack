import { toMinutes } from "@/lib/clock";
import type { PlannedTrain, ScenarioEvent } from "./types";

// Лента живого плана: что уже случилось с поездами станции — прибыл,
// отправлен, проследовал. Свежие сверху.

const FEED_SIZE = 8;

export function trainEvents(plan: PlannedTrain[], now: number) {
  return plan
    .flatMap(eventsOf)
    .filter((event) => toMinutes(event.time) <= now)
    .toSorted((a, b) => b.time.localeCompare(a.time))
    .slice(0, FEED_SIZE);
}

function eventsOf(train: PlannedTrain): ScenarioEvent[] {
  const { train: number, track, arrival, departure } = train;
  const passes = toMinutes(departure) - toMinutes(arrival) <= 1;
  if (passes) {
    const text = `${number} проследовал по пути ${track}`;
    return [{ id: `${number}-pass`, time: arrival, text }];
  }
  return [
    {
      id: `${number}-arrival`,
      time: arrival,
      text: `${number} прибыл на путь ${track}`,
    },
    {
      id: `${number}-departure`,
      time: departure,
      text: `${number} отправлен с пути ${track}`,
    },
  ];
}
