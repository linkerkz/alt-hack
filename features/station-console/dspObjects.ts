import { STEP } from "./mock";
import { routeDone } from "./routing";
import type { ConsoleState, Status } from "./types";

// Объекты и маршруты, за которые отвечает ДСП, и их состояние.
type DspObject = { name: string; status: string; tone: Status };

export function dspObjects(state: ConsoleState): DspObject[] {
  const { step, option } = state;
  const routed = routeDone(state);
  const c3 = switchStatus(step);
  const objects: DspObject[] = [{ name: "Стрелка С3", ...c3 }];
  if (step < STEP.decided) return objects;

  const track2001 = option === "B" ? 4 : 1;
  objects.push(
    {
      name: "Маршрут Н → путь 1 · 101",
      status: routed.r101
        ? step >= STEP.repairing
          ? "Выполнен"
          : "Задан"
        : "Не задан",
      tone: routed.r101 ? "normal" : "warning",
    },
    {
      name: `Приём 2001 на путь ${track2001}`,
      status: routed.r2001
        ? step >= STEP.restored
          ? "Выполнен"
          : "Подтверждён"
        : "Не подтверждён",
      tone: routed.r2001 ? "normal" : "warning",
    },
  );
  return objects;
}

function switchStatus(step: number): Pick<DspObject, "status" | "tone"> {
  if (step === STEP.normal || step >= STEP.restored) {
    return { status: "В работе", tone: "normal" };
  }
  if (step === STEP.suspected) {
    return { status: "Предмет в стрелке", tone: "warning" };
  }
  if (step === STEP.dispatched) {
    return { status: "Закрыта, путейцы вызваны", tone: "warning" };
  }
  return { status: "Закрыта, повреждена", tone: "critical" };
}
