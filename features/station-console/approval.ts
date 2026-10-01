import { createSupabaseClient } from "@/lib/supabase";
import { type PlanSource, scoreBaseline } from "./efficiency";
import { stationLayout } from "./layout";
import { INCIDENT_COLUMNS, type IncidentRow, toIncident } from "./live";
import { APPROVAL, approvalTrains } from "./mock";
import { stationPlan } from "./operations";
import { scoredOptions } from "./options";
import { indexStatus } from "./status";
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

export type ApprovalTrain = ReturnType<typeof approvalTrains>[number];

type ApprovalStation = { id: string; name: string; neighbors: Neighbors };

const VERDICT: Record<ApprovalState, ApprovalRequest["verdict"]> = {
  pending: { label: "Запрос на согласование", tone: "warning" },
  rejected: { label: `Отклонено в ${APPROVAL.requestedAt}`, tone: "critical" },
  approved: {
    label: `Согласовано ДНЦ · ${APPROVAL.approvedAt}`,
    tone: "normal",
  },
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
      const [plan, layout] = await Promise.all([
        stationPlan(station.id),
        stationLayout(station.id),
      ]);
      return toRequest(station, incident, state, { plan, layout });
    }),
  );
}

// Последний инцидент каждой станции одним запросом: свежие идут первыми.
async function lastIncidents(stationIds: string[]) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("incidents")
    .select(INCIDENT_COLUMNS)
    .in("station_id", stationIds)
    .order("detected_at", { ascending: false })
    .overrideTypes<IncidentRow[], { merge: false }>();

  const byStation = new Map<string, LiveIncident>();
  for (const row of data ?? []) {
    if (!byStation.has(row.station_id)) {
      byStation.set(row.station_id, toIncident(row));
    }
  }
  return byStation;
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
  const options = scoredOptions(source, neighbors);
  const before = scoreBaseline(source).index;

  return {
    stationId: id,
    state,
    verdict: VERDICT[state],
    code: incident.code,
    from: `ДСЦС ст. ${name} · ${APPROVAL.requestedAt}`,
    title: titleOf(state, odd),
    reason: `На ст. ${name} повреждена стрелка С3 (${incident.code}). После удержания 2001 принимается на путь 4 в 14:27.`,
    trains: approvalTrains(neighbors),
    unchanged: APPROVAL.unchanged,
    index: [
      indexItem("До сбоя", before),
      indexItem("Не менять", options.none.index),
      indexItem("С удержанием", options.B.index),
    ],
    outcome: outcomeOf(state, name),
    comment: incident.dncComment,
  };
}

function titleOf(state: ApprovalState, odd: string) {
  if (state === "pending")
    return `Удержать грузовой 2001 на ст. ${odd} на 9 мин`;
  if (state === "rejected") return `Удержание 2001 на ст. ${odd}, 9 мин`;
  return `2001 удержан на ст. ${odd}`;
}

function outcomeOf(state: ApprovalState, name: string) {
  if (state === "rejected") {
    return `Станция выбирает другой вариант. Без удержания 2001 ждёт у входного ст. ${name}.`;
  }
  return `Отправление в 14:20, приём на путь 4 ст. ${name} в 14:27.`;
}

function indexItem(label: string, value: number) {
  return { label, value, status: indexStatus(value) };
}
