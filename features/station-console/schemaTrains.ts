import { activeOption, forecastFor, type PlanSource } from "./activePlan";
import { departedAt } from "./departure";
import type { Run } from "./forecast";
import type { ConsoleState, Live, Throat } from "./types";

// Поезда на схеме станции и геометрия путей, по которой их расставляем.

export type SchemaTrain = {
  label: string;
  track: TrackNumber;
  x: number;
  width: number;
  kind: "passenger" | "freight";
  // Затронут инцидентом — обводка цветом «Критично».
  late: boolean;
  // Уходит со станции в эту горловину — схема анимирует уход; null — стоит
  // на пути или подходит.
  leaving: Throat | null;
  dimmed: boolean;
};

// Откуда схема берёт поезда: прогноз плана и отправления, которые дал ДСП.
export type Source = PlanSource & Pick<Live, "departures">;

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

// Сколько ушедший поезд ещё есть на схеме: время доиграть анимацию ухода.
// Позже его нет — иначе каждая загрузка пульта играла бы уход заново.
const LEAVE_MINUTES = 1;

// Маневровый локомотив всегда в тупике: в плане путей поездов его нет.
const SHUNTER = { label: "ТЭМ2", track: 6, x: 540, width: 46 } as const;

// Поезда на схеме в минуту шага по прогнозу действующего плана: на путях
// стоят те, кто уже прибыл; уходят те, кому ДСП дал отправление или чьё
// время отправления только что наступило; у входного — кто ждёт или вот-вот
// подойдёт.
export function schemaTrainsAt(state: ConsoleState, source: Source) {
  const { now } = source;
  const runs = forecastFor(source, activeOption(state.step, state.option));
  const standing = runs.flatMap((run) => stationTrain(run, source));
  const coming = runs
    .filter((run) => isComing(run, now))
    .toSorted((a, b) => a.forecast.from - b.forecast.from);
  // У каждой горловины рисуем один поезд — ближайший.
  const odd = coming.find((run) => entryThroat(run, source) === "odd");
  const even = coming.find((run) => entryThroat(run, source) === "even");
  const shunter = {
    ...SHUNTER,
    train: SHUNTER.label,
    kind: "freight" as const,
  };

  return [
    ...standing,
    ...(odd == null ? [] : [comingTrain(odd, "odd")]),
    ...(even == null ? [] : [comingTrain(even, "even")]),
    { ...shunter, late: false, leaving: null, onTrack: true },
  ];
}

// Стоит на пути, пока не отправлен; минуту после отправления — уходит,
// путь уже свободен. Отправлен, когда ДСП дал отправление или по плану.
function stationTrain(run: Run, source: Source): Train[] {
  const { now } = source;
  if (now < run.forecast.from) return [];
  const departed = departedAt(run.train, run.forecast, source.departures);
  if (now < departed) return [standingTrain(run)];
  if (now >= departed + LEAVE_MINUTES) return [];
  const leaving = exitThroat(run, source);
  return [{ ...standingTrain(run), leaving, onTrack: false }];
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
    leaving: null,
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
    leaving: null,
    onTrack: false,
  };
}

function entryThroat(run: Run, { layout }: PlanSource) {
  return layout.routes.find((route) => route.id === run.entryRoute)?.throat;
}

// Маршрут отправления неизвестен — уводим в чётную, как поезда без соседа.
function exitThroat(run: Run, { layout }: PlanSource): Throat {
  const route = layout.routes.find((item) => item.id === run.exitRoute);
  return route?.throat ?? "even";
}

type Train = Omit<SchemaTrain, "dimmed"> & { train: string; onTrack: boolean };
