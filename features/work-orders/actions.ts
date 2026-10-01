"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { getWorkOrder } from "./queries";
import { isOpen } from "./status";
import type { ActionResult } from "./types";

const SAVE_FAILED = { error: "Не удалось сохранить, попробуйте ещё раз" };

// Действия рабочего по ссылке без входа: право даёт знание id наряда,
// поэтому каждое действие заново проверяет наряд и его состояние.

export async function toggleItem(
  orderId: string,
  itemId: string,
  done: boolean,
): Promise<ActionResult> {
  const order = await getWorkOrder(orderId);
  if (order == null || !order.items.some((item) => item.id === itemId)) {
    return { error: "Наряд не найден" };
  }
  if (!isOpen(order.status)) return { error: "Наряд уже закрыт" };

  const supabase = createSupabaseAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("work_order_items")
    .update({ done_at: done ? now : null })
    .eq("id", itemId);
  if (error != null) return SAVE_FAILED;
  // Первая отметка — работы начались.
  if (order.status === "issued") {
    await supabase
      .from("work_orders")
      .update({ status: "in_progress", started_at: now })
      .eq("id", orderId);
  }

  revalidatePath(`/work-orders/${orderId}`);
  return { error: null };
}

export async function completeWork(
  orderId: string,
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const order = await getWorkOrder(orderId);
  if (order == null) return { error: "Наряд не найден" };
  if (!isOpen(order.status)) return { error: "Наряд уже закрыт" };
  if (order.items.some((item) => item.doneAt == null)) {
    return { error: "Отметьте все пункты чеклиста" };
  }

  const note = String(formData.get("note") ?? "").trim();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("work_orders")
    .update({
      status: "done",
      done_at: new Date().toISOString(),
      result_note: note === "" ? null : note,
    })
    .eq("id", orderId);
  if (error != null) return SAVE_FAILED;

  revalidatePath(`/work-orders/${orderId}`);
  return { error: null };
}
