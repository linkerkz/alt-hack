import { type RefObject, useEffect, useState } from "react";

// Камера ещё включается, показывает видео или недоступна (нет разрешения,
// нет камеры, страница открыта не по HTTPS).
type CameraStatus = "starting" | "live" | "unavailable";

// Задняя камера телефона в <video>: включается при открытии экрана,
// выключается при уходе с него.
export function useCamera(video: RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<CameraStatus>("starting");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      if (navigator.mediaDevices?.getUserMedia == null) {
        setStatus("unavailable");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 } },
          audio: false,
        });
        const element = video.current;
        if (cancelled || element == null) return;
        element.srcObject = stream;
        await element.play();
        setStatus("live");
      } catch {
        setStatus("unavailable");
      }
    }

    start();
    return () => {
      cancelled = true;
      for (const track of stream?.getTracks() ?? []) track.stop();
    };
  }, [video]);

  return status;
}
