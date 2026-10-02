import { supabaseAdmin } from "@/lib/supabase";
import { closeCall } from "./pager";
import { log, now, openIncident } from "./records";
import type { IncidentStatus } from "./types";

// Сигнал камеры горловины над стрелкой С3. Камера приходит без входа, поэтому
// инцидент читаем и пишем секретным ключом; устройство уже проверил вызывающий.

type CameraSignal = {
  deviceId: string;
  state: "obstruction" | "clear";
  // Кадр в момент сигнала (data URL JPEG).
  snapshot: string;
  // Что распознал ИИ на самой камере: «бутылка 92%»; null — не назвал.
  label: string | null;
  // Что сказал облачный ИИ по кадру; null — не подключён или не ответил.
  ai: { agrees: boolean; summary: string } | null;
};

// Ответ камере: что сделала система — его показывает экран камеры.
type CameraReply = { text: string; incidentCode: string | null };

export async function reportCamera(
  stationId: string,
  signal: CameraSignal,
): Promise<CameraReply> {
  const last = await lastIncident(stationId);
  const isOpen = last != null && last.status !== "closed";

  const { ai } = signal;

  if (signal.state === "obstruction") {
    // ИИ не видит препятствия: рука, тень, блик — тревогу не поднимаем.
    if (ai?.agrees === false) {
      return {
        text: `ИИ: ложное срабатывание. ${ai.summary}`,
        incidentCode: null,
      };
    }
    if (isOpen) {
      return { text: "Инцидент уже открыт", incidentCode: last.code };
    }
    const opened = await openIncident(stationId, {
      deviceId: signal.deviceId,
      snapshot: signal.snapshot,
      analysis: analysisOf(signal),
    });
    return {
      text:
        ai == null
          ? "Инцидент открыт, ДСП проверяет снимок"
          : `ИИ подтвердил: ${ai.summary}`,
      incidentCode: opened.code,
    };
  }

  if (!isOpen || last.device_id !== signal.deviceId) {
    return { text: "Стрелка свободна", incidentCode: null };
  }
  // Детектор считает, что стало чисто, а ИИ ещё видит предмет — ждём.
  if (ai?.agrees === false) {
    return {
      text: `ИИ: предмет ещё в стрелке. ${ai.summary}`,
      incidentCode: last.code,
    };
  }
  if (isPending(last.status)) {
    await resolve(stationId, last.id, ai != null);
    return {
      text: "Стрелка свободна — инцидент закрыт",
      incidentCode: last.code,
    };
  }
  await log(stationId, last.id, [
    {
      actor: "iot",
      text: `${seenBy(ai != null)}: стрелка С3 свободна, предмет убран`,
      level: "normal",
    },
  ]);
  return { text: "Стрелка свободна — ДСП видит это", incidentCode: last.code };
}

// Предмет ещё не оказался серьёзной проблемой: ДСП не вызвал путейцев или
// они не дошли. Тогда камера сама закрывает инцидент.
function isPending(status: IncidentStatus) {
  return status === "suspected" || status === "dispatched";
}

// Камера видит, что стало свободно: инцидент закрыт, вызов на пейджере —
// отбой. Перепланирование не понадобилось.
async function resolve(stationId: string, incidentId: string, withAi: boolean) {
  const { error } = await supabaseAdmin()
    .from("incidents")
    .update({ status: "closed", closed_at: now() })
    .eq("id", incidentId);
  if (error != null) throw error;
  await closeCall(incidentId, "cancelled");
  await log(stationId, incidentId, [
    {
      actor: "iot",
      text: `${seenBy(withAi)}: стрелка С3 свободна, предмет убран. Инцидент закрыт`,
      level: "normal",
    },
  ]);
}

function seenBy(withAi: boolean) {
  return withAi ? "Камера и ИИ" : "Камера";
}

// Вывод ИИ для ДСП: что распознала камера и что добавил облачный ИИ.
function analysisOf({ label, ai }: CameraSignal) {
  const parts = [
    label == null ? null : `камера распознала: ${label}`,
    ai?.summary ?? null,
  ].filter((part) => part != null);
  return parts.length === 0 ? null : parts.join(". ");
}

async function lastIncident(stationId: string) {
  const { data, error } = await supabaseAdmin()
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
