import { supabaseAdmin } from "@/lib/supabase";
import { OBSTRUCTION, REPAIR } from "./fault";
import { type JournalEntry, simAt } from "./journal";
import type { LiveIncident } from "./types";
import type { WorkPlan } from "./workPlan";

// Записи сценария в базу: инцидент, наряд, хронология. Пишет сервер
// секретным ключом — политик записи у таблиц нет. Можно ли писать, решают
// вызывающие: команды пульта и сигнал камеры.

// Что увидела камера.
export type Sighting = {
  deviceId: string;
  snapshot: string;
  // Вывод ИИ по снимку; null — без анализа.
  analysis: string | null;
};

// Кто выдаёт наряд: станция и диспетчер, отправивший ремонтную бригаду.
type Issuer = { stationId: string; operatorId: string };

// Камера увидела предмет в стрелке С3: система открывает инцидент со
// снимком и закрывает маршруты.
export async function openIncident(stationId: string, sighting: Sighting) {
  const { data, error } = await supabaseAdmin()
    .from("incidents")
    .insert({
      station_id: stationId,
      kind: "switch_fault",
      object_id: "С3",
      source: "iot",
      severity: "high",
      title: OBSTRUCTION.title,
      description: OBSTRUCTION.description,
      device_id: sighting.deviceId,
      snapshot: sighting.snapshot,
      analysis: sighting.analysis,
    })
    .select("id, code")
    .single<{ id: string; code: string }>();
  if (error != null) throw error;

  const entries: JournalEntry[] = [
    { minute: 8, actor: "iot", text: OBSTRUCTION.signal, level: "warning" },
  ];
  if (sighting.analysis != null) {
    entries.push({
      minute: 8,
      actor: "system",
      text: `ИИ: ${sighting.analysis}`,
    });
  }
  entries.push({
    minute: 8,
    actor: "system",
    text: `Создан инцидент ${data.code} «подозрение». Маршруты через С3 закрыты`,
    level: "warning",
  });
  await log(stationId, data.id, entries);
  return data;
}

// Наряд ремонтной бригаде по плану работ: печатный лист с QR на чеклист.
export async function issueWorkOrder(
  { stationId, operatorId }: Issuer,
  incident: LiveIncident,
  plan: WorkPlan,
) {
  const { data, error } = await supabaseAdmin()
    .from("work_orders")
    .insert({
      station_id: stationId,
      incident_id: incident.id,
      object_id: "С3",
      service: REPAIR.service,
      title: plan.title,
      description: plan.description,
      work_window: plan.window,
      safety: plan.safety,
      created_by: operatorId,
    })
    .select("id")
    .single<{ id: string }>();
  if (error != null) throw error;

  const items = plan.items.map((text, i) => ({
    work_order_id: data.id,
    position: i + 1,
    text,
  }));
  const inserted = await supabaseAdmin().from("work_order_items").insert(items);
  if (inserted.error != null) throw inserted.error;
}

// Симуляция службы: все пункты отмечены, работы выполнены.
export async function finishWorkOrder(id: string) {
  const at = now();
  const { error } = await supabaseAdmin()
    .from("work_order_items")
    .update({ done_at: at })
    .eq("work_order_id", id)
    .is("done_at", null);
  if (error != null) throw error;
  await updateWorkOrder(id, { status: "done", done_at: at });
}

export async function updateWorkOrder(id: string, patch: object) {
  const { error } = await supabaseAdmin()
    .from("work_orders")
    .update(patch)
    .eq("id", id);
  if (error != null) throw error;
}

// Демо с чистого листа: пейджер, хронология и инциденты станции, наряды
// уходят каскадом вслед за инцидентом.
export async function resetStation(stationId: string) {
  for (const table of ["pager_messages", "timeline_events", "incidents"]) {
    const { error } = await supabaseAdmin()
      .from(table)
      .delete()
      .eq("station_id", stationId);
    if (error != null) throw error;
  }
}

// Записи в хронологию станции от имени участников.
export async function log(
  stationId: string,
  incidentId: string,
  entries: JournalEntry[],
) {
  if (entries.length === 0) return;
  const rows = entries.map((entry) => ({
    station_id: stationId,
    incident_id: incidentId,
    at: simAt(entry.minute),
    actor: entry.actor,
    text: entry.text,
    level: entry.level ?? null,
  }));
  const { error } = await supabaseAdmin().from("timeline_events").insert(rows);
  if (error != null) throw error;
}

export function now() {
  return new Date().toISOString();
}
