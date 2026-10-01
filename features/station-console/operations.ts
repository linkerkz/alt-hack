import { createSupabaseClient } from "@/lib/supabase";
import type { PagerMessage, PlannedTrain } from "./types";

// Ближайшие операции станции по плану путей: прибытия и отправления, по
// которым бригаде есть работа. Пропуск без остановки бригаде не поручаем.

export type Operation = {
  // Ключ операции на пейджере: «101-arrival».
  id: string;
  time: string;
  train: string;
  // Поручение бригаде: что сделать, где и к какому времени.
  text: string;
};

// Сколько операций показываем вперёд от текущего времени.
const UPCOMING = 5;

// Стоянка короче — поезд проходит станцию, работы бригаде нет.
const MIN_STOP_MINUTES = 2;

// К отправлению грузовой собирают заранее: сцепка и опробование тормозов.
const PREPARE_MINUTES = 15;

// План путей станции: поезда, их пути и время. Читает вошедший диспетчер.
export async function stationPlan(stationId: string) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("track_plan")
    .select("train_number, track, arrives_at, departs_at, trains(kind)")
    .eq("station_id", stationId)
    .order("arrives_at")
    .overrideTypes<PlanRow[], { merge: false }>();

  return (data ?? []).map(
    (row): PlannedTrain => ({
      train: row.train_number,
      kind: row.trains?.kind ?? "freight",
      track: row.track,
      arrival: row.arrives_at.slice(0, 5),
      departure: row.departs_at.slice(0, 5),
    }),
  );
}

// Операции от текущего времени станции «14:05», ближайшие сверху, со
// статусом поручения: последнее сообщение пейджера по этой операции.
export function upcomingOperations(
  plan: PlannedTrain[],
  now: string,
  pager: PagerMessage[],
) {
  return allOperations(plan)
    .filter((operation) => operation.time >= now)
    .toSorted((a, b) => a.time.localeCompare(b.time))
    .slice(0, UPCOMING)
    .map((operation) => ({
      ...operation,
      message: pager.find((message) => message.operation === operation.id),
    }));
}

// Операция по ключу из команды; null — такой в плане нет.
export function operationById(plan: PlannedTrain[], id: string) {
  return allOperations(plan).find((operation) => operation.id === id) ?? null;
}

function allOperations(plan: PlannedTrain[]) {
  return plan
    .filter(
      (train) =>
        minutes(train.departure) - minutes(train.arrival) >= MIN_STOP_MINUTES,
    )
    .flatMap((train) => [arrivalOf(train), departureOf(train)]);
}

function arrivalOf({ train, kind, track, arrival }: PlannedTrain): Operation {
  const work =
    kind === "passenger"
      ? "осмотреть состав с междупутья"
      : "закрепить состав тормозными башмаками";
  return {
    id: `${train}-arrival`,
    time: arrival,
    train,
    text: `Встретить ${train} на пути ${track} в ${arrival}: ${work}`,
  };
}

function departureOf({
  train,
  kind,
  track,
  departure,
}: PlannedTrain): Operation {
  const text =
    kind === "passenger"
      ? `Проводить ${train} с пути ${track} в ${departure}: осмотреть состав, нет ли людей на путях`
      : `Подготовить ${train} к отправлению с пути ${track} в ${departure}: сцепить вагоны, опробовать тормоза к ${clock(minutes(departure) - PREPARE_MINUTES)}`;
  return { id: `${train}-departure`, time: departure, train, text };
}

function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function clock(total: number) {
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  return `${hours}:${String(total % 60).padStart(2, "0")}`;
}

type PlanRow = {
  train_number: string;
  track: number;
  arrives_at: string;
  departs_at: string;
  trains: { kind: PlannedTrain["kind"] } | null;
};
