// Что показывает пульт. Ход инцидента (шаг, принятый вариант, принятые ДСП
// поезда) приходит из базы; вид экрана (вкладка, фокус, панель, диалог и
// вариант, который ДСЦС пока только смотрит) — из URL.
export type ConsoleState = {
  step: number;
  option: ChosenOption;
  tab: ConsoleTab;
  // Фокус на инциденте: остальная станция приглушена.
  focus: boolean;
  // Правая панель (обзор, инцидент) открыта; свёрнутая — освобождает место схеме.
  panel: boolean;
  // Поезда, приём которых ДСП уже подтвердил по новому плану.
  done: RouteTask[];
  // Открыт диалог «Вернуть стрелку в эксплуатацию».
  confirm: boolean;
};

// Роль, для которой собран пульт: правая панель у ДСЦС и ДСП разная.
export type ConsoleRole = "dscs" | "dsp";

// Приём поезда по новому плану: id задачи ДСП и поезда.
export type RouteTask = "r101" | "r2001";

// Ход сценария в базе: последний инцидент станции, его наряд и хронология.
export type Live = {
  incident: LiveIncident | null;
  workOrder: LiveWorkOrder | null;
  // Хронология станции, свежие сверху.
  events: JournalEvent[];
};

export type LiveIncident = {
  id: string;
  code: string;
  status: IncidentStatus;
  option: ChosenOption | null;
  routeTasks: RouteTask[];
  detection: DetectionKind;
  // Снимок с камеры в момент обнаружения (data URL); null — без снимка.
  snapshot: string | null;
};

// Чем обнаружена проблема: датчиком ЭЦ или камерой в горловине.
export type DetectionKind = "sensor" | "camera";

// Совпадает с enum public.incident_status.
export type IncidentStatus =
  | "suspected"
  | "confirmed"
  | "decided"
  | "repairing"
  | "restored"
  | "closed";

export type LiveWorkOrder = {
  id: string;
  status: WorkOrderStatus;
  // Отмечено пунктов чеклиста из общего числа.
  checked: number;
  total: number;
  startedAt: string | null;
  doneAt: string | null;
  resultNote: string | null;
};

// Совпадает с enum public.work_order_status.
export type WorkOrderStatus = "issued" | "in_progress" | "done" | "returned";

export type JournalEvent = ScenarioEvent & {
  // Порядок записи: время симуляции у повторных инцидентов совпадает.
  id: number;
  // Событие инцидента; null — событие станции.
  incidentId: string | null;
};

// Команда пульта: действие участника, которое меняет ход инцидента в базе.
// Команды датчика, ДНЦ и службы — симуляция участников без своего экрана.
export type Command =
  | { kind: "detect" }
  | { kind: "confirm" }
  | { kind: "dismiss" }
  | { kind: "accept"; option: ChosenOption }
  | { kind: "approve" }
  | { kind: "route"; task: RouteTask }
  | { kind: "startWork" }
  | { kind: "finishWork" }
  | { kind: "restore" }
  | { kind: "close"; keepPlan: boolean }
  | { kind: "advance" }
  | { kind: "reset" };

export type CommandResult = { error: string | null };

// Кнопка задачи: команда в базу или смена вида пульта (открыть диалог).
export type ActionLink =
  | { label: string; command: Command }
  | { label: string; patch: Partial<ConsoleState> };

// Вариант перепланирования; none — исходный сценарий «ничего не менять».
export type OptionId = "none" | ChosenOption;
export type ChosenOption = "A" | "B";

export type ConsoleTab = "overview" | "incident";

export type Status = "normal" | "warning" | "critical";

// Соседние станции: нечётная горловина — от кого поезда идут к нам, чётная — к кому.
export type Neighbors = { odd: string; even: string };

// Событие ленты: время симуляции «14:08», текст и уровень.
export type ScenarioEvent = {
  time: string;
  text: string;
  level?: Status;
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
