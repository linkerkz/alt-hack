"use client";

import { useOptimistic, useState, useTransition } from "react";
import { DeviceButton, FIREFOX_NO_RESTORE } from "@/components/ui/DeviceButton";
import { completeWork, takeWork, toggleItem } from "../actions";
import { isTaken, SERVICE_LABEL } from "../status";
import type { ActionResult, ChecklistItem, WorkOrder } from "../types";

type Props = { order: WorkOrder };

// Наряд на пейджере бригады: что сделать, взять в работу, пройти чеклист и
// сообщить о выполнении. Те же действия, что у чеклиста по QR.
export function PagerOrder({ order }: Props) {
  const [items, mark] = useOptimistic(order.items, markItem);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const taken = isTaken(order.status);
  const doneCount = items.filter((item) => item.doneAt != null).length;

  function run(action: () => Promise<ActionResult>) {
    startTransition(async () => setError((await action()).error));
  }

  function toggle(item: ChecklistItem) {
    const done = item.doneAt == null;
    run(async () => {
      mark({ id: item.id, doneAt: done ? new Date().toISOString() : null });
      return toggleItem(order.id, item.id, done);
    });
  }

  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1.5">
        <p className="text-[11px] text-device-warn uppercase tracking-[0.14em]">
          ▲ Наряд · {SERVICE_LABEL[order.service]} · объект {order.objectId}
        </p>
        <h2 className="font-bold text-[22px] uppercase leading-tight">
          {order.title}
        </h2>
        <p className="text-[13px] text-device-dim">{order.description}</p>
      </header>

      {order.status === "issued" && (
        <DeviceButton
          tone="alert"
          disabled={isPending}
          onClick={() => run(() => takeWork(order.id))}
        >
          {isPending ? "Передача…" : "Взять в работу"}
        </DeviceButton>
      )}

      <div className="flex flex-col gap-1">
        <p className="flex justify-between text-[11px] text-device-dim uppercase tracking-[0.12em]">
          <span>Чеклист</span>
          <span>
            {doneCount}/{items.length}
          </span>
        </p>
        <ul className="flex flex-col border-device-line border-t">
          {items.map((item) => (
            <li key={item.id} className="border-device-line border-b">
              <button
                type="button"
                {...FIREFOX_NO_RESTORE}
                disabled={!taken}
                onClick={() => toggle(item)}
                className="flex min-h-12 w-full cursor-pointer items-start gap-3 py-2.5 text-left text-[14px] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-device-ok">
                  {item.doneAt == null ? "[ ]" : "[x]"}
                </span>
                <span
                  className={
                    item.doneAt == null ? "" : "text-device-dim line-through"
                  }
                >
                  {item.text}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {taken && (
        <DeviceButton
          tone="alert"
          disabled={isPending || doneCount < items.length}
          onClick={() =>
            run(() => completeWork(order.id, { error: null }, new FormData()))
          }
        >
          Работы выполнены
        </DeviceButton>
      )}
      {order.status === "done" && (
        <p className="border-device-ok border-l-2 pl-3 text-[13px] text-device-ok uppercase">
          ● Работы выполнены. Объект вернёт в эксплуатацию ДСП
        </p>
      )}
      {error != null && (
        <p role="alert" className="text-[13px] text-device-alert">
          ■ {error}
        </p>
      )}
    </section>
  );
}

function markItem(
  items: ChecklistItem[],
  change: Pick<ChecklistItem, "id" | "doneAt">,
) {
  return items.map((item) =>
    item.id === change.id ? { ...item, doneAt: change.doneAt } : item,
  );
}
