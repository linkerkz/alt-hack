import { activeOption, forecastFor, type PlanSource } from "./activePlan";
import type { Run } from "./forecast";
import type { ConsoleState } from "./types";

// Поезда на схеме станции и геометрия путей, по которой их расставляем.

export type SchemaTrain = {
  label: string;
  track: TrackNumber;
  x: number;
  width: number;
  kind: "passenger" | "freight";
  // Затронут инцидентом — обводка цветом «Критично».
  late: boolean;
  dimmed: boolean;
};

export type TrackNumber = 1 | 2 | 3 | 4 | 5 | 6;

// Пути сверху вниз: ось y и края на схеме 1000×360.
export const TRACKS: { n: TrackNumber; y: number; from: number; to: number }[] =
  [
    { n: 5, y: 60, from: 225, to: 775 },
    { n: 3, y: 115, from: 145, to: 855 },
    { n: 1, y: 170, from: 0, to: 1000 },
    { n: 2, y: 230, from: 0, to: 1000 },
    { n: 4, y: 285, from: 165, to: 835 },
    { n: 6, y: 335, from: 520, to: 750 },
  ];

// Поезд, который прибудет так скоро, уже на подходе к входному светофору.
const APPROACH_MINUTES = 10;

// Маневровый локомотив всегда в тупике: в плане путей поездов его нет.
const SHUNTER = { label: "ТЭМ2", track: 6, x: 540, width: 46 } as const;

// Поезда на схеме в минуту шага по прогнозу действующего плана: на путях
// стоят те, кто уже прибыл; у входного — кто ждёт или вот-вот подойдёт.
export function schemaTrainsAt(state: ConsoleState, source: PlanSource) {
  const { now } = source;
  const runs = forecastFor(source, activeOption(state.step, state.option));
  const standing = runs
    .filter((run) => run.forecast.from <= now && now < run.forecast.to)
    .map(standingTrain);
  const coming = runs
    .filter((run) => isComing(run, now))
    .toSorted((a, b) => a.forecast.from - b.forecast.from);
  // У каждой горловины рисуем один поезд — ближайший.
  const odd = coming.find((run) => throatOf(run, source) === "odd");
  const even = coming.find((run) => throatOf(run, source) === "even");
  const shunter = {
    ...SHUNTER,
    train: SHUNTER.label,
    kind: "freight" as const,
  };

  return [
    ...standing,
    ...(odd == null ? [] : [comingTrain(odd, "odd")]),
    ...(even == null ? [] : [comingTrain(even, "even")]),
    { ...shunter, late: false, onTrack: true },
  ];
}

// Подходит по прогнозу или подошёл по плану и ждёт у входного. Удержанный
// на соседней станции по варианту у нас не ждёт — его не рисуем.
function isComing({ planned, forecast, waited }: Run, now: number) {
  if (forecast.from <= now) return false;
  const isNear = (minute: number) => minute - now <= APPROACH_MINUTES;
  return isNear(forecast.from) || (waited && isNear(planned.from));
}

function standingTrain(run: Run): Train {
  const track = TRACKS.find((item) => item.n === run.track) ?? TRACKS[0];
  const width = run.kind === "freight" ? 220 : 140;
  return {
    train: run.train,
    label: run.train,
    track: track.n,
    x: (track.from + track.to - width) / 2,
    width,
    kind: run.kind,
    late: run.waited,
    onTrack: true,
  };
}

// Подходит со стороны нечётной горловины — слева, чётной — справа; по
// своему главному пути, а на боковой — по главному со своей стороны.
function comingTrain(run: Run, throat: "odd" | "even"): Train {
  const isOdd = throat === "odd";
  const track = run.track === 1 || run.track === 2 ? run.track : isOdd ? 1 : 2;
  return {
    train: run.train,
    label: isOdd ? `${run.train} →` : `← ${run.train}`,
    track,
    x: isOdd ? 4 : 934,
    width: 62,
    kind: run.kind,
    late: run.waited,
    onTrack: false,
  };
}

function throatOf(run: Run, { layout }: PlanSource) {
  return layout.routes.find((route) => route.id === run.entryRoute)?.throat;
}

type Train = Omit<SchemaTrain, "dimmed"> & { train: string; onTrack: boolean };
