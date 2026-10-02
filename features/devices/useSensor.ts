import type { ObjectDetector } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { loadDetector } from "./detector";

// Чем камера смотрит: модель ещё грузится, ИИ на устройстве или резервное
// сравнение с эталоном (модель не загрузилась).
type Sensor = "loading" | "ai" | "diff";

// Модель ИИ грузится, когда пошло видео; не загрузилась — onFallback
// готовит резервный режим. Ушли с экрана — модель закрываем.
export function useSensor(isLive: boolean, onFallback: () => void) {
  const detector = useRef<ObjectDetector | null>(null);
  const [sensor, setSensor] = useState<Sensor>("loading");

  useEffect(() => {
    if (!isLive) return;
    let cancelled = false;
    loadDetector()
      .then((loaded) => {
        if (cancelled) return loaded.close();
        detector.current = loaded;
        setSensor("ai");
      })
      .catch(() => {
        if (cancelled) return;
        onFallback();
        setSensor("diff");
      });
    return () => {
      cancelled = true;
      detector.current?.close();
      detector.current = null;
    };
  }, [isLive, onFallback]);

  return { detector, sensor };
}
