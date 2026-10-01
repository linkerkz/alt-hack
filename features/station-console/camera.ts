import { createSupabaseAdminClient } from "@/lib/supabase";
import { log, openIncident } from "./commands";
import type { IncidentStatus } from "./types";

// Сигнал камеры горловины над стрелкой С3. Камера приходит без входа, поэтому
// инцидент читаем и пишем секретным ключом; устройство уже проверил вызывающий.

export type CameraSignal = {
  deviceId: string;
  state: "obstruction" | "clear";
  // Кадр в момент сигнала (data URL JPEG).
  snapshot: string;
};

// Ответ камере: что сделала система — его показывает экран камеры.
export type CameraReply = { text: string; incidentCode: string | null };

export async function reportCamera(
  stationId: string,
  signal: CameraSignal,
): Promise<CameraReply> {
  const last = await lastIncident(stationId);
  const isOpen = last != null && last.status !== "closed";

  if (signal.state === "obstruction") {
    if (isOpen) {
      return { text: "Инцидент уже открыт", incidentCode: last.code };
    }
    const opened = await openIncident(stationId, {
      device: { id: signal.deviceId, snapshot: signal.snapshot },
    });
    return {
      text: "Инцидент открыт, ДСП проверяет снимок",
      incidentCode: opened.code,
    };
  }

  if (!isOpen || last.device_id !== signal.deviceId) {
    return { text: "Стрелка свободна", incidentCode: null };
  }
  await log(stationId, last.id, [
    {
      minute: last.status === "suspected" ? 9 : 26,
      actor: "iot",
      text: "Камера: стрелка С3 свободна, предмет убран",
      level: "normal",
    },
  ]);
  return { text: "Стрелка свободна — ДСП видит это", incidentCode: last.code };
}

async function lastIncident(stationId: string) {
  const { data, error } = await createSupabaseAdminClient()
    .from("incidents")
    .select("id, code, status, device_id")
    .eq("station_id", stationId)
    .order("detected_at", { ascending: false })
    .limit(1)
    .maybeSingle<IncidentRow>();
  if (error != null) throw error;
  return data;
}

type IncidentRow = {
  id: string;
  code: string;
  status: IncidentStatus;
  device_id: string | null;
};
