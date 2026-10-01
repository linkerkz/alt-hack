"use client";

import { type CSSProperties, useRef, useState } from "react";
import { useCamera } from "../useCamera";
import { useWatch } from "../useWatch";
import { countdownOf, WATCH_REGION } from "../watch";
import { CameraOverlay } from "./CameraOverlay";
import { CameraPanel } from "./CameraPanel";
import { CountdownBadge } from "./CountdownBadge";
import { FindingBoxes } from "./FindingBoxes";
import { KeepAwake } from "./KeepAwake";

type Props = {
  deviceId: string;
  objectId: string;
  // Код устройства: «CAM-01».
  code: string;
  stationName: string;
};

// Рамка зоны объекта поверх видео — те же доли кадра, что смотрит детектор.
const REGION_STYLE = {
  left: `${WATCH_REGION.x * 100}%`,
  top: `${WATCH_REGION.y * 100}%`,
  width: `${WATCH_REGION.width * 100}%`,
  height: `${WATCH_REGION.height * 100}%`,
};

// Экран камеры во весь экран без прокрутки: кадр с зоной объекта и рамками
// ИИ, подписи поверх кадра как у камеры наблюдения и тонкая панель снизу.
export function CameraScreen({ deviceId, objectId, code, stationName }: Props) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [aspect, setAspect] = useState(4 / 3);
  const status = useCamera(video);
  const isLive = status === "live";
  const camera = useWatch({ deviceId, video, canvas, isLive });
  const { watch, findings } = camera;
  const alarm = watch.state === "obstruction";
  const countdown = countdownOf(watch);

  function measure() {
    const { videoWidth, videoHeight } = video.current ?? {};
    if (videoWidth && videoHeight) setAspect(videoWidth / videoHeight);
  }

  return (
    <main className="flex h-full flex-col bg-black">
      <KeepAwake />
      <div
        style={{ containerType: "size" }}
        className="relative grid min-h-0 flex-1 place-items-center"
      >
        <div style={frameStyle(aspect)} className="relative">
          <video
            ref={video}
            playsInline
            muted
            onLoadedMetadata={measure}
            className="block size-full"
          />
          {isLive && (
            <>
              <div
                style={REGION_STYLE}
                className={`absolute border-2 ${alarm ? "border-device-alert bg-device-alert/15" : "border-device-ok/70"}`}
              />
              <FindingBoxes findings={findings} />
              {countdown != null && (
                <CountdownBadge from={watch.state} seconds={countdown} />
              )}
            </>
          )}
        </div>
        <CameraOverlay
          code={code}
          stationName={stationName}
          objectId={objectId}
          alarm={alarm}
        />
        {!isLive && (
          <p className="absolute inset-0 grid place-items-center p-6 text-center text-[13px] text-device-dim uppercase">
            {status === "starting" ? "Запуск сенсора…" : "Сенсор недоступен"}
          </p>
        )}
      </div>
      <canvas ref={canvas} hidden />
      <CameraPanel camera={camera} isLive={isLive} />
    </main>
  );
}

// Кадр вписан в экран целиком, без обрезки: рамки ИИ — в долях кадра,
// поэтому их слой должен совпадать с видео.
function frameStyle(aspect: number): CSSProperties {
  return {
    aspectRatio: aspect,
    width: `min(100cqw, ${100 * aspect}cqh)`,
  };
}
