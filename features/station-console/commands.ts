import { supabaseAdmin } from "@/lib/supabase";
import { activePlan } from "./activePlan";
import { recommendedFor } from "./advice";
import { CREW_CALL, REPAIR } from "./fault";
import { journalOf } from "./journal";
import { STEP } from "./mock";
import { operationById } from "./operations";
import { closeCall, sendToPager } from "./pager";
import {
  finishWorkOrder,
  issueWorkOrder,
  log,
  now,
  resetStation,
  updateWorkOrder,
} from "./records";
import { optionChanges } from "./replan";
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
import { generateWorkPlan } from "./workPlan";

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
// Своё поручение длиннее — уже не сообщение на пейджер.
const NOTE_LIMIT = 200;
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

  if (command.kind === "assign") return assign(context, command.operation);
  if (command.kind === "note") return note(context, command.text);
  if (command.kind === "advance") {
    const next = nextCommand(live, recommendedFor(live));
    if (next == null) return { error: advanceEnd(step) };
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
    case "callCrew":
      if (step !== STEP.suspected) return NOT_NOW;
      await sendToPager(context.stationId, {
        text: CREW_CALL,
        incidentId: incident.id,
        operation: null,
      });
      return update({ status: "dispatched" });
    case "escalate":
      // Сам инцидент двигает база по ответу на вызов.
      if (step !== STEP.dispatched) return NOT_NOW;
      await closeCall(incident.id, "escalated");
      return DONE;
    case "callRepair":
      if (step !== STEP.escalated) return NOT_NOW;
      return update({ status: "confirmed" });
    case "planWork":
      if (step !== STEP.decided || workOrder != null) return NOT_NOW;
      return planWork(context, incident);
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

// Поручение бригаде по операции действующего плана; уже поручённую и не
// выполненную второй раз не шлём.
async function assign({ stationId, live }: Context, id: string) {
  const operation = operationById(activePlan(live), id);
  if (operation == null) return NOT_NOW;
  const sent = live.pager.find((message) => message.operation === id);
  if (sent != null && sent.status !== "done") {
    return { error: "Уже поручено — бригада ещё не ответила" };
  }
  await sendToPager(stationId, {
    text: operation.text,
    incidentId: null,
    operation: id,
  });
  return DONE;
}

// Своё поручение ДСП: текст пришёл из браузера — чистим и ограничиваем.
async function note({ stationId }: Context, raw: unknown) {
  const text = typeof raw === "string" ? raw.trim().slice(0, NOTE_LIMIT) : "";
  if (text === "") return { error: "Напишите, что поручить бригаде" };
  await sendToPager(stationId, { text, incidentId: null, operation: null });
  return DONE;
}

// Вариант принят — ИИ составляет план работ и чеклист, по ним выдаётся
// наряд с QR. Без ответа ИИ наряд не выдаём: ДСП повторит.
async function planWork(context: Context, incident: LiveIncident) {
  if (incident.option == null) return NOT_NOW;
  const plan = await generateWorkPlan(incident.option, context.live);
  if (plan == null) {
    return { error: "ИИ не составил план работ — попробуйте ещё раз" };
  }
  await issueWorkOrder(context, incident, plan);
  await log(context.stationId, incident.id, [
    {
      actor: "system",
      text: `ИИ составил план работ «${plan.title}»: ${plan.items.length} пунктов. Наряд ${REPAIR.crew.toLowerCase()} выдан`,
    },
  ]);
  return DONE;
}

// Меняет инцидент и пишет в хронологию, что сделал участник.
async function updateIncident(
  { stationId, live }: Context,
  incident: LiveIncident,
  command: Command,
  patch: IncidentPatch,
) {
  const { error } = await supabaseAdmin()
    .from("incidents")
    .update(patch)
    .eq("id", incident.id);
  if (error != null) throw error;

  const option = patch.option === undefined ? incident.option : patch.option;
  const entries = journalOf(command, {
    code: incident.code,
    option,
    routed: patch.route_tasks ?? incident.routeTasks,
    changes: option == null ? [] : optionChanges(live, option),
  });
  await log(stationId, incident.id, entries);
  return DONE;
}

// «Далее» больше нечего делать: инцидент ещё не открыт или сценарий пройден.
function advanceEnd(step: number) {
  return step === STEP.normal
    ? "Инцидент открывает камера — поставьте предмет перед ней"
    : "Сценарий пройден — нажмите «Сброс»";
}
