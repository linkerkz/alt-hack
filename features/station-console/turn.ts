import { toClock } from "@/lib/clock";
import { REPAIR } from "./fault";
import { STEP } from "./mock";
import { type OptionChange, optionChanges, replanOptions } from "./replan";
import { routeDone } from "./routing";
import type {
  Command,
  ConsoleRole,
  ConsoleState,
  Live,
  LiveIncident,
  LiveWorkOrder,
  Neighbors,
} from "./types";

// Чей ход в инциденте и что ему сделать. Кнопки видит только хозяин хода,
// остальные — кого и чего ждём. Путейцы и ремонтная бригада отвечают со
// своих экранов (пейджер, чеклист по QR), поэтому кнопок на пульте у них нет.

export type Turn = {
  owner: TurnOwner;
  title: string;
  text: string;
  // Задачи хода по отдельности: у ДСП после решения их несколько.
  items: TurnItem[];
  buttons: CommandLink[];
  // Ход с особой формой: выбор варианта (ДСЦС) или ответ ДНЦ.
  form: "option" | "approval" | null;
  // Что видят остальные: «Ждём ДНЦ: согласование варианта Б».
  waiting: string;
};

// ДС ход не получает: он только наблюдает за пультом.
export type TurnOwner = ConsoleRole | "dnc" | "crew" | "repair";

export type TurnItem = {
  text: string;
  // Итог выполненной задачи; null — ещё не выполнена.
  result: string | null;
  action: CommandLink | null;
};

export type CommandLink = { label: string; command: Command };

const WHO: Record<TurnOwner, string> = {
  dsp: "ДСП",
  dscs: "ДСЦС",
  dnc: "ДНЦ",
  crew: "путейцев",
  repair: "ремонтную бригаду",
};

type Draft = Omit<Turn, "items" | "buttons" | "form" | "waiting"> &
  Partial<Pick<Turn, "items" | "buttons" | "form">> & { what: string };

// Ход на шаге сценария; null — инцидента нет или он закрыт.
export function turnOf(
  state: ConsoleState,
  live: Live,
  neighbors: Neighbors,
): Turn | null {
  const draft = draftOf(state, live, neighbors);
  if (draft == null) return null;
  const { what, ...turn } = draft;
  return {
    items: [],
    buttons: [],
    form: null,
    ...turn,
    waiting: `Ждём ${WHO[turn.owner]}: ${what}`,
  };
}

function draftOf(
  state: ConsoleState,
  live: Live,
  neighbors: Neighbors,
): Draft | null {
  const { incident } = live;
  switch (state.step) {
    case STEP.suspected:
      return {
        owner: "dsp",
        what: "проверка снимка камеры",
        title: "Проверьте снимок камеры",
        text: "Камера видит предмет у остряка С3, маршруты через стрелку закрыты. Предмет есть — вызовите путейцев на пейджер.",
        buttons: [
          { label: "Вызвать путейцев", command: { kind: "callCrew" } },
          { label: "Ложная тревога", command: { kind: "dismiss" } },
        ],
      };
    case STEP.dispatched:
      return {
        owner: "crew",
        what: "ответ с пейджера",
        title: "Путейцы идут к С3",
        text: `${crewText(live)} Уберут предмет — камера увидит это и закроет инцидент сама.`,
      };
    case STEP.escalated:
      return {
        owner: "dsp",
        what: "вызов ремонтной бригады",
        title: "Стрелка повреждена — вызовите ремонтную бригаду",
        text: "Путейцы убрали предмет, но остряк повреждён. После вызова ДСЦС выберет вариант перепланирования, план работ — после решения.",
        buttons: [
          {
            label: "Вызвать ремонтную бригаду",
            command: { kind: "callRepair" },
          },
        ],
      };
    case STEP.choosing:
      return incident?.dncRejected ? rejected(incident) : choosing(state);
    case STEP.approval:
      return approval(live, neighbors);
    case STEP.decided:
    case STEP.repairing:
    case STEP.repaired:
      return afterDecision(state, live);
    case STEP.restored:
      return {
        owner: "dscs",
        what: "закрытие инцидента",
        title: "С3 в работе — закройте инцидент",
        text: "Пути 3 и 5 снова доступны. Система предлагает вернуть остаток плана к исходному.",
        buttons: [
          {
            label: "Вернуться к исходному плану",
            command: { kind: "close", keepPlan: false },
          },
          {
            label: "Оставить текущий план",
            command: { kind: "close", keepPlan: true },
          },
        ],
      };
    default:
      return null;
  }
}

function crewText({ incident, pager }: Live) {
  const call = pager.find((message) => message.incidentId === incident?.id);
  return call?.status === "accepted"
    ? "Вызов принят, путейцы идут к стрелке."
    : "Вызов на пейджере, путейцы ещё не ответили.";
}

function choosing(state: ConsoleState): Draft {
  return {
    owner: "dscs",
    what: "выбор варианта перепланирования",
    title: "Выберите вариант перепланирования",
    text: "Стрелка закрыта до ремонта. Сравните варианты ниже, на схеме — пунктиром.",
    form: "option",
    buttons: [
      {
        label: `Принять вариант ${state.option === "A" ? "А" : "Б"}`,
        command: { kind: "accept", option: state.option },
      },
    ],
  };
}

// ДНЦ отклонил Б: станция принимает А, согласование ему не нужно.
function rejected({ dncComment }: LiveIncident): Draft {
  const comment = dncComment == null ? "" : `: «${dncComment}»`;
  return {
    owner: "dscs",
    what: "выбор другого варианта",
    title: "ДНЦ отклонил вариант Б",
    text: `ДНЦ не согласовал удержание 2001${comment}. Вариант А решается силами станции.`,
    buttons: [
      { label: "Принять вариант А", command: { kind: "accept", option: "A" } },
    ],
  };
}

function approval(live: Live, neighbors: Neighbors): Draft {
  const { changes } = replanOptions(live, neighbors).B;
  return {
    owner: "dnc",
    what: "согласование варианта Б",
    title: "Согласуйте вариант Б",
    text: changes.map((change) => `${change.train}: ${change.text}`).join(". "),
    form: "approval",
  };
}

// Решение принято: у ДСП приём поездов и план работ, затем работает
// бригада, затем ДСП возвращает стрелку.
function afterDecision(state: ConsoleState, live: Live): Draft {
  const { workOrder } = live;
  const items = dspItems(state, live);
  if (state.step === STEP.repaired) {
    return {
      owner: "dsp",
      what: "возврат С3 в эксплуатацию",
      title: "Работы выполнены — верните С3 в эксплуатацию",
      text: `${REPAIR.crew} сообщила: ${checklistText(workOrder)}. Проверьте контроль положения С3 на пульте — после возврата пути 3 и 5 снова доступны.`,
      items: items.filter((item) => item.result == null),
      buttons: [
        { label: "Вернуть в эксплуатацию", command: { kind: "restore" } },
      ],
    };
  }
  if (items.some((item) => item.result == null)) {
    return {
      owner: "dsp",
      what: "задачи по новому плану",
      title: "Новый план принят — ваши задачи",
      text: "Примите поезда по новому плану и сформируйте план работ для ремонтной бригады.",
      items,
    };
  }
  return {
    owner: "repair",
    what: "работы по наряду",
    title: "Ремонтная бригада работает",
    text:
      workOrder?.status === "in_progress"
        ? `Работы идут, ${checklistText(workOrder)}. Стрелка закрыта, пока ДСП не вернёт её в эксплуатацию.`
        : "Наряд выдан, бригада ещё не взяла его в работу: она сканирует QR на печатном листе.",
  };
}

function dspItems(state: ConsoleState, { workOrder, ...live }: Live) {
  const routed = routeDone(state);
  const changes = optionChanges(live, state.option);
  const items: TurnItem[] = [
    {
      text: `Принять 101 на ${trackText(changes, "101")}`,
      result: routed.r101 ? "маршрут задан, машинист уведомлён" : null,
      action: {
        label: "Задать маршрут",
        command: { kind: "route", task: "r101" },
      },
    },
    {
      text: `Принять 2001 на ${trackText(changes, "2001")}`,
      result: routed.r2001 ? "подтверждено, машинист уведомлён" : null,
      action: {
        label: "Подтвердить",
        command: { kind: "route", task: "r2001" },
      },
    },
    {
      text: "Сформировать план работ",
      result:
        workOrder == null
          ? null
          : `«${workOrder.title}», ${workOrder.total} пунктов, наряд с QR выдан`,
      action: { label: "Сформировать", command: { kind: "planWork" } },
    },
  ];
  return items.map((item) =>
    item.result == null ? item : { ...item, action: null },
  );
}

// «путь 4 в 14:27» — куда и когда вариант принимает поезд.
function trackText(changes: OptionChange[], train: string) {
  const change = changes.find((item) => item.train === train);
  return change == null
    ? "новый путь"
    : `путь ${change.track} в ${toClock(change.arrival)}`;
}

// «чеклист 5 из 5» и комментарий рабочего, если он его оставил.
function checklistText(workOrder: LiveWorkOrder | null) {
  if (workOrder == null) return "чеклист закрыт";
  const { checked, total, resultNote } = workOrder;
  const note = resultNote == null ? "" : `, «${resultNote}»`;
  return `чеклист ${checked} из ${total}${note}`;
}
