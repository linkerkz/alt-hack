"use client";

import { useRef } from "react";
import { DeviceButton } from "@/components/ui/DeviceButton";
import { useCamera } from "../useCamera";
import { useWatch } from "../useWatch";
import { countdownOf, WATCH_REGION } from "../watch";
import { CameraTelemetry } from "./CameraTelemetry";
import { CountdownBadge } from "./CountdownBadge";
import { FindingBoxes } from "./FindingBoxes";

type Props = {
  deviceId: string;
  objectId: string;
};

// Рамка зоны объекта поверх видео — те же доли кадра, что смотрит детектор.
const REGION_STYLE = {
  left: `${WATCH_REGION.x * 100}%`,
  top: `${WATCH_REGION.y * 100}%`,
  width: `${WATCH_REGION.width * 100}%`,
  height: `${WATCH_REGION.height * 100}%`,
};

// Экран камеры: видео с зоной объекта и рамками ИИ, отсчёт решения,
// телеметрия и ответ станции на последний сигнал.
export function CameraScreen({ deviceId, objectId }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const status = useCamera(video);
  const isLive = status === "live";
  const camera = useWatch({ deviceId, video, canvas, isLive });
  const { sensor, watch, findings, reply, sent, sending } = camera;
  const alarm = watch.state === "obstruction";
  const countdown = countdownOf(watch);

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
          <>
            <div
              style={REGION_STYLE}
              className={`absolute border ${alarm ? "border-device-alert bg-device-alert/10" : "border-device-ok/70"}`}
            >
              <span className="absolute right-1 bottom-0.5 text-[10px] text-device-ink/80 uppercase">
                Зона {objectId}
              </span>
            </div>
            <FindingBoxes findings={findings} />
            {countdown != null && (
              <CountdownBadge from={watch.state} seconds={countdown} />
            )}
          </>
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

      <CameraTelemetry
        objectId={objectId}
        sensor={sensor}
        alarm={alarm}
        findings={findings}
        share={camera.share}
        sending={sending}
      />

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
        {sensor === "diff" && (
          <DeviceButton onClick={camera.calibrate} disabled={!isLive}>
            Эталон
          </DeviceButton>
        )}
        <DeviceButton
          onClick={camera.simulate}
          disabled={!isLive || sending}
          className={sensor === "diff" ? "" : "col-span-2"}
        >
          {sent === "clear" ? "Тест: предмет" : "Тест: чисто"}
        </DeviceButton>
      </div>
    </section>
  );
}
