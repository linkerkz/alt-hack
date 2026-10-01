import type { ChosenOption, Command, RouteTask, Status } from "./types";

// Что команда пишет в хронологию станции. Время — минута симуляции после
// 14:00, как у плана путей: демо-час идёт быстрее реального. Этапы наряда
// пишет сама база (триггер work_order_stage): рабочий работает не с пульта.

export type JournalEntry = {
  minute: number;
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
};

export function journalOf(command: Command, context: Context): JournalEntry[] {
  switch (command.kind) {
    case "detect":
      return [
        {
          minute: 8,
          actor: "iot",
          text: "Датчик: стрелка С3 потеряла контроль положения",
          level: "critical",
        },
        {
          minute: 8,
          actor: "system",
          text: `Создан инцидент ${context.code} «подозрение». Маршруты через С3 закрыты`,
          level: "warning",
        },
      ];
    case "confirm":
      return [
        {
          minute: 9,
          actor: "dsp",
          text: "ДСП подтвердил неисправность, закрыл С3 и вызвал электромеханика. Рассчитано 2 варианта",
          level: "warning",
        },
        {
          minute: 9,
          actor: "system",
          text: "Службе СЦБ выдан наряд: восстановить контроль С3",
        },
      ];
    case "dismiss":
      return [
        {
          minute: 9,
          actor: "dsp",
          text: `ДСП: контроль С3 есть, ложная тревога. Инцидент ${context.code} закрыт`,
          level: "normal",
        },
      ];
    case "accept":
      return [acceptEntry(command.option)];
    case "approve":
      return [
        {
          minute: 11,
          actor: "dnc",
          text: "ДНЦ согласовал вариант Б. ДСЦС обновил план, задачи переданы ДСП",
          level: "normal",
        },
      ];
    case "route":
      return routeEntries(command.task, context);
    case "restore":
      return [
        {
          minute: 29,
          actor: "dsp",
          text: "ДСП вернул С3 в эксплуатацию. ДСЦС обновляет план",
          level: "normal",
        },
      ];
    case "close":
      return [
        {
          minute: 32,
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

// Время записи: сегодняшний день станции, 14:MM по Алматы (UTC+5).
export function simAt(minute: number) {
  const day = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Almaty",
  });
  return `${day}T14:${String(minute).padStart(2, "0")}:00+05:00`;
}

// «14:08» из записи хронологии.
export function simClock(at: string) {
  return new Date(at).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Almaty",
  });
}

function acceptEntry(option: ChosenOption): JournalEntry {
  if (option === "B") {
    return {
      minute: 10,
      actor: "dscs",
      text: "ДСЦС выбрал вариант Б. Запрос согласования ДНЦ",
    };
  }
  return {
    minute: 10,
    actor: "dscs",
    text: "ДСЦС выбрал вариант А и обновил план, задачи переданы ДСП",
    level: "normal",
  };
}

function routeEntries(task: RouteTask, { option, routed }: Context) {
  const entries: JournalEntry[] = [
    task === "r101"
      ? {
          minute: 12,
          actor: "dsp",
          text: "ДСП задал маршрут Н → путь 1 для 101. ДНЦ получил «маршрут готов»",
          level: "normal",
        }
      : {
          minute: 12,
          actor: "dsp",
          text:
            option === "B"
              ? "ДСП подтвердил приём 2001 на путь 4 в 14:27"
              : "ДСП подтвердил приём 2001 на путь 1 в 14:32",
        },
  ];
  // Машинисты получают изменения, когда ДСП принял оба поезда.
  if (routed.includes("r101") && routed.includes("r2001")) {
    entries.push({
      minute: 13,
      actor: "driver",
      text: "Машинисты 101 и 2001 подтвердили получение",
    });
  }
  return entries;
}
