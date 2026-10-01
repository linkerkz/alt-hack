import { cache } from "react";
import {
  createSupabaseAdminClient,
  createSupabaseClient,
} from "@/lib/supabase";
import { simClock } from "./journal";
import type {
  ChosenOption,
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

// Ход сценария станции из базы: последний инцидент, его наряд и хронология.
// Кэш на запрос: страница и действие читают по разу.
export const getLive = cache(async (stationId: string): Promise<Live> => {
  const incident = await lastIncident(stationId);
  const workOrder = incident == null ? null : await incidentWorkOrder(incident);
  const events = await stationEvents(stationId);

  return { incident, workOrder, events };
});

async function lastIncident(stationId: string) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("incidents")
    .select("id, code, status, option, route_tasks, device_id, snapshot")
    .eq("station_id", stationId)
    .order("detected_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data == null ? null : toIncident(data);
}

// Наряды закрыты RLS: их читает сервер секретным ключом, как и чеклист по QR.
async function incidentWorkOrder({ id }: LiveIncident) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("work_orders")
    .select(
      "id, status, started_at, done_at, result_note, work_order_items(done_at)",
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

// Строки из базы без сгенерированных типов — форму задаём руками.
function toIncident(row: IncidentRow): LiveIncident {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    option: row.option,
    routeTasks: row.route_tasks.filter(isRouteTask),
    detection: row.device_id == null ? "sensor" : "camera",
    snapshot: row.snapshot,
  };
}

function toWorkOrder(row: WorkOrderRow): LiveWorkOrder {
  const items = row.work_order_items;
  return {
    id: row.id,
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

type IncidentRow = {
  id: string;
  code: string;
  status: IncidentStatus;
  option: ChosenOption | null;
  route_tasks: string[];
  device_id: string | null;
  snapshot: string | null;
};

type WorkOrderRow = {
  id: string;
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
