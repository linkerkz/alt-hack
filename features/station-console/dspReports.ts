import { STEP } from "./mock";
import { routeDone } from "./routing";
import type { ConsoleState, Neighbors } from "./types";

// Донесения, которые ДСП отправил по ходу решения; свежие сверху.
export function dspReports(state: ConsoleState, { odd }: Neighbors) {
  const { step, option } = state;
  const routed = routeDone(state);
  const reports: { time: string; text: string }[] = [];

  if (step >= STEP.dispatched) {
    reports.push({
      time: "14:08",
      text: "Пейджер бригады: предмет в стрелке С3",
    });
  }
  if (step >= STEP.choosing) {
    reports.push({
      time: "14:09",
      text: "Ремонтной бригаде: наряд на стрелку С3",
    });
  }
  if (step >= STEP.decided && routed.r101) {
    reports.push(
      { time: "14:12", text: "ДНЦ: маршрут Н → путь 1 для 101 готов" },
      { time: "14:12", text: "Машинисту 101: приём на путь 1" },
    );
  }
  if (step >= STEP.decided && routed.r2001) {
    const plan =
      option === "B"
        ? `стоянка на ст. ${odd}, затем путь 4`
        : "ожидание у входного Н";
    reports.push({ time: "14:12", text: `Машинисту 2001: ${plan}` });
  }
  if (step >= STEP.repairing)
    reports.push({ time: "14:15", text: "ДНЦ: 101 прибыл на путь 1" });
  if (step >= STEP.restored)
    reports.push({ time: "14:29", text: "ДНЦ: стрелка С3 в эксплуатации" });
  return reports.reverse();
}
