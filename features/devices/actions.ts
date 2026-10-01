"use server";

import { refresh } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/uuid";
import { getDevice } from "./queries";
import type { PagerAnswer, PagerMessageStatus } from "./types";

type Result = { error: string | null };

const NOT_FOUND = { error: "Сообщение не найдено" };
const OUTDATED = { error: "Уже неактуально — экран обновлён" };
const SEND_FAILED = { error: "Не удалось отправить, попробуйте ещё раз" };

// Ответ бригады с пейджера. Пейджер открывают по ссылке без входа: право
// даёт uuid устройства, поэтому заново проверяем, что сообщение — станции
// этого пейджера и что ответ ещё уместен. Инцидент по ответу на вызов
// двигает сама база (триггер pager_message_answer).
export async function answerMessage(
  deviceId: string,
  messageId: string,
  answer: PagerAnswer,
): Promise<Result> {
  const device = await getDevice(deviceId);
  if (device?.kind !== "pager" || !isUuid(messageId)) return NOT_FOUND;
  const message = await stationMessage(messageId, device.stationId);
  if (message == null) return NOT_FOUND;

  const from = previousStatus(answer, message.incident_id != null);
  if (from == null || message.status !== from) return OUTDATED;

  const { data, error } = await supabaseAdmin()
    .from("pager_messages")
    .update({ status: answer, answered_at: new Date().toISOString() })
    .eq("id", messageId)
    .eq("status", from)
    .select("id");
  if (error != null) return SEND_FAILED;
  if (data.length === 0) return OUTDATED;

  refresh();
  return { error: null };
}

async function stationMessage(id: string, stationId: string) {
  const { data } = await supabaseAdmin()
    .from("pager_messages")
    .select("incident_id, status")
    .eq("id", id)
    .eq("station_id", stationId)
    .maybeSingle<MessageRow>();
  return data;
}

// Из какого состояния уместен ответ; null — ответ не для этого сообщения.
// Вызов: принять, затем «устранено» или «нужен ремонт». Задача: выполнено.
function previousStatus(
  answer: PagerAnswer,
  isCall: boolean,
): PagerMessageStatus | null {
  if (!isCall) return answer === "done" ? "sent" : null;
  if (answer === "accepted") return "sent";
  if (answer === "done" || answer === "escalated") return "accepted";
  return null;
}

type MessageRow = {
  incident_id: string | null;
  status: PagerMessageStatus;
};
