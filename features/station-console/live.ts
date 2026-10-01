import { cache } from "react";
import { simClock } from "@/lib/clock";
import { createSupabaseClient, supabaseAdmin } from "@/lib/supabase";
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

// Поля инцидента, из которых складывается ход сценария.
export const INCIDENT_COLUMNS =
  "id, code, station_id, status, option, route_tasks, dnc_rejected_at, dnc_comment, device_id, analysis";

// Ход сценария станции из базы: последний инцидент, его наряд и хронология.
// Кэш на запрос: страница и действие читают по разу. Хронология читается
// параллельно с инцидентом, наряд — следом за ним.
export const getLive = cache(async (stationId: string): Promise<Live> => {
  const [incident, events] = await Promise.all([
    lastIncident(stationId),
    stationEvents(stationId),
  ]);
  const workOrder = incident == null ? null : await incidentWorkOrder(incident);

  return { incident, workOrder, events };
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

// Наряды закрыты RLS: их читает сервер секретным ключом, как и чеклист по QR.
async function incidentWorkOrder({ id }: LiveIncident) {
  const supabase = supabaseAdmin();
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
export function toIncident(row: IncidentRow): LiveIncident {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    option: row.option,
    routeTasks: row.route_tasks.filter(isRouteTask),
    dncRejected: row.dnc_rejected_at != null,
    dncComment: row.dnc_comment,
    detection: row.device_id == null ? "sensor" : "camera",
    analysis: row.analysis,
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

export type IncidentRow = {
  id: string;
  code: string;
  station_id: string;
  status: IncidentStatus;
  option: ChosenOption | null;
  route_tasks: string[];
  dnc_rejected_at: string | null;
  dnc_comment: string | null;
  device_id: string | null;
  analysis: string | null;
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
