"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Kicker } from "@/components/ui/Kicker";
import { Meter } from "@/components/ui/Meter";
import { toggleItem } from "../actions";
import { formatTime } from "../status";
import type { ChecklistItem } from "../types";
import { CompleteForm } from "./CompleteForm";

type Props = {
  orderId: string;
  items: ChecklistItem[];
  // Наряд открыт — пункты можно отмечать и сообщить о выполнении.
  isOpen: boolean;
};

// Чеклист рабочего: галочка ставится сразу, сервер догоняет.
export function WorkChecklist({ orderId, items, isOpen }: Props) {
  const [shown, mark] = useOptimistic(items, markItem);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const doneCount = shown.filter((item) => item.doneAt != null).length;
  const allDone = doneCount === shown.length;

  function toggle(item: ChecklistItem) {
    const done = item.doneAt == null;
    startTransition(async () => {
      mark({ id: item.id, doneAt: done ? new Date().toISOString() : null });
      const result = await toggleItem(orderId, item.id, done);
      setError(result.error);
    });
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between">
          <Kicker>Чеклист работ</Kicker>
          <span className="font-heading text-[19px]">
            {doneCount} из {shown.length}
          </span>
        </div>
        <Meter
          label={`Выполнено ${doneCount} из ${shown.length}`}
          parts={[
            {
              value: (doneCount / shown.length) * 100,
              className: allDone ? "bg-normal" : "bg-accent",
            },
          ]}
        />
      </div>

      <ol className="divide-y divide-line border-line border-y">
        {shown.map((item) => (
          <ItemRow
            key={item.id}
            item={item}
            disabled={!isOpen}
            onToggle={() => toggle(item)}
          />
        ))}
      </ol>

      {error != null && (
        <p role="alert" className="text-[14px] text-critical">
          {error}
        </p>
      )}

      {isOpen && <CompleteForm orderId={orderId} isReady={allDone} />}
    </section>
  );
}

type Mark = { id: string; doneAt: string | null };

function markItem(items: ChecklistItem[], { id, doneAt }: Mark) {
  return items.map((item) => (item.id === id ? { ...item, doneAt } : item));
}

type RowProps = {
  item: ChecklistItem;
  disabled: boolean;
  onToggle: () => void;
};

// Строка целиком — область нажатия: удобно пальцем в перчатке.
function ItemRow({ item, disabled, onToggle }: RowProps) {
  const done = item.doneAt != null;
  return (
    <li>
      <label className="flex min-h-14 cursor-pointer items-start gap-3 py-3 has-disabled:cursor-default">
        <input
          type="checkbox"
          checked={done}
          disabled={disabled}
          onChange={onToggle}
          className="mt-0.5 size-6 shrink-0 accent-accent"
        />
        <span className={`flex-1 ${done ? "text-muted" : "text-ink"}`}>
          {item.text}
        </span>
        {item.doneAt != null && (
          <span className="pt-0.5 text-[13px] text-normal">
            {formatTime(item.doneAt)}
          </span>
        )}
      </label>
    </li>
  );
}
