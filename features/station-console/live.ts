import { cache } from "react";
import { simClock } from "@/lib/clock";
import { currentMinute } from "@/lib/simulation/network";
import { createSupabaseClient, supabaseAdmin } from "@/lib/supabase";
import { stationPager } from "./pager";
import { planSourceOf } from "./planSource";
import { stepOf } from "./scenario";
import type {
  ChosenOption,
  GivenDeparture,
  IncidentStatus,
  JournalEvent,
  Live,
  LiveIncident,
  LiveWorkOrder,
  RouteTask,
  Status,
  WorkOrderStatus,
} from "./types";

// Сколько событий хронологии держим в ленте.
const FEED_LIMIT = 40;

// Номера поездов симуляции повторяются по суткам: отправления старше
// этого — уже другие поезда.
const DEPARTURES_HOURS = 3;

// Поля инцидента, из которых складывается ход сценария.
const INCIDENT_COLUMNS =
  "id, code, station_id, status, option, route_tasks, dnc_rejected_at, dnc_comment, analysis, detected_at";

// Ход станции из базы: последний инцидент, его наряд, пейджер, план путей
// с устройством станции и хронология. Кэш на запрос: страница и действие
// читают по разу. Наряд и план — следом за инцидентом: от наряда зависит
// шаг сценария, а от шага — откуда план (planSource.ts).
export const getLive = cache(async (stationId: string): Promise<Live> => {
  const [incident, pager, events, departures] = await Promise.all([
    lastIncident(stationId),
    stationPager(stationId),
    stationEvents(stationId),
    stationDepartures(stationId),
  ]);
  const workOrder = incident == null ? null : await incidentWorkOrder(incident);
  const step = stepOf({ incident, workOrder });
  const source = await planSourceOf(stationId, step, incident);

  return {
    incident,
    workOrder,
    pager,
    events,
    departures: departures.map((row) => toDeparture(row, source.now)),
    ...source,
  };
});

async function lastIncident(stationId: string) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("incidents")
    .select(INCIDENT_COLUMNS)
    .eq("station_id", stationId)
    .order("detected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data == null ? null : toIncident(data);
}

// Последний инцидент каждой станции одним запросом: свежие идут первыми.
export async function lastIncidents(stationIds: string[]) {
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

// Наряды закрыты RLS: их читает сервер секретным ключом, как и чеклист по QR.
async function incidentWorkOrder({ id }: LiveIncident) {
  const supabase = supabaseAdmin();
  const { data } = await supabase
    .from("work_orders")
    .select(
      "id, title, status, started_at, done_at, result_note, work_order_items(done_at)",
    )
    .eq("incident_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data == null ? null : toWorkOrder(data);
}

async function stationEvents(stationId: string) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("timeline_events")
    .select("id, incident_id, at, text, level")
    .eq("station_id", stationId)
    .order("id", { ascending: false })
    .limit(FEED_LIMIT);

  return (data ?? []).map(toEvent);
}

// Отправления, которые ДСП дал за последние часы: ключи операций.
async function stationDepartures(stationId: string) {
  const since = new Date(Date.now() - DEPARTURES_HOURS * 3_600_000);
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("timeline_events")
    .select("operation, at")
    .eq("station_id", stationId)
    .not("operation", "is", null)
    .gte("at", since.toISOString())
    .overrideTypes<DepartureRow[], { merge: false }>();

  return data ?? [];
}

// Время события — в минуты плана станции, как у planSourceOf: от текущей
// минуты назад.
function toDeparture(row: DepartureRow, now: number): GivenDeparture {
  const minute = Math.floor(new Date(row.at).getTime() / 60_000);
  return { operation: row.operation, at: now - (currentMinute() - minute) };
}

// Строки из базы без сгенерированных типов — форму задаём руками.
export function toIncident(row: IncidentRow): LiveIncident {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    option: row.option,
    routeTasks: row.route_tasks.filter(isRouteTask),
    dncRejected: row.dnc_rejected_at != null,
    dncComment: row.dnc_comment,
    analysis: row.analysis,
    detectedAt: row.detected_at,
  };
}

function toWorkOrder(row: WorkOrderRow): LiveWorkOrder {
  const items = row.work_order_items;
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    checked: items.filter((item) => item.done_at != null).length,
    total: items.length,
    startedAt: row.started_at,
    doneAt: row.done_at,
    resultNote: row.result_note,
  };
}

function toEvent(row: EventRow): JournalEvent {
  return {
    id: row.id,
    incidentId: row.incident_id,
    time: simClock(row.at),
    text: row.text,
    level: row.level ?? undefined,
  };
}

function isRouteTask(value: string): value is RouteTask {
  return value === "r101" || value === "r2001";
}

export type IncidentRow = {
  id: string;
  code: string;
  station_id: string;
  status: IncidentStatus;
  option: ChosenOption | null;
  route_tasks: string[];
  dnc_rejected_at: string | null;
  dnc_comment: string | null;
  analysis: string | null;
  detected_at: string;
};

type WorkOrderRow = {
  id: string;
  title: string;
  status: WorkOrderStatus;
  started_at: string | null;
  done_at: string | null;
  result_note: string | null;
  work_order_items: { done_at: string | null }[];
};

type EventRow = {
  id: number;
  incident_id: string | null;
  at: string;
  text: string;
  level: Status | null;
};

type DepartureRow = { operation: string; at: string };
