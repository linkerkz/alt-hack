"use client";

import { useRef } from "react";
import { DeviceButton } from "@/components/ui/DeviceButton";
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

// Сегментов в шкале отличия; порог тревоги — на 2/3 шкалы.
const SEGMENTS = 12;

// Экран камеры: видео с рамкой объекта, телеметрия детектора и ответ
// станции на последний сигнал.
export function CameraScreen({ deviceId, objectId }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const status = useCamera(video);
  const isLive = status === "live";
  const { watch, share, reply, sent, sending, calibrate, simulate } = useWatch({
    deviceId,
    video,
    canvas,
    isLive,
  });
  const alarm = watch.state === "obstruction";
  const lit = Math.min(
    SEGMENTS,
    Math.round((share / OBSTRUCTION_SHARE) * SEGMENTS * (2 / 3)),
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="relative overflow-hidden border border-device-line bg-black">
        <video
          ref={video}
          playsInline
          muted
          className="block h-auto min-h-48 w-full"
        />
        {isLive && (
          <div
            style={REGION_STYLE}
            className={`absolute border-2 ${alarm ? "border-device-alert" : "border-device-ok"}`}
          >
            <span
              className={`absolute top-0 left-0 px-1.5 text-[11px] text-device uppercase ${alarm ? "bg-device-alert" : "bg-device-ok"}`}
            >
              Зона {objectId}
            </span>
          </div>
        )}
        <span className="absolute top-2 right-2 flex items-center gap-1.5 text-[11px] text-device-alert">
          <span className="size-2 animate-pulse rounded-full bg-device-alert" />
          REC
        </span>
        {!isLive && (
          <p className="absolute inset-0 grid place-items-center p-6 text-center text-[13px] text-device-dim uppercase">
            {status === "starting" ? "Запуск сенсора…" : "Сенсор недоступен"}
          </p>
        )}
      </div>
      <canvas ref={canvas} hidden />

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px] uppercase">
        <dt className="text-device-dim">Объект</dt>
        <dd>Стрелка {objectId}</dd>
        <dt className="text-device-dim">Состояние</dt>
        <dd className={alarm ? "text-device-alert" : "text-device-ok"}>
          {alarm ? "■ Предмет в зоне" : "● Свободно"}
        </dd>
        <dt className="text-device-dim">Отличие</dt>
        <dd className="flex items-center gap-2">
          <span className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: SEGMENTS }, (_, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: сегменты шкалы без id
                key={i}
                className={`h-3 w-1.5 ${segmentClass(i, lit)}`}
              />
            ))}
          </span>
          {Math.round(share * 100)}%
        </dd>
        <dt className="text-device-dim">Анализ ИИ</dt>
        <dd className={sending ? "animate-pulse text-device-warn" : ""}>
          {sending ? "Кадр на анализе…" : "Ожидание"}
        </dd>
      </dl>

      <div className="border-device-line border-y py-3 text-[13px]">
        <p className="text-device-dim uppercase">Ответ станции</p>
        {reply == null ? (
          <p className="text-device-dim">— сигналов не было</p>
        ) : (
          <p>
            <span className="text-device-warn">{reply.at}</span>
            {reply.incidentCode != null && ` · ${reply.incidentCode}`} ·{" "}
            {reply.text}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <DeviceButton onClick={calibrate} disabled={!isLive}>
          Эталон
        </DeviceButton>
        <DeviceButton onClick={simulate} disabled={!isLive || sending}>
          {sent === "clear" ? "Тест: предмет" : "Тест: чисто"}
        </DeviceButton>
      </div>
    </section>
  );
}

// Сегмент шкалы: погашен, жёлтый до порога тревоги, красный — за ним.
function segmentClass(index: number, lit: number) {
  if (index >= lit) return "bg-device-line";
  return index >= (SEGMENTS * 2) / 3 ? "bg-device-alert" : "bg-device-warn";
}
