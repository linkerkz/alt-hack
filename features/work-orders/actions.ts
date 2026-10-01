"use server";

import { refresh } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { getWorkOrder } from "./queries";
import { isTaken } from "./status";
import type { ActionResult } from "./types";

const SAVE_FAILED = { error: "Не удалось сохранить, попробуйте ещё раз" };

// Действия рабочего по ссылке без входа: право даёт знание id наряда,
// поэтому каждое действие заново проверяет наряд и его состояние. После
// действия обновляется экран, с которого его отдали: чеклист по QR или пейджер.

// Рабочий взял наряд в работу: с этого момента отмечает чеклист. База сама
// переводит инцидент в «работы идут» и пишет событие в хронологию станции.
export async function takeWork(orderId: string): Promise<ActionResult> {
  const order = await getWorkOrder(orderId);
  if (order == null) return { error: "Наряд не найден" };
  if (order.status !== "issued") return { error: "Наряд уже в работе" };

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("work_orders")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "issued");
  if (error != null) return SAVE_FAILED;

  refresh();
  return { error: null };
}

export async function toggleItem(
  orderId: string,
  itemId: string,
  done: boolean,
): Promise<ActionResult> {
  const order = await getWorkOrder(orderId);
  if (order == null || !order.items.some((item) => item.id === itemId)) {
    return { error: "Наряд не найден" };
  }
  if (!isTaken(order.status)) {
    return { error: "Сначала возьмите наряд в работу" };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("work_order_items")
    .update({ done_at: done ? new Date().toISOString() : null })
    .eq("id", itemId);
  if (error != null) return SAVE_FAILED;

  refresh();
  return { error: null };
}

// Рабочий сообщил о выполнении: все пункты отмечены, итог для ДСП — по желанию.
export async function completeWork(
  orderId: string,
  note: string | null,
): Promise<ActionResult> {
  const order = await getWorkOrder(orderId);
  if (order == null) return { error: "Наряд не найден" };
  if (!isTaken(order.status)) {
    return { error: "Сначала возьмите наряд в работу" };
  }
  if (order.items.some((item) => item.doneAt == null)) {
    return { error: "Отметьте все пункты чеклиста" };
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("work_orders")
    .update({
      status: "done",
      done_at: new Date().toISOString(),
      result_note: note,
    })
    .eq("id", orderId);
  if (error != null) return SAVE_FAILED;

  refresh();
  return { error: null };
}

// Форма «Работы выполнены» на чеклисте по QR: итог — из поля note.
export async function submitCompletion(
  orderId: string,
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const note = String(formData.get("note") ?? "").trim();
  return completeWork(orderId, note === "" ? null : note);
}
