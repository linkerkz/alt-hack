import { supabaseAdmin } from "@/lib/supabase";
import type { PagerMessage, PagerMessageStatus } from "./types";

// Пейджер станционной бригады со стороны станции: ДСП отправляет вызов или
// задачу, камера даёт отбой. Ответы бригады с пейджера двигают инцидент в
// базе (триггер pager_message_answer). Пишет сервер секретным ключом.

// Сколько сообщений пейджера держит пульт.
const PAGER_LIMIT = 6;

// Пока бригада не ответила окончательно, вызов можно закрыть.
const OPEN: PagerMessageStatus[] = ["sent", "accepted"];

// Сообщение бригаде; incidentId: null — обычная задача ДСП.
export async function sendToPager(
  stationId: string,
  text: string,
  incidentId: string | null,
) {
  const { error } = await supabaseAdmin()
    .from("pager_messages")
    .insert({ station_id: stationId, incident_id: incidentId, text });
  if (error != null) throw error;
}

// Открытый вызов по инциденту получает итог: escalated — симуляция ответа
// путейцев для «Далее», cancelled — отбой, камера видит, что стало свободно.
export async function closeCall(
  incidentId: string,
  status: "escalated" | "cancelled",
) {
  const { error } = await supabaseAdmin()
    .from("pager_messages")
    .update({ status, answered_at: new Date().toISOString() })
    .eq("incident_id", incidentId)
    .in("status", OPEN);
  if (error != null) throw error;
}

// Сообщения пейджера станции, свежие сверху.
export async function stationPager(stationId: string) {
  const { data } = await supabaseAdmin()
    .from("pager_messages")
    .select("id, incident_id, text, status")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false })
    .limit(PAGER_LIMIT)
    .overrideTypes<MessageRow[], { merge: false }>();

  return (data ?? []).map(
    (row): PagerMessage => ({
      id: row.id,
      incidentId: row.incident_id,
      text: row.text,
      status: row.status,
    }),
  );
}

type MessageRow = {
  id: string;
  incident_id: string | null;
  text: string;
  status: PagerMessageStatus;
};
