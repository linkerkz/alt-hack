import type { PlannedTrain, StationLayout, Throat } from "./types";

// Путь и маршруты поезда живого плана — как назначил бы ДСП: пассажирский —
// к платформе, грузовой — на приёмо-отправочный без платформы, без
// остановки — по главному. Из подходящих — первый свободный; свободного нет —
// тот, что освободится раньше: ожидание покажет прогноз как конфликт.

export type Visit = {
  train: string;
  kind: PlannedTrain["kind"];
  // Минуты от полуночи станции.
  arrival: number;
  departure: number;
  passes: boolean;
  entry: Throat;
  exit: Throat;
};

export type Occupancy = { track: number; from: number; to: number };

type Track = StationLayout["tracks"][number];

// Между поездами на одном пути — время на маршрут и закрепление.
const GAP_MINUTES = 2;

export function chooseTrack(
  visit: Visit,
  layout: StationLayout,
  busy: Occupancy[],
) {
  const candidates = layout.tracks
    .filter((track) => track.kind !== "dead_end")
    .flatMap((track) => {
      const entryRoute = routeOf(layout, track.number, visit.entry);
      const exitRoute = routeOf(layout, track.number, visit.exit);
      if (entryRoute == null || exitRoute == null) return [];
      return { track, entryRoute, exitRoute };
    })
    .toSorted((a, b) => rankOf(a.track, visit) - rankOf(b.track, visit));

  const free = candidates.find(
    ({ track }) => blockedUntil(track.number, visit, busy) == null,
  );
  const earliest = candidates.toSorted(
    (a, b) =>
      (blockedUntil(a.track.number, visit, busy) ?? 0) -
      (blockedUntil(b.track.number, visit, busy) ?? 0),
  )[0];
  return free ?? earliest ?? null;
}

// Меньше — предпочтительнее для этого поезда.
function rankOf(track: Track, { kind, passes }: Visit) {
  const isMain = track.kind === "main";
  if (passes) return isMain ? 0 : 2;
  if (kind === "passenger") {
    if (!track.hasPlatform) return 2;
    return isMain ? 1 : 0;
  }
  if (track.hasPlatform) return 2;
  return isMain ? 1 : 0;
}

// До какой минуты путь занят другими поездами во время стоянки этого;
// null — свободен. Между поездами — время на смену.
function blockedUntil(track: number, visit: Visit, busy: Occupancy[]) {
  const overlapping = busy.filter(
    (item) =>
      item.track === track &&
      item.from < visit.departure + GAP_MINUTES &&
      visit.arrival < item.to + GAP_MINUTES,
  );
  if (overlapping.length === 0) return null;
  return Math.max(...overlapping.map((item) => item.to)) + GAP_MINUTES;
}

function routeOf(layout: StationLayout, track: number, throat: Throat) {
  return layout.routes.find(
    (route) => route.track === track && route.throat === throat,
  )?.id;
}
