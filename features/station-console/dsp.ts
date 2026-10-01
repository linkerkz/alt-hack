import { dspObjects } from "./dspObjects";
import { dspReports } from "./dspReports";
import { STEP } from "./mock";
import { routeDone } from "./routing";
import type {
  ActionLink,
  ConsoleState,
  LiveWorkOrder,
  Neighbors,
} from "./types";

// Панель исполнения ДСП: входящие задачи, состояние объектов и отправленные донесения.

export type DspTask = {
  from: string;
  time: string;
  title: string;
  // Что нужно сделать; у выполненной задачи пусто.
  detail: string;
  // Итог выполненной задачи.
  result: string;
  done: boolean;
  primary?: ActionLink;
  secondary?: ActionLink;
};

const SENSOR = "Система · датчик ЭЦ";
const DSCS = "ДСЦС";
const MECHANIC = "Электромеханик";

export function dspPanel(
  state: ConsoleState,
  neighbors: Neighbors,
  workOrder: LiveWorkOrder | null,
) {
  const tasks = tasksAt(state, workOrder);
  const pending = tasks.filter((task) => !task.done);

  return {
    // Невыполненные сверху, выполненные — от свежих к старым.
    tasks: [...pending, ...tasks.filter((task) => task.done).reverse()],
    pendingCount: pending.length,
    idleText: idleTextAt(state.step),
    objects: dspObjects(state),
    reports: dspReports(state, neighbors),
    // Диалог «Вернуть в эксплуатацию» открыт только на своём шаге.
    confirmOpen: state.confirm && state.step === STEP.repaired,
  };
}

function tasksAt(
  state: ConsoleState,
  workOrder: LiveWorkOrder | null,
): DspTask[] {
  const { step, option } = state;
  const routed = routeDone(state);
  const isB = option === "B";
  const track2001 = isB
    ? { path: 4, time: "14:27" }
    : { path: 1, time: "14:32" };
  const tasks: DspTask[] = [];

  if (step === STEP.suspected) {
    tasks.push({
      from: SENSOR,
      time: "14:08",
      title: "Стрелка С3: нет контроля положения",
      detail:
        "Проверьте на пульте. Если неисправность подтверждается, закройте стрелку и вызовите электромеханика.",
      result: "",
      done: false,
      primary: {
        label: "Подтвердить, закрыть С3, вызвать службу",
        command: { kind: "confirm" },
      },
      secondary: { label: "Ложная тревога", command: { kind: "dismiss" } },
    });
  }
  if (step >= STEP.choosing) {
    tasks.push({
      from: SENSOR,
      time: "14:08",
      title: "Закрыть стрелку С3, вызвать службу",
      detail: "",
      result: "14:09 · С3 закрыта, электромеханик вызван",
      done: true,
    });
  }
  if (step >= STEP.decided) {
    tasks.push(
      {
        from: DSCS,
        time: "14:11",
        title: "Принять 101 на путь 1",
        detail:
          "Пассажирский, к платформе. Маршрут Н → С1 по прямому → путь 1. Проверьте свободность пути и стрелок.",
        result:
          "14:12 · маршрут задан, ДНЦ получил «маршрут готов», машинист уведомлён",
        done: routed.r101,
        primary: {
          label: "Подтвердить и задать маршрут",
          command: { kind: "route", task: "r101" },
        },
      },
      {
        from: DSCS,
        time: "14:11",
        title: `Принять 2001 на путь ${track2001.path} в ${track2001.time}`,
        detail: isB
          ? "Грузовой удержан на ст. Анар, согласовано ДНЦ. Маршрут задать к 14:26."
          : "Грузовой ждёт у входного Н. Маршрут задать к 14:31.",
        result: "14:12 · подтверждено, машинист уведомлён",
        done: routed.r2001,
        primary: {
          label: "Подтвердить",
          command: { kind: "route", task: "r2001" },
        },
      },
    );
  }
  if (step === STEP.repaired) {
    tasks.push({
      from: MECHANIC,
      time: "14:27",
      title: "Вернуть С3 в эксплуатацию",
      detail: `Работы выполнены, ${checklistText(workOrder)}. Проверьте контроль положения на пульте.`,
      result: "",
      done: false,
      primary: { label: "Вернуть в эксплуатацию…", patch: { confirm: true } },
    });
  }
  if (step >= STEP.restored) {
    tasks.push({
      from: MECHANIC,
      time: "14:27",
      title: "Вернуть С3 в эксплуатацию",
      detail: "",
      result: "14:29 · С3 в работе, ДСЦС обновляет план",
      done: true,
    });
  }
  return tasks;
}

// «чеклист 5 из 5» и комментарий рабочего, если он его оставил.
export function checklistText(workOrder: LiveWorkOrder | null) {
  if (workOrder == null) return "чеклист закрыт";
  const { checked, total, resultNote } = workOrder;
  const note = resultNote == null ? "" : `, «${resultNote}»`;
  return `чеклист ${checked} из ${total}${note}`;
}

function idleTextAt(step: number) {
  if (step === STEP.normal)
    return "Новых задач нет. Станция работает по плану.";
  if (step === STEP.choosing || step === STEP.approval) {
    return "ДСЦС выбирает вариант перепланирования. Задачи придут после решения.";
  }
  if (step === STEP.repairing) {
    return "Электромеханик работает на С3. Стрелка закрыта.";
  }
  return "Новых задач нет.";
}
