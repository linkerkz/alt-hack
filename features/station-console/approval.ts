import { toClock } from "@/lib/clock";
import { indexStatus } from "@/lib/efficiencyIndex";
import { anchorOf, forecastFor, type PlanSource } from "./activePlan";
import { scoreBaseline } from "./efficiency";
import type { Span } from "./forecast";
import { lastIncidents } from "./live";
import { WINDOW_MINUTES } from "./metrics";
import { scoredOptions } from "./options";
import { planSourceOf } from "./planSource";
import { type OptionChange, optionChanges } from "./replan";
import { stepOf } from "./scenario";
import type { LiveIncident, Neighbors, Status } from "./types";

// Запрос на согласование варианта Б: карточка ДНЦ на карте сети.

export type ApprovalRequest = {
  stationId: string;
  state: ApprovalState;
  // Надзаголовок карточки: что с запросом сейчас.
  verdict: { label: string; tone: Status };
  code: string;
  from: string;
  title: string;
  reason: string;
  trains: ApprovalTrain[];
  unchanged: string;
  index: { label: string; value: number; status: Status }[];
  // Что дальше: после ответа ДНЦ — что происходит на станции.
  outcome: string;
  comment: string | null;
};

// pending — ждёт ответа ДНЦ, rejected — отклонён, approved — согласован.
export type ApprovalState = "pending" | "rejected" | "approved";

// Поезд, которого касается удержание: задержка с удержанием и без него.
export type ApprovalTrain = {
  train: string;
  kind: string;
  what: string;
  withHold: number;
  without: number;
};

// Сколько поездов «без изменений» перечисляем в карточке.
const UNCHANGED_LIMIT = 3;

type ApprovalStation = { id: string; name: string; neighbors: Neighbors };

const VERDICT: Record<ApprovalState, ApprovalRequest["verdict"]> = {
  pending: { label: "Запрос на согласование", tone: "warning" },
  rejected: { label: "Отклонено", tone: "critical" },
  approved: { label: "Согласовано ДНЦ", tone: "normal" },
};

// Запросы станций круга по их последним инцидентам; без запроса — пропускаем.
// План путей читаем только у станций с запросом: по нему считаем индексы.
export async function getApprovalRequests(stations: ApprovalStation[]) {
  const incidents = await lastIncidents(stations.map((station) => station.id));
  const pending = stations.flatMap((station) => {
    const incident = incidents.get(station.id);
    const state = incident == null ? null : approvalStateOf(incident);
    if (incident == null || state == null) return [];
    return [{ station, incident, state }];
  });
  return Promise.all(
    pending.map(async ({ station, incident, state }) => {
      const step = stepOf({ incident, workOrder: null });
      const source = await planSourceOf(station.id, step, incident);
      return toRequest(station, incident, state, source);
    }),
  );
}

// Согласованный запрос держим на карте, пока идут работы: 2001 ещё удержан.
function approvalStateOf({
  status,
  option,
  dncRejected,
}: LiveIncident): ApprovalState | null {
  if (status === "confirmed" && option === "B") return "pending";
  if (status === "confirmed" && dncRejected) return "rejected";
  const isWorking = status === "decided" || status === "repairing";
  if (isWorking && option === "B") return "approved";
  return null;
}

function toRequest(
  { id, name, neighbors }: ApprovalStation,
  incident: LiveIncident,
  state: ApprovalState,
  source: PlanSource,
): ApprovalRequest {
  const { odd } = neighbors;
  const { options } = scoredOptions(source, neighbors);
  const before = scoreBaseline(source).index;
  const held = optionChanges(source, "B").find((change) => change.hold > 0);

  return {
    stationId: id,
    state,
    verdict: VERDICT[state],
    code: incident.code,
    from: `ДСЦС ст. ${name}`,
    title: titleOf(state, odd, held),
    reason: `На ст. ${name} повреждена стрелка С3 (${incident.code}).${held == null ? "" : ` После удержания ${held.train} принимается на путь ${held.track} в ${toClock(held.arrival)}.`}`,
    trains: held == null ? [] : [heldTrain(source, held, odd)],
    unchanged: unchangedOf(source, held),
    index: [
      indexItem("До сбоя", before),
      indexItem("Не менять", options.none.index),
      indexItem("С удержанием", options.B.index),
    ],
    outcome: outcomeOf(state, name, held),
    comment: incident.dncComment,
  };
}

function titleOf(
  state: ApprovalState,
  odd: string,
  held: OptionChange | undefined,
) {
  const train = held?.train ?? "поезд";
  const minutes = held == null ? "" : `, ${held.hold} мин`;
  if (state === "pending") return `Удержать ${train} на ст. ${odd}${minutes}`;
  if (state === "rejected") return `Удержание ${train} на ст. ${odd}${minutes}`;
  return `${train} удержан на ст. ${odd}`;
}

function outcomeOf(
  state: ApprovalState,
  name: string,
  held: OptionChange | undefined,
) {
  if (state === "rejected") {
    return `Станция выбирает другой вариант. Без удержания поезд ждёт у входного ст. ${name}.`;
  }
  if (held == null) return "";
  return `Приём ${held.train} на путь ${held.track} ст. ${name} в ${toClock(held.arrival)}.`;
}

// Удержанный поезд: с удержанием ждёт у соседа, без — у входного у нас.
function heldTrain(
  source: PlanSource,
  held: OptionChange,
  odd: string,
): ApprovalTrain {
  const run = forecastFor(source, "none").find((r) => r.train === held.train);
  const without = run == null ? 0 : delayOf(run);
  return {
    train: held.train,
    kind: run?.kind === "passenger" ? "пасс." : "груз.",
    what: `стоянка на ст. ${odd} ${held.hold} мин`,
    withHold: held.hold,
    without,
  };
}

// Поезда окна решения, которых вариант Б не задерживает.
function unchangedOf(source: PlanSource, held: OptionChange | undefined) {
  const from = anchorOf(source);
  const trains = forecastFor(source, "B")
    .filter(
      (run) =>
        run.train !== held?.train &&
        delayOf(run) === 0 &&
        run.planned.from < from + WINDOW_MINUTES &&
        run.planned.to > from,
    )
    .map((run) => run.train)
    .slice(0, UNCHANGED_LIMIT);
  return trains.length === 0 ? "" : `${trains.join(", ")} без изменений`;
}

function delayOf({ planned, forecast }: { planned: Span; forecast: Span }) {
  return Math.max(0, forecast.from - planned.from, forecast.to - planned.to);
}

function indexItem(label: string, value: number) {
  return { label, value, status: indexStatus(value) };
}
