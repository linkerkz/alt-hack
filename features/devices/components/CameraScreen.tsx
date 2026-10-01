"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Kicker } from "@/components/ui/Kicker";
import { Meter } from "@/components/ui/Meter";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TONE_BG_CLASS, TONE_BORDER_CLASS } from "@/components/ui/tone";
import { useCamera } from "../useCamera";
import { useWatch } from "../useWatch";
import { OBSTRUCTION_SHARE, WATCH_REGION } from "../watch";

type Props = {
  deviceId: string;
  objectId: string;
};

// Рамка зоны объекта поверх видео — те же доли кадра, что сравнивает камера.
const REGION_STYLE = {
  left: `${WATCH_REGION.x * 100}%`,
  top: `${WATCH_REGION.y * 100}%`,
  width: `${WATCH_REGION.width * 100}%`,
  height: `${WATCH_REGION.height * 100}%`,
};

// Экран камеры: видео с рамкой объекта, что видит камера сейчас и что
// ответил сервер на последний сигнал.
export function CameraScreen({ deviceId, objectId }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const status = useCamera(video);
  const { watch, share, reply, sent, calibrate, simulate } = useWatch({
    deviceId,
    video,
    canvas,
    isLive: status === "live",
  });
  const tone = watch.state === "obstruction" ? "critical" : "normal";
  // Порог предмета — на 2/3 полосы: видно, сколько осталось до тревоги.
  const fill = Math.min(100, (share / OBSTRUCTION_SHARE) * 66);

  return (
    <section className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-[4px] border border-line bg-ink">
        <video
          ref={video}
          playsInline
          muted
          className="block h-auto min-h-48 w-full"
        />
        {status === "live" && (
          <div
            style={REGION_STYLE}
            className={`absolute rounded-[3px] border-2 ${TONE_BORDER_CLASS[tone]}`}
          >
            <span
              className={`absolute top-0 left-0 px-1.5 py-0.5 text-[11px] text-paper uppercase tracking-[0.08em] ${TONE_BG_CLASS[tone]}`}
            >
              Стрелка {objectId}
            </span>
          </div>
        )}
        {status !== "live" && (
          <p className="absolute inset-0 grid place-items-center p-6 text-center text-[14px] text-paper">
            {status === "starting"
              ? "Включаем камеру…"
              : "Камера недоступна: разрешите доступ к ней в браузере. Страница должна быть открыта по HTTPS."}
          </p>
        )}
      </div>
      <canvas ref={canvas} hidden />

      <div className="flex flex-col gap-2">
        <StatusBadge
          tone={tone}
          label={
            watch.state === "obstruction"
              ? `Предмет в стрелке ${objectId}`
              : `Стрелка ${objectId} свободна`
          }
        />
        <Meter
          label={`Отличие от эталона: ${Math.round(share * 100)}%`}
          parts={[{ value: fill, className: TONE_BG_CLASS[tone] }]}
        />
      </div>

      <div className="border-line border-y py-3 text-[14px]">
        <Kicker>Ответ пульта</Kicker>
        {reply == null ? (
          <p className="text-muted">
            Сигналов ещё не было. Камера сообщит, когда в рамке появится
            предмет.
          </p>
        ) : (
          <p>
            <span className="text-muted">{reply.at}</span>
            {reply.incidentCode != null && ` · ${reply.incidentCode}`} ·{" "}
            {reply.text}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button onClick={calibrate} disabled={status !== "live"}>
          Стрелка свободна — эталон
        </Button>
        <Button variant="ghost" onClick={simulate} disabled={status !== "live"}>
          {sent === "clear" ? "Смоделировать предмет" : "Смоделировать уборку"}
        </Button>
      </div>
    </section>
  );
}
