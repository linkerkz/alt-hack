"use server";

import { refresh } from "next/cache";
import { createSupabaseClient } from "@/lib/supabase";
import { runOn } from "./commands";
import { getLive } from "./live";
import type {
  ApprovalAnswer,
  Command,
  CommandResult,
  ConsoleRole,
} from "./types";

// Кто может отдать команду. Датчик и служба — симуляция с демо-пульта, её
// запускают оба диспетчера станции. За ДНЦ на пульте только «Далее»
// согласует; сам ДНЦ отвечает с карты — answerApproval.
const BOTH: ConsoleRole[] = ["dscs", "dsp"];
const ROLES: Record<Command["kind"], ConsoleRole[]> = {
  detect: BOTH,
  confirm: ["dsp"],
  dismiss: ["dsp"],
  accept: ["dscs"],
  approve: BOTH,
  reject: [],
  reconsider: [],
  route: ["dsp"],
  startWork: BOTH,
  finishWork: BOTH,
  restore: ["dsp"],
  close: ["dscs"],
  advance: BOTH,
  reset: BOTH,
};

// Комментарий ДНЦ длиннее не пишем: то же ограничение стоит в базе.
const COMMENT_LIMIT = 200;

// Действие участника на пульте станции. Server Action доступен прямым POST,
// поэтому роль и станцию проверяем здесь, а шаг — в самой команде.
export async function runCommand(
  stationId: string,
  command: Command,
): Promise<CommandResult> {
  const operator = await consoleOperator();
  if (operator == null || operator.stationId !== stationId) {
    return { error: "Пульт этой станции вам недоступен" };
  }
  if (!ROLES[command.kind].includes(operator.role)) {
    return { error: "Это действие другой роли" };
  }
  return run(stationId, operator.id, command);
}

// Ответ ДНЦ на запрос на согласование с карты сети: только своему кругу.
export async function answerApproval(
  stationId: string,
  answer: ApprovalAnswer,
): Promise<CommandResult> {
  const profile = await currentProfile();
  if (profile?.role !== "dnc" || profile.dispatch_area_id == null) {
    return { error: "Отвечает только поездной диспетчер" };
  }
  const areaId = await stationAreaId(stationId);
  if (areaId !== profile.dispatch_area_id) {
    return { error: "Станция вне вашего диспетчерского круга" };
  }
  const command = cleanAnswer(answer);
  if (command == null) return { error: "Неизвестный ответ" };
  return run(stationId, profile.id, command);
}

async function run(stationId: string, operatorId: string, command: Command) {
  const live = await getLive(stationId);
  const result = await runOn({ stationId, operatorId, live }, command);
  // Остальные экраны подхватят изменение при автообновлении.
  if (result.error == null) refresh();
  return result;
}

// Диспетчер станции, который нажал кнопку; null — не вошёл или не диспетчер.
async function consoleOperator() {
  const profile = await currentProfile();
  if (profile == null || !isConsoleRole(profile.role)) return null;
  return { id: profile.id, role: profile.role, stationId: profile.station_id };
}

async function currentProfile() {
  const supabase = await createSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (userId == null) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, role, station_id, dispatch_area_id")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();
  return data;
}

async function stationAreaId(stationId: string) {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("stations")
    .select("dispatch_area_id")
    .eq("id", stationId)
    .maybeSingle<{ dispatch_area_id: string | null }>();
  return data?.dispatch_area_id ?? null;
}

// Ответ пришёл из браузера: оставляем только известные поля, комментарий
// обрезаем, пустой — null. Чужая команда — null.
function cleanAnswer(answer: ApprovalAnswer): ApprovalAnswer | null {
  switch (answer.kind) {
    case "reconsider":
      return { kind: "reconsider" };
    case "approve":
    case "reject":
      return { kind: answer.kind, comment: cleanComment(answer.comment) };
    default:
      return null;
  }
}

function cleanComment(comment: unknown) {
  if (typeof comment !== "string") return null;
  const text = comment.trim().slice(0, COMMENT_LIMIT);
  return text === "" ? null : text;
}

function isConsoleRole(role: string): role is ConsoleRole {
  return role === "dscs" || role === "dsp";
}

type ProfileRow = {
  id: string;
  role: string;
  station_id: string | null;
  dispatch_area_id: string | null;
};
