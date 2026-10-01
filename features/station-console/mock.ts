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

// Стрелка С3 закрыта с обнаружения до возврата в эксплуатацию — по прогнозу
// ремонта. Через неё идут маршруты на пути 3 и 5 со стороны нечётной горловины.
export const FAULT = { switchId: "С3", from: "14:08", until: "14:29" };

// Варианты перепланирования при закрытой С3 как изменения плана путей;
// показатели каждого считаются по прогнозу — см. options.ts.
export function replanOptions({
  odd,
}: Neighbors): Record<OptionId, ReplanOption> {
  const accept101 = {
    train: "101",
    track: 1,
    entryRoute: "Н-1",
    exitRoute: "ЧП-1",
    arrival: "14:15",
    text: "Путь 3 → путь 1 (тоже у платформы), прибытие 14:15",
  };
  return {
    none: {
      id: "none",
      name: "Ничего не менять",
      dncApproval: "—",
      changes: [],
      why: "",
    },
    A: {
      id: "A",
      name: "Вариант А",
      dncApproval: "не нужно",
      changes: [
        accept101,
        {
          train: "2001",
          track: 2,
          entryRoute: "НП-2",
          exitRoute: "Ч-2",
          arrival: "14:18",
          text: "Путь 5 → путь 2 (главный), прибытие по графику 14:18",
        },
      ],
      why: "Решается силами станции, без ДНЦ, и 2001 приходит по графику. Но грузовой стоит на главном пути 2 до 14:40: пассажирский 2236 и грузовой 3308 ждут, пока путь освободится.",
    },
    B: {
      id: "B",
      name: "Вариант Б",
      dncApproval: "нужно",
      changes: [
        accept101,
        {
          train: "2001",
          track: 4,
          entryRoute: "НП-4",
          exitRoute: "Ч-4",
          arrival: "14:27",
          text: `Удержать на ст. ${odd} 9 мин, затем на путь 4 в 14:27`,
        },
      ],
      why: "Рекомендован: конфликтов нет, остальные поезда идут по графику. 2001 ждёт 9 минут на соседней станции, пока путь 4 освободится после 2114. Требует согласования ДНЦ, так как поезд задерживается на соседней станции.",
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
