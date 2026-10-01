import { LINES, type Line } from "./timetable";

// Симуляция движения поездов по нормативному графику (lib/timetable.ts).
// Без физики и без фонового процесса: поезда сети — чистая функция момента
// времени. Каждый запрос считает их заново, и один момент даёт ту же картину.

// Поезд и его маршрут по станциям; время — минуты от момента now.
export type Train = {
  id: string;
  number: string;
  kind: TrainKind;
  route: TrainStop[];
};

export type TrainKind = Line["kind"];

// arrival === departure — поезд проходит станцию без остановки.
export type TrainStop = {
  stationId: string;
  arrival: number;
  departure: number;
};

type Params = {
  stations: SimStation[];
  // Момент симуляции — минуты от начала эпохи Unix.
  now: number;
  // Поезда, которые выйдут в путь позже now + horizon, не нужны.
  horizon: number;
};

type SimStation = { id: string; lat: number; lon: number; kind: StationKind };

type StationKind = "sorting" | "passenger" | "freight" | "junction";

// Участковая скорость — средняя с разгонами и замедлениями, км/ч.
const SPEED_KMH: Record<TrainKind, number> = { passenger: 60, freight: 42 };

// Путь длиннее прямой между станциями.
const TRACK_FACTOR = 1.2;

// Стоянка на промежуточной станции, минуты; 0 — проезд без остановки.
// Грузовые стоят на сортировочных: смена бригады и техосмотр.
const DWELL: Record<TrainKind, Record<StationKind, number>> = {
  passenger: { sorting: 20, passenger: 15, junction: 10, freight: 5 },
  freight: { sorting: 40, passenger: 0, junction: 0, freight: 15 },
};

// Наибольшее отклонение отправления от графика, минуты.
const MAX_DELAY: Record<TrainKind, number> = { passenger: 10, freight: 45 };

const DAY_MINUTES = 24 * 60;

export function simulateTrains({ stations, now, horizon }: Params): Train[] {
  const stationById = new Map(stations.map((station) => [station.id, station]));
  return LINES.flatMap((line) => [line, reversed(line)]).flatMap((line) =>
    runsOf(line, stationById, now, horizon),
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

// Рейсы линии, которые в пути на окне [now, now + horizon] или только что прибыли.
function runsOf(
  line: Line,
  stationById: Map<string, SimStation>,
  now: number,
  horizon: number,
): Train[] {
  const schedule = scheduleOf(line, stationById);
  if (schedule == null) return [];

  const { everyMinutes, offsetMinutes } = line;
  const duration = schedule[schedule.length - 1].arrival + MAX_DELAY[line.kind];
  const first = Math.ceil((now - duration - offsetMinutes) / everyMinutes);
  const last = Math.floor((now + horizon - offsetMinutes) / everyMinutes);
  const runsPerDay = DAY_MINUTES / everyMinutes;

  const trains: Train[] = [];
  for (let run = first; run <= last; run += 1) {
    const number = String(line.number + 2 * (run % runsPerDay));
    const start =
      run * everyMinutes + offsetMinutes + delayOf(line.kind, number, run);
    trains.push({
      id: `train-${number}-${Math.floor(run / runsPerDay)}`,
      number,
      kind: line.kind,
      route: schedule.map((stop) => ({
        stationId: stop.stationId,
        arrival: start + stop.arrival - now,
        departure: start + stop.departure - now,
      })),
    });
  }
  return trains;
}

// Ход по графику от отправления с начальной станции; null — станции нет в сети.
function scheduleOf(line: Line, stationById: Map<string, SimStation>) {
  const stops: TrainStop[] = [];
  let clock = 0;
  let previous: SimStation | null = null;

  for (const [index, stationId] of line.route.entries()) {
    const station = stationById.get(stationId);
    if (station == null) return null;
    if (previous != null) clock += runMinutes(line.kind, previous, station);

    const isEndpoint = index === 0 || index === line.route.length - 1;
    const dwell = isEndpoint ? 0 : DWELL[line.kind][station.kind];
    stops.push({ stationId, arrival: clock, departure: clock + dwell });
    clock += dwell;
    previous = station;
  }
  return stops;
}

function runMinutes(kind: TrainKind, from: SimStation, to: SimStation) {
  const km = distanceKm(from, to) * TRACK_FACTOR;
  return Math.round((km / SPEED_KMH[kind]) * 60);
}

// Расстояние по поверхности Земли (формула гаверсинусов).
function distanceKm(from: SimStation, to: SimStation) {
  const rad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLon = rad(to.lon - from.lon);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
}

// Отклонение от графика — псевдослучайное, но постоянное для рейса, чтобы
// поезд не прыгал между запросами (хэш FNV-1a).
function delayOf(kind: TrainKind, number: string, run: number) {
  let hash = 2166136261;
  for (const char of `${number}:${run}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  return (hash >>> 0) % (MAX_DELAY[kind] + 1);
}
