import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/uuid";
import type { Device, Service } from "./types";

// Устройство по uuid из ссылки; null — нет такого. Устройство открывают без
// входа, поэтому читаем секретным ключом. Кэш на запрос: страница и её
// метаданные читают по разу.
export const getDevice = cache(async (id: string): Promise<Device | null> => {
  if (!isUuid(id)) return null;

  const { data } = await supabaseAdmin()
    .from("devices")
    .select("id, station_id, kind, name, object_id, service")
    .eq("id", id)
    .maybeSingle<DeviceRow>();

  return data == null ? null : toDevice(data);
});

// Устройства станции для страницы с QR: сначала камеры, потом пейджеры,
// с временем последнего сигнала (null — ещё не выходило на связь).
export async function getStationDevices(stationId: string) {
  const { data } = await supabaseAdmin()
    .from("devices")
    .select("id, station_id, kind, name, object_id, service, last_seen_at")
    .eq("station_id", stationId)
    .order("kind")
    .order("name")
    .overrideTypes<ListedRow[], { merge: false }>();

  return (data ?? []).flatMap((row) => {
    const device = toDevice(row);
    return device == null ? [] : [{ device, lastSeenAt: row.last_seen_at }];
  });
}

// Строка из базы без сгенерированных типов — форму задаём руками.
// Поля камеры и пейджера гарантирует check в базе; иначе устройство не наше.
function toDevice(row: DeviceRow): Device | null {
  const base = { id: row.id, stationId: row.station_id, name: row.name };
  if (row.kind === "camera" && row.object_id != null) {
    return { ...base, kind: "camera", objectId: row.object_id };
  }
  if (row.kind === "pager" && row.service != null) {
    return { ...base, kind: "pager", service: row.service };
  }
  return null;
}

type DeviceRow = {
  id: string;
  station_id: string;
  kind: "camera" | "pager";
  name: string;
  object_id: string | null;
  service: Service | null;
};

type ListedRow = DeviceRow & { last_seen_at: string | null };
