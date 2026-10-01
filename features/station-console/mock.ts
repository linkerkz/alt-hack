import type { OptionId, PlannedTrain } from "./types";

// Демо-сценарий «предмет в стрелке С3». Ход инцидента — в базе, время —
// реальные часы, остальные поезда — из симуляции. Здесь только то, что
// сценарий задаёт сам: шаги, поезда, которых касается сбой, и какие пути
// предлагают варианты. Время — минуты от обнаружения сбоя (t0).

// Шаги сценария по порядку; номер шага хранится в URL.
export const STEP = {
  normal: 0,
  suspected: 1,
  dispatched: 2,
  escalated: 3,
  choosing: 4,
  approval: 5,
  decided: 6,
  repairing: 7,
  repaired: 8,
  restored: 9,
  closed: 10,
} as const;

// Код инцидента, пока в базе его нет.
export const INCIDENT = { id: "И-0417" };

// Стрелка С3 закрыта с обнаружения до возврата в эксплуатацию — по прогнозу
// ремонта. Через неё идут маршруты на пути 3 и 5 со стороны нечётной горловины.
export const FAULT = { switchId: "С3", repairMinutes: 21 };

// Поезда сценария подходят к станции, когда камера замечает предмет: 101 и
// 2001 идут на пути через С3, 2114 держит путь 4, 2236 — главный путь 2.
// Остальные поезда плана — из симуляции, вокруг этих. Время здесь — минуты
// от t0, а не от полуночи.
export const SCENARIO_TRAINS: PlannedTrain[] = [
  {
    train: "2114",
    kind: "freight",
    track: 4,
    entryRoute: "НП-4",
    exitRoute: "Ч-4",
    arrival: -28,
    departure: 16,
  },
  {
    train: "101",
    kind: "passenger",
    track: 3,
    entryRoute: "Н-3",
    exitRoute: "ЧП-3",
    arrival: 4,
    departure: 12,
  },
  {
    train: "2001",
    kind: "freight",
    track: 5,
    entryRoute: "Н-5",
    exitRoute: "ЧП-5",
    arrival: 10,
    departure: 32,
  },
  {
    train: "2236",
    kind: "passenger",
    track: 2,
    entryRoute: "Ч-2",
    exitRoute: "НП-2",
    arrival: 18,
    departure: 21,
  },
];

// Варианты перепланирования при закрытой С3: куда переводят поезда. Время
// прибытия считает replan.ts по плану: без удержания — по графику, с
// удержанием у соседней станции — когда путь освободится.
const ACCEPT_101: Move = {
  train: "101",
  track: 1,
  entryRoute: "Н-1",
  exitRoute: "ЧП-1",
  hold: false,
};

export const OPTION_MOVES: Record<OptionId, Move[]> = {
  none: [],
  A: [
    ACCEPT_101,
    {
      train: "2001",
      track: 2,
      entryRoute: "НП-2",
      exitRoute: "Ч-2",
      hold: false,
    },
  ],
  B: [
    ACCEPT_101,
    {
      train: "2001",
      track: 4,
      entryRoute: "НП-4",
      exitRoute: "Ч-4",
      hold: true,
    },
  ],
};

// Перевод поезда на другой путь; hold — удержать у соседней станции, пока
// путь не освободится (нужно согласование ДНЦ).
export type Move = {
  train: string;
  track: number;
  entryRoute: string;
  exitRoute: string;
  hold: boolean;
};
