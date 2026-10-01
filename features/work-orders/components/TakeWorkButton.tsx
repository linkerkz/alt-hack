"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { takeWork } from "../actions";

// «Взять в работу»: рабочий на месте, ДСП и ДСЦС видят, что работы начались.
// До этого чеклист закрыт.
export function TakeWorkButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function take() {
    startTransition(async () => {
      const result = await takeWork(orderId);
      setError(result.error);
    });
  }

  return (
    <div className="space-y-2">
      <Button
        variant="primary"
        onClick={take}
        disabled={isPending}
        className="w-full py-3"
      >
        {isPending ? "Отправляем…" : "Взять в работу"}
      </Button>
      {error != null && (
        <p role="alert" className="text-[14px] text-critical">
          {error}
        </p>
      )}
      <p className="text-center text-[13px] text-muted">
        Чеклист откроется, когда наряд в работе
      </p>
    </div>
  );
}
