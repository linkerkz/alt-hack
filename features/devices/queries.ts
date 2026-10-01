import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/uuid";
import type { Device, PagerMessage, PagerMessageStatus } from "./types";

// Сколько сообщений показывает пейджер: свежие сверху.
const PAGER_LIMIT = 8;

// Устройство по uuid из ссылки; null — нет такого. Устройство открывают без
// входа, поэтому читаем секретным ключом. Кэш на запрос: страница и её
// метаданные читают по разу.
export const getDevice = cache(async (id: string): Promise<Device | null> => {
  if (!isUuid(id)) return null;

  const { data } = await supabaseAdmin()
    .from("devices")
    .select("id, station_id, kind, name, object_id")
    .eq("id", id)
    .maybeSingle<DeviceRow>();

  return data == null ? null : toDevice(data);
});

// Устройства станции для страницы с QR: сначала камеры, потом пейджеры,
// с временем последнего сигнала (null — ещё не выходило на связь).
export async function getStationDevices(stationId: string) {
  const { data } = await supabaseAdmin()
    .from("devices")
    .select("id, station_id, kind, name, object_id, last_seen_at")
    .eq("station_id", stationId)
    .order("kind")
    .order("name")
    .overrideTypes<ListedRow[], { merge: false }>();

  return (data ?? []).flatMap((row) => {
    const device = toDevice(row);
    return device == null ? [] : [{ device, lastSeenAt: row.last_seen_at }];
  });
}

// Сообщения пейджера станции: вызовы и задачи ДСП, свежие сверху.
export async function getPagerMessages(
  stationId: string,
): Promise<PagerMessage[]> {
  const { data } = await supabaseAdmin()
    .from("pager_messages")
    .select("id, incident_id, text, status, created_at")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false })
    .limit(PAGER_LIMIT)
    .overrideTypes<MessageRow[], { merge: false }>();

  return (data ?? []).map((row) => ({
    id: row.id,
    isCall: row.incident_id != null,
    text: row.text,
    status: row.status,
    createdAt: row.created_at,
  }));
}

// Строка из базы без сгенерированных типов — форму задаём руками.
// Объект камеры гарантирует check в базе; иначе устройство не наше.
function toDevice(row: DeviceRow): Device | null {
  const base = { id: row.id, stationId: row.station_id, name: row.name };
  if (row.kind === "camera" && row.object_id != null) {
    return { ...base, kind: "camera", objectId: row.object_id };
  }
  if (row.kind === "pager") return { ...base, kind: "pager" };
  return null;
}

type DeviceRow = {
  id: string;
  station_id: string;
  kind: "camera" | "pager";
  name: string;
  object_id: string | null;
};

type ListedRow = DeviceRow & { last_seen_at: string | null };

type MessageRow = {
  id: string;
  incident_id: string | null;
  text: string;
  status: PagerMessageStatus;
  created_at: string;
};
