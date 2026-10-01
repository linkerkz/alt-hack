import { dspObjects } from "./dspObjects";
import { dspReports } from "./dspReports";
import { OBSTRUCTION, REPAIR } from "./fault";
import { STEP } from "./mock";
import { pagerCard } from "./pagerCard";
import { routeDone } from "./routing";
import { snapshotOf } from "./snapshot";
import type {
  ActionLink,
  ConsoleState,
  Live,
  LiveIncident,
  LiveWorkOrder,
  Neighbors,
} from "./types";

// Панель исполнения ДСП: входящие задачи, пейджер бригады, состояние
// объектов и отправленные донесения.

export type DspTask = {
  from: string;
  time: string;
  title: string;
  // Что нужно сделать; у выполненной задачи пусто.
  detail: string;
  // Итог выполненной задачи.
  result: string;
  done: boolean;
  // Снимок камеры и вывод ИИ по нему: ДСП проверяет предмет сам.
  evidence?: { snapshot: string; analysis: string | null };
  primary?: ActionLink;
  secondary?: ActionLink;
};

const DSCS = "ДСЦС";
const CREW = "Путейцы";

export function dspPanel(
  state: ConsoleState,
  neighbors: Neighbors,
  live: Live,
) {
  const tasks = tasksAt(state, live);
  const pending = tasks.filter((task) => !task.done);

  return {
    // Невыполненные сверху, выполненные — от свежих к старым.
    tasks: [...pending, ...tasks.filter((task) => task.done).reverse()],
    pendingCount: pending.length,
    idleText: idleTextAt(state.step),
    pager: pagerCard(live.pager),
    objects: dspObjects(state),
    reports: dspReports(state, neighbors),
    // Диалог «Вернуть в эксплуатацию» открыт только на своём шаге.
    confirmOpen: state.confirm && state.step === STEP.repaired,
  };
}

function tasksAt(state: ConsoleState, { incident, workOrder }: Live) {
  const { step, option } = state;
  const routed = routeDone(state);
  const isB = option === "B";
  const track2001 = isB
    ? { path: 4, time: "14:27" }
    : { path: 1, time: "14:32" };
  const tasks = faultTasks(step, incident);

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
      from: REPAIR.crew,
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
      from: REPAIR.crew,
      time: "14:27",
      title: "Вернуть С3 в эксплуатацию",
      detail: "",
      result: "14:29 · С3 в работе, ДСЦС обновляет план",
      done: true,
    });
  }
  return tasks;
}

// Задачи по самой стрелке: проверить снимок и вызвать путейцев, а если
// стрелка повреждена — отправить ремонтную бригаду.
function faultTasks(step: number, incident: LiveIncident | null) {
  const tasks: DspTask[] = [];
  const snapshot = snapshotOf(incident);
  if (step === STEP.suspected) {
    tasks.push({
      from: OBSTRUCTION.from,
      time: "14:08",
      title: "Предмет в стрелке С3",
      detail:
        "Проверьте снимок камеры. Если предмет есть, вызовите путейцев на пейджер: маршруты через С3 закрыты, пока его не уберут.",
      result: "",
      done: false,
      evidence:
        snapshot == null
          ? undefined
          : { snapshot, analysis: incident?.analysis ?? null },
      primary: { label: "Вызвать путейцев", command: { kind: "callCrew" } },
      secondary: { label: "Ложная тревога", command: { kind: "dismiss" } },
    });
  }
  if (step >= STEP.dispatched) {
    tasks.push({
      from: OBSTRUCTION.from,
      time: "14:08",
      title: "Вызвать путейцев к С3",
      detail: "",
      result: "14:08 · вызов ушёл на пейджер бригады",
      done: true,
    });
  }
  if (step === STEP.escalated) {
    tasks.push({
      from: CREW,
      time: "14:09",
      title: "Стрелка С3 повреждена",
      detail:
        "Путейцы убрали предмет, но остряк повреждён. Отправьте ремонтную бригаду: наряд с QR на чеклист. ДСЦС получит варианты перепланирования.",
      result: "",
      done: false,
      primary: {
        label: "Отправить ремонтную бригаду",
        command: { kind: "sendRepair" },
      },
    });
  }
  if (step >= STEP.choosing) {
    tasks.push({
      from: CREW,
      time: "14:09",
      title: "Отправить ремонтную бригаду",
      detail: "",
      result: "14:09 · наряд выдан, ДСЦС выбирает вариант",
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
  if (step === STEP.dispatched) {
    return "Путейцы идут к С3. Камера следит: как только предмет уберут, инцидент закроется сам.";
  }
  if (step === STEP.choosing || step === STEP.approval) {
    return "ДСЦС выбирает вариант перепланирования. Задачи придут после решения.";
  }
  if (step === STEP.repairing) {
    return `${REPAIR.crew} работает на С3. Стрелка закрыта.`;
  }
  return "Новых задач нет.";
}
