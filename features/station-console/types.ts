// Что показывает пульт. Ход инцидента (шаг, принятый вариант, принятые ДСП
// поезда) приходит из базы; вид экрана (вкладка, фокус, панель и вариант,
// который ДСЦС пока только смотрит) — из URL.
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
};

// Роль, которая отдаёт команды с пульта: правая панель у ДСЦС и ДСП разная.
export type ConsoleRole = "dscs" | "dsp";

// Кто смотрит пульт: диспетчеры станции, ДНЦ её круга или начальник
// станции ДС. ДНЦ и ДС видят то же, что ДСЦС, но без команд: ДНЦ отвечает
// на запросы с карты участка, ДС только наблюдает за своей станцией.
export type ConsoleViewer = ConsoleRole | "dnc" | "ds";

// Приём поезда по новому плану: id задачи ДСП и поезда.
export type RouteTask = "r101" | "r2001";

// Ход сценария в базе: последний инцидент станции, его наряд, сообщения
// пейджера бригады и хронология.
export type Live = {
  incident: LiveIncident | null;
  workOrder: LiveWorkOrder | null;
  // Сообщения пейджера станции, свежие сверху.
  pager: PagerMessage[];
  // План путей станции: по нему пульт предлагает поручения бригаде и
  // считает индекс эффективности.
  plan: PlannedTrain[];
  layout: StationLayout;
  // Время станции — реальные часы, минуты от полуночи.
  now: number;
  // Обнаружение сбоя (t0), минуты от полуночи: от него идёт сценарий;
  // null — сценария нет, план только из симуляции.
  anchor: number | null;
  // Хронология станции, свежие сверху.
  events: JournalEvent[];
};

export type LiveIncident = {
  id: string;
  code: string;
  status: IncidentStatus;
  option: ChosenOption | null;
  routeTasks: RouteTask[];
  // ДНЦ отклонил вариант Б: ДСЦС снова выбирает вариант.
  dncRejected: boolean;
  // Комментарий ДНЦ для станции к согласованию или отказу.
  dncComment: string | null;
  // Вывод ИИ по снимку; null — без анализа.
  analysis: string | null;
  // Когда камера обнаружила сбой, ISO.
  detectedAt: string;
};

// Совпадает с enum public.incident_status.
export type IncidentStatus =
  | "suspected"
  | "dispatched"
  | "escalated"
  | "confirmed"
  | "decided"
  | "repairing"
  | "restored"
  | "closed";

export type LiveWorkOrder = {
  id: string;
  title: string;
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

// Сообщение пейджера бригады: вызов по инциденту или обычная задача ДСП.
export type PagerMessage = {
  id: string;
  // Инцидент вызова; null — обычная задача.
  incidentId: string | null;
  // Операция плана, по которой поручение: «101-arrival»; null — не по плану.
  operation: string | null;
  text: string;
  status: PagerMessageStatus;
};

// Совпадает с enum public.pager_message_status.
export type PagerMessageStatus =
  | "sent"
  | "accepted"
  | "done"
  | "escalated"
  | "cancelled";

// Поезд в плане путей станции: путь, маршруты приёма и отправления, время «14:12».
export type PlannedTrain = {
  train: string;
  kind: "passenger" | "freight";
  track: number;
  entryRoute: string;
  exitRoute: string;
  arrival: string;
  departure: string;
};

// Устройство станции для расчёта индекса и живого плана: пути, маршруты со
// стрелками и поезда, за которыми закреплены бригады.
export type StationLayout = {
  tracks: { number: number; kind: TrackKind; hasPlatform: boolean }[];
  routes: { id: string; track: number; throat: Throat; switches: string[] }[];
  crewTrains: string[];
};

// Совпадает с enum public.throat: нечётная / чётная горловина.
export type Throat = "odd" | "even";

// Совпадает с enum public.track_kind.
export type TrackKind = "main" | "receiving" | "dead_end";

export type JournalEvent = ScenarioEvent & {
  // Порядок записи: время симуляции у повторных инцидентов совпадает.
  id: number;
  // Событие инцидента; null — событие станции.
  incidentId: string | null;
};

// Команда пульта: действие участника, которое меняет ход инцидента в базе.
// Инцидент открывает только камера. Ответ путейцев и работы бригады —
// симуляция для «Далее»: у них свои экраны (пейджер, чеклист по QR). ДНЦ
// отвечает с карты сети, а «Далее» на демо-пульте согласует за него.
export type Command =
  | { kind: "callCrew" }
  | { kind: "dismiss" }
  | { kind: "escalate" }
  | { kind: "callRepair" }
  | { kind: "planWork" }
  | { kind: "accept"; option: ChosenOption }
  | ApprovalAnswer
  | { kind: "route"; task: RouteTask }
  | { kind: "startWork" }
  | { kind: "finishWork" }
  | { kind: "restore" }
  | { kind: "close"; keepPlan: boolean }
  | { kind: "assign"; operation: string }
  | { kind: "note"; text: string }
  | { kind: "advance" }
  | { kind: "reset" };

// Ответ ДНЦ на запрос на согласование; reconsider — вернуть отклонённый
// запрос на рассмотрение, пока ДСЦС не выбрал другой вариант.
export type ApprovalAnswer =
  | { kind: "approve"; comment: string | null }
  | { kind: "reject"; comment: string | null }
  | { kind: "reconsider" };

export type CommandResult = { error: string | null };

// Вариант перепланирования; none — исходный сценарий «ничего не менять».
export type OptionId = "none" | ChosenOption;
export type ChosenOption = "A" | "B";

export type ConsoleTab = "overview" | "incident";

export type Status = "normal" | "warning" | "critical";

// Соседние станции: нечётная горловина — от кого поезда идут к нам, чётная — к кому.
export type Neighbors = { odd: string; even: string };

// Событие ленты: время станции «14:08», текст и уровень. id — ключ строки:
// время и текст повторяются (камера дважды за минуту сообщила «свободно»).
export type ScenarioEvent = {
  id: number | string;
  time: string;
  text: string;
  level?: Status;
};

// Вариант перепланирования словами для диспетчера. Сами изменения плана
// считает replan.ts; показатели — по ним.
export type ReplanOption = {
  id: OptionId;
  name: string;
  dncApproval: string;
  changes: { train: string; text: string }[];
};

// Изменение плана одного поезда: новый путь, маршруты и прибытие; стоянка та же.
export type PlanChange = {
  train: string;
  track: number;
  entryRoute: string;
  exitRoute: string;
  arrival: string;
};
