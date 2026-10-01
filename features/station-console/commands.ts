import { createSupabaseAdminClient } from "@/lib/supabase";
import { type JournalEntry, journalOf, simAt } from "./journal";
import { INCIDENT, STEP, WORK_ORDER } from "./mock";
import { nextCommand, stepOf } from "./scenario";
import type {
  ChosenOption,
  Command,
  CommandResult,
  IncidentStatus,
  Live,
  LiveIncident,
  RouteTask,
} from "./types";

// Команды пульта над базой. Роль уже проверена в actions.ts; здесь каждая
// команда проверяет, что её очередь: шаг мог смениться на другом экране.

type Context = { stationId: string; operatorId: string; live: Live };

// Поля инцидента, которые меняют команды.
type IncidentPatch = {
  status?: IncidentStatus;
  option?: ChosenOption | null;
  route_tasks?: RouteTask[];
  dnc_approved_at?: string;
  dnc_rejected_at?: string | null;
  dnc_comment?: string | null;
  closed_at?: string;
};

// Запрос на согласование снова чистый: ДСЦС отправил вариант Б заново.
const FRESH_REQUEST: IncidentPatch = {
  option: "B",
  dnc_rejected_at: null,
  dnc_comment: null,
};

const DONE: CommandResult = { error: null };
const NOT_NOW = { error: "Ситуация уже изменилась — экран обновлён" };
const SAVE_FAILED = { error: "Не удалось сохранить, попробуйте ещё раз" };

export async function runOn(
  context: Context,
  command: Command,
): Promise<CommandResult> {
  try {
    return await dispatch(context, command);
  } catch {
    return SAVE_FAILED;
  }
}

async function dispatch(context: Context, command: Command) {
  const { live } = context;
  const { incident, workOrder } = live;
  const step = stepOf(live);

  if (command.kind === "detect") {
    if (step !== STEP.normal && step !== STEP.closed) return NOT_NOW;
    return detect(context);
  }
  if (command.kind === "advance") {
    const next = nextCommand(live);
    if (next == null) return { error: "Сценарий пройден — нажмите «Сброс»" };
    return dispatch(context, next);
  }
  if (command.kind === "reset") return reset(context.stationId);
  if (incident == null) return NOT_NOW;

  const update = (patch: IncidentPatch) =>
    updateIncident(context, incident, command, patch);
  switch (command.kind) {
    case "confirm":
      if (step !== STEP.suspected) return NOT_NOW;
      await issueWorkOrder(context, incident);
      return update({ status: "confirmed" });
    case "dismiss":
      if (step !== STEP.suspected) return NOT_NOW;
      return update({ status: "closed", closed_at: now() });
    case "accept":
      if (step !== STEP.choosing) return NOT_NOW;
      return command.option === "A"
        ? update({ status: "decided", option: "A" })
        : update(FRESH_REQUEST);
    case "approve":
      if (step !== STEP.approval) return NOT_NOW;
      return update({
        status: "decided",
        dnc_approved_at: now(),
        dnc_comment: command.comment,
      });
    case "reject":
      if (step !== STEP.approval) return NOT_NOW;
      return update({
        option: null,
        dnc_rejected_at: now(),
        dnc_comment: command.comment,
      });
    case "reconsider":
      if (step !== STEP.choosing || !incident.dncRejected) return NOT_NOW;
      return update(FRESH_REQUEST);
    case "route": {
      const routeTasks = [...incident.routeTasks, command.task];
      const decided = step >= STEP.decided && step <= STEP.repaired;
      if (!decided || incident.routeTasks.includes(command.task)) {
        return NOT_NOW;
      }
      return update({ route_tasks: routeTasks });
    }
    case "startWork":
      if (workOrder?.status !== "issued") return NOT_NOW;
      await updateWorkOrder(workOrder.id, {
        status: "in_progress",
        started_at: now(),
      });
      return DONE;
    case "finishWork":
      if (workOrder?.status !== "in_progress") return NOT_NOW;
      await finishWorkOrder(workOrder.id);
      return DONE;
    case "restore":
      if (step !== STEP.repaired || workOrder == null) return NOT_NOW;
      await updateWorkOrder(workOrder.id, { status: "returned" });
      return update({ status: "restored" });
    case "close":
      if (step !== STEP.restored) return NOT_NOW;
      return update({ status: "closed", closed_at: now() });
  }
}

// Датчик ЭЦ: стрелка С3 потеряла контроль — система открывает инцидент.
async function detect({ stationId }: Context) {
  const { data, error } = await db()
    .from("incidents")
    .insert({
      station_id: stationId,
      kind: "switch_fault",
      object_id: "С3",
      source: "iot",
      severity: "high",
      title: INCIDENT.title,
      description: INCIDENT.description,
    })
    .select("id, code")
    .single<{ id: string; code: string }>();
  if (error != null) throw error;

  const entries = journalOf(
    { kind: "detect" },
    { code: data.code, option: null, routed: [] },
  );
  await log(stationId, data.id, entries);
  return DONE;
}

// Меняет инцидент и пишет в хронологию, что сделал участник.
async function updateIncident(
  { stationId }: Context,
  incident: LiveIncident,
  command: Command,
  patch: IncidentPatch,
) {
  const { error } = await db()
    .from("incidents")
    .update(patch)
    .eq("id", incident.id);
  if (error != null) throw error;

  const entries = journalOf(command, {
    code: incident.code,
    option: patch.option === undefined ? incident.option : patch.option,
    routed: patch.route_tasks ?? incident.routeTasks,
  });
  await log(stationId, incident.id, entries);
  return DONE;
}

async function issueWorkOrder(
  { stationId, operatorId }: Context,
  incident: LiveIncident,
) {
  const { data, error } = await db()
    .from("work_orders")
    .insert({
      station_id: stationId,
      incident_id: incident.id,
      object_id: "С3",
      service: WORK_ORDER.service,
      title: WORK_ORDER.title,
      description: WORK_ORDER.description,
      created_by: operatorId,
    })
    .select("id")
    .single<{ id: string }>();
  if (error != null) throw error;

  const items = WORK_ORDER.items.map((text, i) => ({
    work_order_id: data.id,
    position: i + 1,
    text,
  }));
  const { error: itemsError } = await db()
    .from("work_order_items")
    .insert(items);
  if (itemsError != null) throw itemsError;
}

// Симуляция службы: все пункты отмечены, работы выполнены.
async function finishWorkOrder(id: string) {
  const at = now();
  const { error } = await db()
    .from("work_order_items")
    .update({ done_at: at })
    .eq("work_order_id", id)
    .is("done_at", null);
  if (error != null) throw error;
  await updateWorkOrder(id, { status: "done", done_at: at });
}

async function updateWorkOrder(id: string, patch: object) {
  const { error } = await db().from("work_orders").update(patch).eq("id", id);
  if (error != null) throw error;
}

// Демо с чистого листа: хронология и инциденты станции, наряды уходят
// каскадом вслед за инцидентом.
async function reset(stationId: string) {
  const events = await db()
    .from("timeline_events")
    .delete()
    .eq("station_id", stationId);
  if (events.error != null) throw events.error;
  const { error } = await db()
    .from("incidents")
    .delete()
    .eq("station_id", stationId);
  if (error != null) throw error;
  return DONE;
}

async function log(
  stationId: string,
  incidentId: string,
  entries: JournalEntry[],
) {
  if (entries.length === 0) return;
  const rows = entries.map((entry) => ({
    station_id: stationId,
    incident_id: incidentId,
    at: simAt(entry.minute),
    actor: entry.actor,
    text: entry.text,
    level: entry.level ?? null,
  }));
  const { error } = await db().from("timeline_events").insert(rows);
  if (error != null) throw error;
}

// Пишет сервер секретным ключом: политик записи у таблиц нет.
function db() {
  return createSupabaseAdminClient();
}

function now() {
  return new Date().toISOString();
}
