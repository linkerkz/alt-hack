"use client";

import { useState, useTransition } from "react";
import { DeviceButton } from "@/components/ui/DeviceButton";
import { answerMessage } from "../actions";
import type { PagerAnswer, PagerMessage } from "../types";

type Props = {
  deviceId: string;
  message: PagerMessage;
  time: string;
};

// Открытое сообщение на пейджере: вызов к стрелке или задача ДСП и кнопки
// ответа. Вызов: «Принял» → «Устранено» или «Нужен ремонт». Задача — «Выполнено».
export function PagerMessageCard({ deviceId, message, time }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { isCall, status } = message;

  function answer(value: PagerAnswer) {
    startTransition(async () => {
      setError((await answerMessage(deviceId, message.id, value)).error);
    });
  }

  return (
    <article
      className={`flex flex-col gap-3 border-l-4 py-1 pl-3 ${isCall ? "border-device-alert" : "border-device-warn"}`}
    >
      <p
        className={`text-[11px] uppercase tracking-[0.14em] ${isCall ? "text-device-alert" : "text-device-warn"}`}
      >
        {isCall ? "■ Вызов" : "▲ Задача"} · {time}
        {status === "accepted" && " · принят"}
      </p>
      <p className="font-bold text-[20px] uppercase leading-tight">
        {message.text}
      </p>
      {isCall && status === "accepted" && (
        <p className="text-[12px] text-device-dim uppercase">
          Уберёте предмет — камера закроет вызов сама
        </p>
      )}
      <div className="grid gap-2">
        {isCall && status === "sent" && (
          <DeviceButton
            tone="alert"
            disabled={isPending}
            onClick={() => answer("accepted")}
          >
            Принял, иду
          </DeviceButton>
        )}
        {isCall && status === "accepted" && (
          <>
            <DeviceButton disabled={isPending} onClick={() => answer("done")}>
              ● Устранено
            </DeviceButton>
            <DeviceButton
              tone="alert"
              disabled={isPending}
              onClick={() => answer("escalated")}
            >
              ■ Нужен ремонт
            </DeviceButton>
          </>
        )}
        {!isCall && (
          <DeviceButton disabled={isPending} onClick={() => answer("done")}>
            ● Выполнено
          </DeviceButton>
        )}
      </div>
      {error != null && (
        <p role="alert" className="text-[13px] text-device-alert">
          ■ {error}
        </p>
      )}
    </article>
  );
}
