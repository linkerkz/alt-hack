// Что показывает пульт: шаг сценария, выбранный вариант, вкладка панели.
// Всё хранится в URL, чтобы экран открывался в том же состоянии.
export type ConsoleState = {
  step: number;
  option: ChosenOption;
  tab: ConsoleTab;
  // Фокус на инциденте: остальная станция приглушена.
  focus: boolean;
  // Правая панель (обзор, инцидент) открыта; свёрнутая — освобождает место схеме.
  panel: boolean;
  // Задачи ДСП, которые он уже выполнил на шаге «Решение принято».
  done: RouteTask[];
  // Открыт диалог «Вернуть стрелку в эксплуатацию».
  confirm: boolean;
};

// Роль, для которой собран пульт: правая панель у ДСЦС и ДСП разная.
export type ConsoleRole = "dscs" | "dsp";

// Приём поезда по новому плану: id задачи ДСП и поезда.
export type RouteTask = "r101" | "r2001";

// Действие кнопки: что поменять в состоянии пульта.
export type ActionLink = { label: string; patch: Partial<ConsoleState> };

// Вариант перепланирования; none — исходный сценарий «ничего не менять».
export type OptionId = "none" | ChosenOption;
export type ChosenOption = "A" | "B";

export type ConsoleTab = "overview" | "incident";

export type Status = "normal" | "warning" | "critical";

// Соседние станции: нечётная горловина — от кого поезда идут к нам, чётная — к кому.
export type Neighbors = { odd: string; even: string };

export type ScenarioEvent = {
  step: number;
  time: string;
  text: string;
  level?: Status;
  // Событие относится к инциденту и попадает в его хронологию.
  incident?: boolean;
};

export type ReplanOption = {
  id: OptionId;
  name: string;
  // Показатели индекса после варианта — в порядке METRICS.
  values: number[];
  index: number;
  maxDelay: number;
  passengerDelay: number;
  dncApproval: string;
  changes: { train: string; text: string }[];
  why: string;
};
