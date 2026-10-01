import { toClock } from "@/lib/clock";
import type { PlanSource } from "./activePlan";
import { type Move, OPTION_MOVES, SCENARIO_TRAINS } from "./mock";
import type {
  Neighbors,
  OptionId,
  PlanChange,
  PlannedTrain,
  ReplanOption,
} from "./types";

// Изменения плана по вариантам перепланирования: куда переводит вариант,
// задано в OPTION_MOVES, а время — по плану путей. Без удержания поезд идёт
// по графику; с удержанием ждёт у соседней станции, пока путь не освободится.

// Изменение плана и что оно значит для поезда: с какого пути и сколько ждёт.
export type OptionChange = PlanChange & { fromTrack: number; hold: number };

// Между поездами на одном пути — время на смену.
const GAP_MINUTES = 2;

const SCENARIO_NUMBERS = new Set(SCENARIO_TRAINS.map((train) => train.train));

const NAME: Record<OptionId, string> = {
  none: "Ничего не менять",
  A: "Вариант А",
  B: "Вариант Б",
};

export function optionChanges(
  { plan }: PlanSource,
  option: OptionId,
): OptionChange[] {
  return OPTION_MOVES[option].flatMap((move) => {
    const train = plan.find((item) => item.train === move.train);
    if (train == null) return [];
    const planned = train.arrival;
    const arrival = move.hold ? freeSlot(plan, move, train) : planned;
    return [
      {
        train: move.train,
        track: move.track,
        entryRoute: move.entryRoute,
        exitRoute: move.exitRoute,
        arrival,
        fromTrack: train.track,
        hold: arrival - planned,
      },
    ];
  });
}

// Варианты словами для диспетчера: поезд за поездом.
export function replanOptions(
  source: PlanSource,
  { odd }: Neighbors,
): Record<OptionId, ReplanOption> {
  const option = (id: OptionId): ReplanOption => ({
    id,
    name: NAME[id],
    dncApproval: needsDnc(id) ? "нужно" : id === "none" ? "—" : "не нужно",
    changes: optionChanges(source, id).map((change) => ({
      train: change.train,
      text: changeText(change, odd),
    })),
  });
  return { none: option("none"), A: option("A"), B: option("B") };
}

// Удержание поезда на соседней станции согласует ДНЦ.
export function needsDnc(option: OptionId) {
  return OPTION_MOVES[option].some((move) => move.hold);
}

function changeText(change: OptionChange, odd: string) {
  const { track, arrival, hold, fromTrack } = change;
  return hold > 0
    ? `Удержать на ст. ${odd} ${hold} мин, затем на путь ${track} в ${toClock(arrival)}`
    : `Путь ${fromTrack} → путь ${track}, прибытие ${toClock(arrival)}`;
}

// Первое окно на пути перевода не раньше планового прибытия, где поезд
// простоит свою стоянку и не пересечётся с поездами сценария. Поезда
// симуляции на этом пути ДСП задержит сам — их ожидание покажет прогноз.
function freeSlot(plan: PlannedTrain[], move: Move, train: PlannedTrain) {
  const dwell = train.departure - train.arrival;
  const busy = plan
    .filter(
      (item) =>
        item.track === move.track &&
        item.train !== move.train &&
        SCENARIO_NUMBERS.has(item.train),
    )
    .map((item) => ({ from: item.arrival, to: item.departure }))
    .toSorted((a, b) => a.from - b.from);

  let start = train.arrival;
  for (const span of busy) {
    const overlaps =
      span.from < start + dwell + GAP_MINUTES && start < span.to + GAP_MINUTES;
    if (overlaps) start = span.to + GAP_MINUTES;
  }
  return start;
}
