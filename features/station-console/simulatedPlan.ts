import { stationMinutes, toClock } from "@/lib/clock";
import { currentMinute, networkTrains } from "@/lib/simulation/network";
import type { Train } from "@/lib/simulation/trains";
import { createSupabaseClient } from "@/lib/supabase";
import { chooseTrack, type Occupancy, type Visit } from "./trackChoice";
import type { PlannedTrain, StationLayout, Throat } from "./types";

// Живой план путей: поезда симуляции, которые на окне плана стоят у нас или
// проходят станцию, — с опозданиями от сбоев сети. Путь и маршруты
// назначаем по правилам ДСП (trackChoice.ts).

// Окно поездов вокруг текущего момента, минуты.
const PAST_MINUTES = 60;
const AHEAD_MINUTES = 120;

// Поезд без остановки занимает главный путь, пока проходит станцию.
const PASS_MINUTES = 1;

// На начальной станции состав стоит на пути до отправления (посадка,
// формирование), на конечной — после прибытия (высадка, уборка).
const BEFORE_START: Record<Train["kind"], number> = {
  passenger: 30,
  freight: 40,
};
const AFTER_END: Record<Train["kind"], number> = { passenger: 20, freight: 40 };

export async function simulatedPlan(stationId: string, layout: StationLayout) {
  const epochMinute = currentMinute();
  const now = stationMinutes(new Date(epochMinute * 60_000));
  const [trains, throats] = await Promise.all([
    networkTrains(epochMinute, AHEAD_MINUTES),
    throatsOf(stationId),
  ]);
  const visits = trains
    .flatMap((train) => visitOf(train, stationId, throats, now))
    .filter((visit) => isInWindow(visit, now))
    .toSorted((a, b) => a.arrival - b.arrival);

  return { plan: assignTracks(visits, layout), now };
}

// Пути назначаем по порядку прибытия: занятые раньше пришедшими не предлагаем.
function assignTracks(visits: Visit[], layout: StationLayout) {
  const busy: Occupancy[] = [];
  return visits.flatMap((visit): PlannedTrain[] => {
    const choice = chooseTrack(visit, layout, busy);
    if (choice == null) return [];
    const track = choice.track.number;
    busy.push({ track, from: visit.arrival, to: visit.departure });
    return [
      {
        train: visit.train,
        kind: visit.kind,
        track,
        entryRoute: choice.entryRoute,
        exitRoute: choice.exitRoute,
        arrival: toClock(visit.arrival),
        departure: toClock(visit.departure),
      },
    ];
  });
}

// Как поезд проходит станцию: время у нас и горловины входа и выхода по
// соседям маршрута. На начальной и конечной станции горловина — напротив.
function visitOf(
  { number, kind, route }: Train,
  stationId: string,
  throats: Map<string, Throat>,
  now: number,
): Visit[] {
  const index = route.findIndex((stop) => stop.stationId === stationId);
  if (index === -1) return [];
  const stop = route[index];
  const from = route[index - 1]?.stationId;
  const to = route[index + 1]?.stationId;
  const entry = (from == null ? null : throats.get(from)) ?? null;
  const exit = (to == null ? null : throats.get(to)) ?? null;
  const passes = stop.arrival === stop.departure && from != null && to != null;
  const arrival = now + stop.arrival - (from == null ? BEFORE_START[kind] : 0);
  const departure = now + stop.departure + (to == null ? AFTER_END[kind] : 0);

  return [
    {
      train: number,
      kind,
      arrival,
      departure: passes ? arrival + PASS_MINUTES : departure,
      passes,
      entry: entry ?? opposite(exit ?? "even"),
      exit: exit ?? opposite(entry ?? "odd"),
    },
  ];
}

// Полночь не переходим: время плана — минуты одних суток.
function isInWindow({ arrival, departure }: Visit, now: number) {
  return (
    arrival >= 0 &&
    departure >= now - PAST_MINUTES &&
    arrival <= now + AHEAD_MINUTES
  );
}

// Сосед по участку, где мы конец, — со стороны нечётной горловины, где
// начало — чётной (как соседи пульта в getStationNeighbors).
async function throatsOf(stationId: string) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("sections")
    .select("from_id, to_id")
    .or(`from_id.eq.${stationId},to_id.eq.${stationId}`)
    .overrideTypes<{ from_id: string; to_id: string }[], { merge: false }>();

  return new Map(
    (data ?? []).map(({ from_id, to_id }): [string, Throat] =>
      to_id === stationId ? [from_id, "odd"] : [to_id, "even"],
    ),
  );
}

function opposite(throat: Throat): Throat {
  return throat === "odd" ? "even" : "odd";
}
