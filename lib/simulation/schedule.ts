import type { Line } from "./timetable";

// График хода линии: прибытие и отправление по станциям в минутах от
// отправления с начальной станции. Ход — по расстоянию и участковой скорости.

export type Schedule = ScheduledStop[];

export type ScheduledStop = {
  stationId: string;
  arrival: number;
  departure: number;
};

export type SimStation = {
  id: string;
  lat: number;
  lon: number;
  kind: StationKind;
};

type StationKind = "sorting" | "passenger" | "freight" | "junction";

type TrainKind = Line["kind"];

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

// null — станции маршрута нет в сети.
export function scheduleOf(
  line: Line,
  stationById: Map<string, SimStation>,
): Schedule | null {
  const stops: Schedule = [];
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
