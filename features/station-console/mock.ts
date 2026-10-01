import type { Neighbors, OptionId, ReplanOption, ScenarioEvent } from "./types";

// Демо-сценарий «предмет в стрелке С3», пока нет симулятора. Ход инцидента —
// в базе, а здесь — что показывать на каждом шаге. Время — минуты после
// 14:00; имена соседних станций подставляются по реальной станции.

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

// Минута сценария на каждом шаге.
export const STEP_MINUTE = [5, 8, 8, 9, 9, 10, 11, 16, 27, 29, 32];

// Тексты инцидента: что увидела камера и что нашли путейцы — см. fault.ts.
export const INCIDENT = {
  id: "И-0417",
  detectedAt: "14:08",
};

// Показатели индекса: каждый даёт до MAX_SCORE баллов из 100.
export const MAX_SCORE = 20;

export const METRICS = [
  { label: "Пропускная способность", unit: "%" },
  { label: "Отклонение от графика", unit: " мин" },
  { label: "Загрузка путей", unit: "%" },
  { label: "Конфликты маршрутов", unit: "" },
  { label: "Простой ресурсов", unit: " мин" },
];

// Значения показателей и их оценки на каждом шаге сценария.
export const METRIC_VALUES = [
  { values: [100, 0.5, 58, 0, 2], scores: [20, 19, 18, 20, 15] },
  { values: [96, 4.2, 74, 2, 6], scores: [19, 14, 14, 16, 15] },
  { values: [96, 4.2, 74, 2, 6], scores: [19, 14, 14, 16, 15] },
  { values: [96, 4.2, 74, 2, 6], scores: [19, 14, 14, 16, 15] },
  { values: [96, 4.2, 74, 2, 6], scores: [19, 14, 14, 16, 15] },
  { values: [95, 4.8, 72, 2, 8], scores: [19, 13, 14, 16, 15] },
  { values: [97, 3.1, 68, 0, 7], scores: [19, 15, 15, 20, 11] },
  { values: [97, 3.1, 68, 0, 7], scores: [19, 15, 15, 20, 11] },
  { values: [97, 2.8, 66, 0, 6], scores: [19, 16, 15, 20, 11] },
  { values: [98, 2.1, 60, 0, 4], scores: [19, 17, 17, 20, 13] },
  { values: [99, 1.2, 58, 0, 3], scores: [20, 18, 18, 20, 14] },
];

// Индекс до инцидента — с ним сравниваем текущий.
export const BASELINE = { index: 92, time: "14:05" };

export function replanOptions({
  odd,
}: Neighbors): Record<OptionId, ReplanOption> {
  const accept101 = {
    train: "101",
    text: "Путь 3 → путь 1 (тоже у платформы), прибытие 14:15",
  };
  return {
    none: {
      id: "none",
      name: "Ничего не менять",
      values: [82, 19, 88, 3, 24],
      index: 48,
      maxDelay: 25,
      passengerDelay: 22,
      dncApproval: "—",
      changes: [],
      why: "",
    },
    A: {
      id: "A",
      name: "Вариант А",
      values: [92, 7.5, 78, 0, 14],
      index: 71,
      maxDelay: 14,
      passengerDelay: 3,
      dncApproval: "не нужно",
      changes: [
        accept101,
        { train: "2001", text: "Путь 5 → путь 1, ждёт у входного Н до 14:32" },
      ],
      why: "Решается силами станции, без ДНЦ. Но грузовой 14 минут стоит у входного и затем занимает главный путь 1: растут отклонение и простой бригады.",
    },
    B: {
      id: "B",
      name: "Вариант Б",
      values: [96, 4.1, 70, 0, 9],
      index: 79,
      maxDelay: 9,
      passengerDelay: 3,
      dncApproval: "нужно",
      changes: [
        accept101,
        {
          train: "2001",
          text: `Удержать на ст. ${odd} 9 мин, затем на путь 4 в 14:27`,
        },
      ],
      why: "Рекомендован: максимальная задержка 9 мин против 14 у варианта А, главный путь 1 остаётся свободным для 3412 в 14:35. Требует согласования ДНЦ, так как поезд задерживается на соседней станции.",
    },
  };
}

// Лента станции до инцидента: штатная работа по графику.
export function baselineEvents({ odd }: Neighbors): ScenarioEvent[] {
  const events = [
    {
      time: "14:06",
      text: `ДНЦ: на перегоне от ст. ${odd} путь 2 закрыт до 16:00`,
    },
    { time: "14:06", text: "ДНЦ: грузовой 2001 на подходе, прибытие 14:18" },
    {
      time: "14:06",
      text: "ДНЦ: пассажирский 101 на подходе, прибытие 14:12 на путь 3",
    },
    { time: "14:05", text: "7015 отправлен с пути 3" },
    { time: "14:04", text: "3307 проследовал по пути 2" },
  ];
  return events.map((event, index) => ({ ...event, id: `baseline-${index}` }));
}

// Запрос на согласование варианта Б для ДНЦ: время запроса и ответа,
// поезда, которых касается удержание, — задержка с удержанием и без.
export const APPROVAL = {
  requestedAt: "14:10",
  approvedAt: "14:11",
  unchanged: "3412 и 2236 без изменений",
};

export function approvalTrains({ odd }: Neighbors) {
  return [
    {
      train: "2001",
      kind: "груз.",
      what: `стоянка на ст. ${odd} до 14:20`,
      withHold: 9,
      without: 14,
    },
    {
      train: "2402",
      kind: "груз.",
      what: `ждёт у входного ст. ${odd}`,
      withHold: 7,
      without: 13,
    },
  ];
}
