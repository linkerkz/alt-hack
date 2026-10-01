"use client";

import { useState, useTransition } from "react";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import { FIREFOX_NO_RESTORE } from "@/components/ui/noRestore";
import { runCommand } from "../actions";
import type { Command } from "../types";

type Props = {
  stationId: string;
  command: Command;
  children: string;
  variant?: ButtonVariant;
  // Своё оформление вместо Button: тёмный демо-пульт.
  unstyledClassName?: string;
  className?: string;
};

// Кнопка, которая отдаёт команду пульта в базу. Пока команда идёт — кнопка
// заблокирована; если ситуация уже сменилась, рядом пишем почему.
export function CommandButton({
  stationId,
  command,
  children,
  variant = "secondary",
  unstyledClassName,
  className = "",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await runCommand(stationId, command);
      setError(result.error);
    });
  }

  const label = isPending ? "Отправляем…" : children;
  return (
    <>
      {unstyledClassName == null ? (
        <Button
          variant={variant}
          onClick={run}
          disabled={isPending}
          className={className}
        >
          {label}
        </Button>
      ) : (
        <button
          type="button"
          {...FIREFOX_NO_RESTORE}
          onClick={run}
          disabled={isPending}
          className={`${unstyledClassName} disabled:opacity-45`}
        >
          {label}
        </button>
      )}
      {error != null && (
        <span role="alert" className="basis-full text-[12px] text-critical">
          {error}
        </span>
      )}
    </>
  );
}
