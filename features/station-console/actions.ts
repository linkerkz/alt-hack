"use server";

import { refresh } from "next/cache";
import { createSupabaseClient } from "@/lib/supabase";
import { runOn } from "./commands";
import { getLive } from "./live";
import type { Command, CommandResult, ConsoleRole } from "./types";

// Кто может отдать команду. Датчик, ДНЦ и служба — симуляция с демо-пульта,
// её запускают оба диспетчера станции.
const BOTH: ConsoleRole[] = ["dscs", "dsp"];
const ROLES: Record<Command["kind"], ConsoleRole[]> = {
  detect: BOTH,
  confirm: ["dsp"],
  dismiss: ["dsp"],
  accept: ["dscs"],
  approve: BOTH,
  route: ["dsp"],
  startWork: BOTH,
  finishWork: BOTH,
  restore: ["dsp"],
  close: ["dscs"],
  advance: BOTH,
  reset: BOTH,
};

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

  const live = await getLive(stationId);
  const result = await runOn(
    { stationId, operatorId: operator.id, live },
    command,
  );
  // Остальные экраны станции подхватят изменение при автообновлении.
  if (result.error == null) refresh();
  return result;
}

// Диспетчер станции, который нажал кнопку; null — не вошёл или не диспетчер.
async function consoleOperator() {
  const supabase = await createSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (userId == null) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, role, station_id")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();
  if (data == null || !isConsoleRole(data.role)) return null;
  return { id: data.id, role: data.role, stationId: data.station_id };
}

function isConsoleRole(role: string): role is ConsoleRole {
  return role === "dscs" || role === "dsp";
}

type ProfileRow = { id: string; role: string; station_id: string | null };
