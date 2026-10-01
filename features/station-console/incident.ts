import type { ChainState } from "./chain";
import { type Detection, detectionOf } from "./detection";
import {
  baselineEvents,
  INCIDENT,
  INCIDENT_STATUS,
  replanOptions,
  STEP,
  STEP_INCIDENT_STATUS,
} from "./mock";
import { routeDone } from "./routing";
import { snapshotOf } from "./snapshot";
import type {
  Command,
  ConsoleState,
  Live,
  LiveWorkOrder,
  Neighbors,
  ScenarioEvent,
  Status,
} from "./types";

// Карточка инцидента для ДСЦС: что делать сейчас, кто чем занят, хронология.

export type ConsoleAction = {
  text: string;
  primary?: CommandLink;
  secondary?: CommandLink;
  // Решение за другим участником — ДСЦС ждёт.
  waiting?: string;
  // Показать ссылку на карту участка: следить за поездами у соседей.
  showMap?: boolean;
};

type CommandLink = { label: string; command: Command };

export function incidentCard(
  state: ConsoleState,
  neighbors: Neighbors,
  live: Live,
) {
  const { step } = state;
  const statusIndex = STEP_INCIDENT_STATUS[step];
  const incidentId = live.incident?.id;
  const feed: ScenarioEvent[] = [...live.events, ...baselineEvents(neighbors)];
  const detection = detectionOf(live.incident);

  return {
    code: live.incident?.code ?? INCIDENT.id,
    detection,
    snapshot: snapshotOf(live.incident),
    analysis: live.incident?.analysis ?? null,
    isActive: step >= STEP.suspected && step <= STEP.restored,
    statusName: INCIDENT_STATUS[statusIndex],
    statusSteps: INCIDENT_STATUS.map((label, i) => ({
      label,
      state: progressOf(i, statusIndex),
    })),
    dncBadge: dncBadgeAt(state),
    suggestion: suggestionAt(step, neighbors),
    action: actionAt(state, neighbors),
    tasks: tasksAt(state, neighbors, live.workOrder, detection),
    events: live.events.filter((event) => event.incidentId === incidentId),
    feed,
  };
}

function dncBadgeAt({ step, option }: ConsoleState) {
  if (option !== "B" || step < STEP.approval) return "";
  return step === STEP.approval ? "▲ Ждёт ДНЦ" : "● ДНЦ согласовал 14:11";
}

function suggestionAt(step: number, { odd }: Neighbors) {
  if (step <= STEP.choosing) {
    return `Система предлагает вариант Б: 101 на путь 1, 2001 удержать на ст. ${odd}.`;
  }
  if (step === STEP.approval) return "Вариант Б ждёт согласования ДНЦ.";
  if (step <= STEP.repairing) return "Решение принято, идут работы.";
  if (step === STEP.repaired) {
    return "Работы выполнены. Ждёт возвращения в эксплуатацию ДСП.";
  }
  return "Предложено вернуться к исходному плану.";
}

function actionAt(state: ConsoleState, neighbors: Neighbors): ConsoleAction {
  const { step, option } = state;
  const name = replanOptions(neighbors)[option].name.toLowerCase();
  const needsDnc = option === "B";

  switch (step) {
    case STEP.suspected:
      return {
        text: "Система обнаружила проблему автоматически. Проверка ушла ДСП: после подтверждения неисправности варианты станут активными.",
        waiting: "Ждёт подтверждения ДСП",
      };
    case STEP.choosing:
      return {
        text: `Выбран ${name}. ${needsDnc ? "После выбора запрос уйдёт ДНЦ на согласование." : "Согласование ДНЦ не требуется."}`,
        primary: {
          label: `Принять ${name}`,
          command: { kind: "accept", option },
        },
      };
    case STEP.approval:
      return {
        text: "Вариант Б отправлен поездному диспетчеру. После согласования план обновится, ДСП получит задачи.",
        waiting: "Ждёт согласования ДНЦ",
        showMap: true,
      };
    case STEP.decided: {
      const routed = routeDone(state);
      if (routed.r101 && routed.r2001) {
        return {
          text: "ДСП задал маршруты по новому плану. ДНЦ получил «маршрут готов», машинисты уведомлены.",
        };
      }
      return {
        text: "План обновлён. Задачи переданы ДСП: приём поездов по новому плану.",
        waiting: "Ждёт подтверждения ДСП",
      };
    }
    case STEP.repairing:
      return {
        text: "Идут работы на С3. Стрелка закрыта, пока ДСП не вернёт её в эксплуатацию.",
      };
    case STEP.repaired:
      return {
        text: "Ремонтная служба сообщила, что работы выполнены. Вернуть С3 в эксплуатацию может только ДСП, после этого вы обновите план.",
        waiting: "Ждёт решения ДСП",
      };
    case STEP.restored:
      return {
        text: "С3 снова в работе. Система предлагает вернуть оставшиеся поезда к исходному плану: 2236 на путь 2 в 14:26 уже по графику, пути 3 и 5 снова доступны.",
        primary: {
          label: "Вернуться к исходному плану",
          command: { kind: "close", keepPlan: false },
        },
        secondary: {
          label: "Оставить текущий план",
          command: { kind: "close", keepPlan: true },
        },
      };
    default:
      return { text: "Инцидент закрыт. Отчёт сформирован автоматически." };
  }
}

function tasksAt(
  state: ConsoleState,
  { odd }: Neighbors,
  workOrder: LiveWorkOrder | null,
  detection: Detection,
) {
  const { step, option } = state;
  const tasks: { who: string; what: string; status: string; tone: Status }[] =
    [];
  const isB = option === "B";
  const routed = routeDone(state);
  // Машинисты подтверждают, когда ДСП принял оба поезда.
  const acknowledged = routed.r101 && routed.r2001;
  const pending = { status: "Ожидает…", tone: "warning" as const };

  if (isB && step >= STEP.approval) {
    tasks.push({
      who: "ДНЦ",
      what: "Согласование варианта Б",
      ...(step === STEP.approval
        ? pending
        : { status: "Согласовано 14:11", tone: "normal" }),
    });
  }
  if (step < STEP.decided) return tasks;

  const done = (status: string) => ({ status, tone: "normal" as const });
  tasks.push(
    {
      who: "ДСП",
      what: "Приём 101 на путь 1",
      ...(routed.r101 ? done("Маршрут задан 14:12") : pending),
    },
    {
      who: "ДСП",
      what: isB
        ? "Приём 2001 на путь 4 в 14:27"
        : "Приём 2001 на путь 1 в 14:32",
      ...(routed.r2001 ? done("Подтвердил") : pending),
    },
    {
      who: "Машинист 101",
      what: "Приём на путь 1",
      ...(acknowledged
        ? done("Подтвердил")
        : { status: "Уведомлён", tone: "warning" }),
    },
    {
      who: "Машинист 2001",
      what: isB ? `Стоянка на ст. ${odd} ≈ 9 мин` : "Ожидание у входного Н",
      ...(acknowledged
        ? done("Подтвердил")
        : { status: "Уведомлён", tone: "warning" }),
    },
    {
      who: detection.crew,
      what: detection.workOrder.title,
      status: repairStatusOf(workOrder),
      tone: step >= STEP.restored ? "normal" : "warning",
    },
  );
  return tasks;
}

// Этап наряда: служба взяла его в работу сама, по QR.
function repairStatusOf(workOrder: LiveWorkOrder | null) {
  const status = workOrder?.status;
  if (workOrder == null || status === "issued") return "Наряд выдан, не взят";
  if (status === "in_progress") {
    return `В работе · ${workOrder.checked} из ${workOrder.total}`;
  }
  if (status === "done") return "Выполнено, ждёт ДСП";
  return "Закрыта";
}

function progressOf(index: number, current: number): ChainState {
  if (index < current) return "done";
  return index === current ? "current" : "todo";
}
