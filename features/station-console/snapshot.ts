import { createSupabaseClient } from "@/lib/supabase";
import { isUuid } from "@/lib/uuid";
import type { LiveIncident } from "./types";

const JPEG_PREFIX = "data:image/jpeg;base64,";

// Адрес снимка камеры; null — инцидент без снимка. Снимок — отдельная
// картинка: браузер кэширует её, а не получает заново в каждом автообновлении
// пульта. Инцидент с камеры открывается всегда со снимком.
export function snapshotOf(incident: LiveIncident | null) {
  if (incident?.detection !== "camera") return null;
  return `/incidents/${incident.id}/snapshot`;
}

// JPEG снимка инцидента; null — нет инцидента, снимка или прав на станцию.
export async function getSnapshot(incidentId: string) {
  if (!isUuid(incidentId)) return null;

  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("incidents")
    .select("snapshot")
    .eq("id", incidentId)
    .maybeSingle<{ snapshot: string | null }>();

  const snapshot = data?.snapshot;
  if (snapshot == null || !snapshot.startsWith(JPEG_PREFIX)) return null;
  return Buffer.from(snapshot.slice(JPEG_PREFIX.length), "base64");
}
