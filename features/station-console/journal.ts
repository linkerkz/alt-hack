import type { OptionChange } from "./replan";
import type { ChosenOption, Command, RouteTask, Status } from "./types";

// Что команда пишет в хронологию станции; время записи — момент команды.
// Обнаружение пишет openIncident, ответы путейцев и этапы наряда — сама
// база (триггеры pager_message_answer и work_order_stage): бригады
// работают не с пульта.

export type JournalEntry = {
  actor: Actor;
  text: string;
  level?: Status;
};

// Совпадает с enum public.actor.
type Actor =
  | "system"
  | "iot"
  | "dsp"
  | "dscs"
  | "dnc"
  | "repair_crew"
  | "driver";

type Context = {
  code: string;
  option: ChosenOption | null;
  // Поезда, которые ДСП принял по новому плану, включая этот.
  routed: RouteTask[];
  // Изменения плана по принятому варианту: куда и когда принимаем поезда.
  changes: OptionChange[];
};

export function journalOf(command: Command, context: Context): JournalEntry[] {
  switch (command.kind) {
    case "callCrew":
      return [
        {
          actor: "dsp",
          text: "ДСП подтвердил предмет по снимку и вызвал путейцев на пейджер",
          level: "warning",
        },
      ];
    case "callRepair":
      return [
        {
          actor: "dsp",
          text: "ДСП вызвал ремонтную бригаду. Рассчитано 2 варианта, план работ — после решения",
          level: "warning",
        },
      ];
    case "dismiss":
      return [
        {
          actor: "dsp",
          text: `ДСП: на снимке нет предмета, ложная тревога. Инцидент ${context.code} закрыт`,
          level: "normal",
        },
      ];
    case "accept":
      return [acceptEntry(command.option)];
    case "approve":
      return [
        {
          actor: "dnc",
          text: `ДНЦ согласовал вариант Б${quoted(command.comment)}. ДСЦС обновил план, задачи переданы ДСП`,
          level: "normal",
        },
      ];
    case "reject":
      return [
        {
          actor: "dnc",
          text: `ДНЦ отклонил удержание 2001${quoted(command.comment)}. ДСЦС выбирает другой вариант`,
          level: "critical",
        },
      ];
    case "reconsider":
      return [
        {
          actor: "dnc",
          text: "ДНЦ вернул вариант Б на рассмотрение",
          level: "warning",
        },
      ];
    case "route":
      return routeEntries(command.task, context);
    case "restore":
      return [
        {
          actor: "dsp",
          text: "ДСП вернул С3 в эксплуатацию. ДСЦС обновляет план",
          level: "normal",
        },
      ];
    case "close":
      return [
        {
          actor: "dscs",
          text: command.keepPlan
            ? "Текущий план сохранён. Инцидент закрыт"
            : "Остаток плана возвращён к исходному. Инцидент закрыт",
          level: "normal",
        },
      ];
    default:
      return [];
  }
}

// Комментарий ДНЦ в хронологии: « «текст»», пустой — не пишем.
function quoted(comment: string | null) {
  return comment == null ? "" : ` «${comment}»`;
}

function acceptEntry(option: ChosenOption): JournalEntry {
  if (option === "B") {
    return {
      actor: "dscs",
      text: "ДСЦС выбрал вариант Б. Запрос согласования ДНЦ",
    };
  }
  return {
    actor: "dscs",
    text: "ДСЦС выбрал вариант А и обновил план, задачи переданы ДСП",
    level: "normal",
  };
}

function routeEntries(task: RouteTask, { routed, changes }: Context) {
  const train = task === "r101" ? "101" : "2001";
  const change = changes.find((item) => item.train === train);
  const where =
    change == null ? "новый путь" : `путь ${change.track} в ${change.arrival}`;
  const entries: JournalEntry[] = [
    task === "r101"
      ? {
          actor: "dsp",
          text: `ДСП задал маршрут Н → ${where} для 101. ДНЦ получил «маршрут готов»`,
          level: "normal",
        }
      : { actor: "dsp", text: `ДСП подтвердил приём 2001 на ${where}` },
  ];
  // Машинисты получают изменения, когда ДСП принял оба поезда.
  if (routed.includes("r101") && routed.includes("r2001")) {
    entries.push({
      actor: "driver",
      text: "Машинисты 101 и 2001 подтвердили получение",
    });
  }
  return entries;
}
