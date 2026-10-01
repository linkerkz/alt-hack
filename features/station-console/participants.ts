import { REPAIR } from "./fault";
import { STEP } from "./mock";
import { routeDone } from "./routing";
import type {
  ConsoleState,
  Live,
  LiveWorkOrder,
  Neighbors,
  PagerMessage,
  Status,
} from "./types";

// Участники инцидента и что с их частью работы: путейцы, ДНЦ, ДСП,
// машинисты, ремонтная бригада. Появляются по мере того, как их зовут.

export type Participant = {
  who: string;
  what: string;
  status: string;
  tone: Status;
};

const PENDING = { status: "Ожидает", tone: "warning" } as const;

export function participantsOf(
  state: ConsoleState,
  { odd }: Neighbors,
  { incident, workOrder, pager }: Live,
) {
  const { step, option } = state;
  const list: Participant[] = [];
  const call = pager.find((message) => message.incidentId === incident?.id);
  if (call != null) {
    list.push({
      who: "Путейцы",
      what: "Убрать предмет из С3",
      ...crewOf(call),
    });
  }
  if (incident?.dncRejected && step === STEP.choosing) {
    list.push({
      who: "ДНЦ",
      what: "Согласование варианта Б",
      status: "Отклонено",
      tone: "critical",
    });
  }
  if (option === "B" && step >= STEP.approval) {
    list.push({
      who: "ДНЦ",
      what: "Согласование варианта Б",
      ...(step === STEP.approval ? PENDING : done("Согласовано 14:11")),
    });
  }
  if (step >= STEP.decided) {
    list.push(...trainParticipants(state, odd));
  }
  if (step >= STEP.choosing) {
    list.push({
      who: REPAIR.crew,
      what: workOrder?.title ?? REPAIR.objective,
      status: repairStatusOf(workOrder),
      tone: step >= STEP.restored ? "normal" : "warning",
    });
  }
  return list;
}

// ДСП принимает поезда, машинисты подтверждают, когда приняты оба.
function trainParticipants(state: ConsoleState, odd: string): Participant[] {
  const isB = state.option === "B";
  const routed = routeDone(state);
  const acknowledged = routed.r101 && routed.r2001;
  const driver = acknowledged
    ? done("Подтвердил")
    : { status: "Уведомлён", tone: "warning" as const };
  return [
    {
      who: "ДСП",
      what: "Приём 101 на путь 1",
      ...(routed.r101 ? done("Маршрут задан") : PENDING),
    },
    {
      who: "ДСП",
      what: isB
        ? "Приём 2001 на путь 4 в 14:27"
        : "Приём 2001 на путь 1 в 14:32",
      ...(routed.r2001 ? done("Подтверждён") : PENDING),
    },
    { who: "Машинист 101", what: "Приём на путь 1", ...driver },
    {
      who: "Машинист 2001",
      what: isB ? `Стоянка на ст. ${odd} ≈ 9 мин` : "Ожидание у входного Н",
      ...driver,
    },
  ];
}

function done(status: string) {
  return { status, tone: "normal" as const };
}

// Ответ путейцев на вызов с пейджера.
function crewOf({ status }: PagerMessage): Omit<Participant, "who" | "what"> {
  if (status === "sent") return { status: "Вызов отправлен", tone: "warning" };
  if (status === "accepted") return { status: "Идут к С3", tone: "warning" };
  if (status === "escalated")
    return { status: "Нужен ремонт", tone: "critical" };
  if (status === "cancelled") return done("Отбой: камера");
  return done("Предмет убран");
}

// Этап наряда: бригада берёт его в работу сама, по QR.
function repairStatusOf(workOrder: LiveWorkOrder | null) {
  if (workOrder == null) return "Вызвана, ждёт план работ";
  const { status } = workOrder;
  if (status === "issued") return "Наряд выдан, не взят";
  if (status === "in_progress") {
    return `В работе · ${workOrder.checked} из ${workOrder.total}`;
  }
  if (status === "done") return "Выполнено, ждёт ДСП";
  return "Закрыта";
}
