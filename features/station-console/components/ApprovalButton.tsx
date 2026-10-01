"use client";

import { useState, useTransition } from "react";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { answerApproval } from "../actions";
import type { ApprovalAnswer } from "../types";

type Props = {
  stationId: string;
  answer: ApprovalAnswer;
  children: string;
  variant?: ButtonVariant;
};

// Кнопка ответа ДНЦ на запрос на согласование. Пока ответ уходит — кнопка
// заблокирована; если ответить уже нельзя, рядом пишем почему.
export function ApprovalButton({
  stationId,
  answer,
  children,
  variant = "secondary",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await answerApproval(stationId, answer);
      setError(result.error);
    });
  }

  return (
    <>
      <Button variant={variant} onClick={send} disabled={isPending}>
        {isPending ? "Отправляем…" : children}
      </Button>
      {error != null && (
        <span role="alert" className="basis-full text-[12px] text-critical">
          {error}
        </span>
      )}
    </>
  );
}
