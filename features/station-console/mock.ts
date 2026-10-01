import type {
  ChosenOption,
  Neighbors,
  OptionId,
  ReplanOption,
  ScenarioEvent,
} from "./types";

// Демо-сценарий «отказ стрелки С3», пока нет симулятора. Время — минуты
// после 14:00; имена соседних станций подставляются по реальной станции.

// Шаги сценария по порядку; номер шага хранится в URL.
export const STEP = {
  normal: 0,
  suspected: 1,
  choosing: 2,
  approval: 3,
  decided: 4,
  repairing: 5,
  repaired: 6,
  restored: 7,
  closed: 8,
} as const;

export const STEP_NAME = [
  "Штатная работа",
  "Подозрение на отказ С3",
  "Выбор варианта",
  "Согласование у ДНЦ",
  "Решение принято",
  "Работы идут",
  "Работы выполнены",
  "Стрелка в работе",
  "Инцидент закрыт",
];

// Минута сценария на каждом шаге.
export const STEP_MINUTE = [5, 8, 9, 10, 11, 16, 27, 29, 32];

export const INCIDENT = {
  id: "И-0417",
  title: "Стрелка С3 потеряла контроль",
  detectedAt: "14:08",
};

export const INCIDENT_STATUS = [
  "Подозрение",
  "Подтверждён",
  "Решение принято",
  "Работы идут",
  "Возвращён в работу",
  "Закрыт",
];

// Статус инцидента на каждом шаге — номер в INCIDENT_STATUS.
export const STEP_INCIDENT_STATUS = [0, 0, 1, 1, 2, 3, 3, 4, 5];

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

export function scenarioEvents(
  option: ChosenOption,
  { odd }: Neighbors,
): ScenarioEvent[] {
  const decision: ScenarioEvent[] =
    option === "B"
      ? [
          {
            step: 3,
            time: "14:10",
            text: "ДСЦС выбрал вариант Б. Запрос согласования ДНЦ",
            incident: true,
          },
          {
            step: 4,
            time: "14:11",
            text: "ДНЦ согласовал вариант Б. ДСЦС обновил план, задачи переданы ДСП",
            level: "normal",
            incident: true,
          },
        ]
      : [
          {
            step: 4,
            time: "14:10",
            text: "ДСЦС выбрал вариант А и обновил план, задачи переданы ДСП",
            level: "normal",
            incident: true,
          },
        ];

  return [
    { step: 0, time: "14:04", text: "3307 проследовал по пути 2" },
    { step: 0, time: "14:05", text: "7015 отправлен с пути 3" },
    {
      step: 0,
      time: "14:06",
      text: "ДНЦ: пассажирский 101 на подходе, прибытие 14:12 на путь 3",
    },
    {
      step: 0,
      time: "14:06",
      text: "ДНЦ: грузовой 2001 на подходе, прибытие 14:18",
    },
    {
      step: 0,
      time: "14:06",
      text: `ДНЦ: на перегоне от ст. ${odd} путь 2 закрыт до 16:00`,
    },
    {
      step: 1,
      time: "14:08",
      text: "Датчик: стрелка С3 потеряла контроль положения",
      level: "critical",
      incident: true,
    },
    {
      step: 1,
      time: "14:08",
      text: "Создан инцидент И-0417 «подозрение». Маршруты через С3 закрыты",
      level: "warning",
      incident: true,
    },
    {
      step: 2,
      time: "14:09",
      text: "ДСП подтвердил неисправность, закрыл С3 и вызвал электромеханика. Рассчитано 2 варианта",
      level: "warning",
      incident: true,
    },
    ...decision,
    {
      step: 5,
      time: "14:12",
      text: "ДСП задал маршрут Н → путь 1 для 101. ДНЦ получил «маршрут готов»",
      level: "normal",
      incident: true,
    },
    {
      step: 5,
      time: "14:13",
      text: "Машинисты 101 и 2001 подтвердили получение",
      incident: true,
    },
    {
      step: 5,
      time: "14:16",
      text: "Электромеханик начал работы на С3",
      incident: true,
    },
    {
      step: 6,
      time: "14:27",
      text: "Работы выполнены, контроль восстановлен. Ждёт возвращения в эксплуатацию ДСП",
      level: "warning",
      incident: true,
    },
    {
      step: 7,
      time: "14:29",
      text: "ДСП вернул С3 в эксплуатацию. ДСЦС обновляет план",
      level: "normal",
      incident: true,
    },
    {
      step: 8,
      time: "14:32",
      text: "Остаток плана возвращён к исходному. Инцидент закрыт",
      level: "normal",
      incident: true,
    },
  ];
}
