import { supabaseAdmin } from "@/lib/supabase";
import { journalOf } from "./journal";
import { STEP } from "./mock";
import {
  finishWorkOrder,
  issueWorkOrder,
  log,
  now,
  openIncident,
  resetStation,
  updateWorkOrder,
} from "./records";
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

// Команды пульта: роль уже проверена в actions.ts; здесь каждая команда
// проверяет, что её очередь, — шаг мог смениться на другом экране. Сами
// записи в базу — records.ts.

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
    await openIncident(context.stationId, { device: null });
    return DONE;
  }
  if (command.kind === "advance") {
    const next = nextCommand(live);
    if (next == null) return { error: "Сценарий пройден — нажмите «Сброс»" };
    return dispatch(context, next);
  }
  if (command.kind === "reset") {
    await resetStation(context.stationId);
    return DONE;
  }
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

// Меняет инцидент и пишет в хронологию, что сделал участник.
async function updateIncident(
  { stationId }: Context,
  incident: LiveIncident,
  command: Command,
  patch: IncidentPatch,
) {
  const { error } = await supabaseAdmin()
    .from("incidents")
    .update(patch)
    .eq("id", incident.id);
  if (error != null) throw error;

  const entries = journalOf(command, {
    code: incident.code,
    detection: incident.detection,
    option: patch.option === undefined ? incident.option : patch.option,
    routed: patch.route_tasks ?? incident.routeTasks,
  });
  await log(stationId, incident.id, entries);
  return DONE;
}
