// Что показывает пульт: шаг сценария, выбранный вариант, вкладка панели.
// Всё хранится в URL, чтобы экран открывался в том же состоянии.
export type ConsoleState = {
  step: number;
  option: ChosenOption;
  tab: ConsoleTab;
  // Фокус на инциденте: остальная станция приглушена.
  focus: boolean;
};

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
