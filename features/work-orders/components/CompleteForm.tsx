"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { completeWork } from "../actions";

type Props = {
  orderId: string;
  // Все пункты отмечены — можно сообщить о выполнении.
  isReady: boolean;
};

// «Работы выполнены» не открывает движение: объект вернёт в эксплуатацию ДСП.
export function CompleteForm({ orderId, isReady }: Props) {
  const [state, formAction, isPending] = useActionState(
    completeWork.bind(null, orderId),
    { error: null },
  );

  return (
    <form action={formAction} className="space-y-3 pt-2">
      <Field
        label="Комментарий для ДСП (необязательно)"
        name="note"
        placeholder="Контроль восстановлен, заменён…"
      />

      {state.error != null && (
        <p role="alert" className="text-[14px] text-critical">
          {state.error}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={!isReady || isPending}
        className="w-full py-3"
      >
        {isPending ? "Отправляем…" : "Работы выполнены"}
      </Button>
      {!isReady && (
        <p className="text-center text-[13px] text-muted">
          Отметьте все пункты — тогда можно сообщить о выполнении
        </p>
      )}
    </form>
  );
}
