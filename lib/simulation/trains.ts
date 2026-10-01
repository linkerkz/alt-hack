import {
  type Schedule,
  type ScheduledStop,
  type SimStation,
  scheduleOf,
} from "./schedule";
import { LINES, type Line } from "./timetable";

// Симуляция движения поездов по нормативному графику (timetable.ts).
// Без физики и без фонового процесса: поезда сети — чистая функция момента
// времени и сбоев. Каждый запрос считает их заново, и один момент даёт ту
// же картину. Опоздание поезда идёт с ним по маршруту и тает за счёт нагона.

// Поезд и его маршрут по станциям; время — минуты от момента now.
export type Train = {
  id: string;
  number: string;
  kind: TrainKind;
  route: TrainStop[];
};

export type TrainKind = Line["kind"];

// arrival === departure — поезд проходит станцию без остановки.
// delay — опоздание к станции против графика, минуты.
export type TrainStop = {
  stationId: string;
  arrival: number;
  departure: number;
  delay: number;
};

// Задержка от сбоя: поезд, который приходит на станцию, пока сбой открыт,
// стоит на ней дольше на minutes. Время — минуты эпохи Unix; until null —
// сбой ещё открыт.
export type IncidentDelay = {
  stationId: string;
  minutes: number;
  from: number;
  until: number | null;
};

type Params = {
  stations: SimStation[];
  delays: IncidentDelay[];
  // Момент симуляции — минуты эпохи Unix.
  now: number;
  // Поезда, которые выйдут в путь позже now + horizon, не нужны.
  horizon: number;
};

// Наибольшее отклонение отправления с начальной станции, минуты: меньше
// порога опоздания на карте, чтобы опоздание было видно только от сбоев.
const START_DELAY: Record<TrainKind, number> = { passenger: 3, freight: 8 };

// Нагон: на каждом перегоне опоздание сокращается на эту долю времени хода.
const RECOVERY_SHARE = 0.02;

const DAY_MINUTES = 24 * 60;

export function simulateTrains({ stations, delays, now, horizon }: Params) {
  const stationById = new Map(stations.map((station) => [station.id, station]));
  return LINES.flatMap((line) => [line, reversed(line)]).flatMap((line) =>
    runsOf({ line, stationById, delays, now, horizon }),
  );
}

// Обратное направление: чётный номер, рейсы вперемежку с прямыми.
function reversed(line: Line): Line {
  return {
    ...line,
    number: line.number + 1,
    offsetMinutes: line.offsetMinutes + line.everyMinutes / 2,
    route: line.route.toReversed(),
  };
}

type RunsParams = Omit<Params, "stations"> & {
  line: Line;
  stationById: Map<string, SimStation>;
};

// Рейсы линии, которые в пути на окне [now, now + horizon] или только что прибыли.
function runsOf({ line, stationById, delays, now, horizon }: RunsParams) {
  const schedule = scheduleOf(line, stationById);
  if (schedule == null) return [];

  const { everyMinutes, offsetMinutes } = line;
  const maxDelay =
    START_DELAY[line.kind] + delays.reduce((sum, d) => sum + d.minutes, 0);
  const duration = schedule[schedule.length - 1].arrival + maxDelay;
  const first = Math.ceil((now - duration - offsetMinutes) / everyMinutes);
  const last = Math.floor((now + horizon - offsetMinutes) / everyMinutes);
  const runsPerDay = DAY_MINUTES / everyMinutes;

  const trains: Train[] = [];
  for (let run = first; run <= last; run += 1) {
    const number = String(line.number + 2 * (run % runsPerDay));
    const start = run * everyMinutes + offsetMinutes;
    const startDelay = startDelayOf(line.kind, number, run);
    trains.push({
      id: `train-${number}-${Math.floor(run / runsPerDay)}`,
      number,
      kind: line.kind,
      route: delayedRoute(schedule, start, startDelay, delays).map((stop) => ({
        ...stop,
        arrival: stop.arrival - now,
        departure: stop.departure - now,
      })),
    });
  }
  return trains;
}

// Ход рейса с опозданием, минуты эпохи Unix. Опоздание копится от сбоев на
// станциях и сокращается нагоном на перегонах, но не уходит в опережение.
function delayedRoute(
  schedule: Schedule,
  start: number,
  startDelay: number,
  delays: IncidentDelay[],
): TrainStop[] {
  let late = startDelay;
  let previous: ScheduledStop | null = null;

  return schedule.map((stop) => {
    if (previous != null) {
      const run = stop.arrival - previous.departure;
      late = Math.max(0, late - Math.round(run * RECOVERY_SHARE));
    }
    previous = stop;

    const arrival = start + stop.arrival + late;
    const delay = late;
    late += heldAt(stop.stationId, arrival, delays);
    const departure = start + stop.departure + late;
    return { stationId: stop.stationId, arrival, departure, delay };
  });
}

// Сколько поезд простоит сверх графика из-за сбоев, открытых к его прибытию.
function heldAt(stationId: string, arrival: number, delays: IncidentDelay[]) {
  return delays
    .filter(
      (delay) =>
        delay.stationId === stationId &&
        delay.from <= arrival &&
        (delay.until == null || arrival < delay.until),
    )
    .reduce((sum, delay) => sum + delay.minutes, 0);
}

// Отклонение от графика — псевдослучайное, но постоянное для рейса, чтобы
// поезд не прыгал между запросами (хэш FNV-1a).
function startDelayOf(kind: TrainKind, number: string, run: number) {
  let hash = 2166136261;
  for (const char of `${number}:${run}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  return (hash >>> 0) % (START_DELAY[kind] + 1);
}
