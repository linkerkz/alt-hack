import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/uuid";
import type { Service, WorkOrder, WorkOrderStatus } from "./types";

const COLUMNS =
  "id, station_id, object_id, service, title, description, status, created_at, done_at, result_note, work_order_items(id, position, text, done_at)";

// Наряд с пунктами по порядку; null — нет такого наряда.
// Кэш на запрос: страница и её метаданные читают наряд по разу.
export const getWorkOrder = cache(
  async (id: string): Promise<WorkOrder | null> => {
    if (!isUuid(id)) return null;

    const supabase = supabaseAdmin();
    const { data } = await supabase
      .from("work_orders")
      .select(COLUMNS)
      .eq("id", id)
      .maybeSingle();

    return data == null ? null : toWorkOrder(data);
  },
);

// Строка из базы без сгенерированных типов — форму задаём руками.
function toWorkOrder(row: WorkOrderRow): WorkOrder {
  const items = row.work_order_items
    .toSorted((a, b) => a.position - b.position)
    .map((item) => ({ id: item.id, text: item.text, doneAt: item.done_at }));

  return {
    id: row.id,
    stationId: row.station_id,
    objectId: row.object_id,
    service: row.service,
    title: row.title,
    description: row.description,
    status: row.status,
    createdAt: row.created_at,
    doneAt: row.done_at,
    resultNote: row.result_note,
    items,
  };
}

type WorkOrderRow = {
  id: string;
  station_id: string;
  object_id: string;
  service: Service;
  title: string;
  description: string;
  status: WorkOrderStatus;
  created_at: string;
  done_at: string | null;
  result_note: string | null;
  work_order_items: ItemRow[];
};

type ItemRow = {
  id: string;
  position: number;
  text: string;
  done_at: string | null;
};
