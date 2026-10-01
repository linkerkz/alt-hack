import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CameraState } from "./types";
import {
  changedShare,
  INITIAL_WATCH,
  nextWatch,
  sampleRegion,
  snapshotOf,
  TICK_MS,
} from "./watch";

type Params = {
  deviceId: string;
  video: RefObject<HTMLVideoElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  // Видео пошло — можно снимать эталон и сравнивать.
  isLive: boolean;
};

// Ответ сервера на сигнал: что сделала система и когда.
export type Reply = { text: string; incidentCode: string | null; at: string };

// Через сколько после старта видео снимаем эталон: камера успевает
// навести резкость и выставить экспозицию.
const CALIBRATE_DELAY_MS = 1200;

// Наблюдение за объектом: эталон «свободно», сравнение кадров и сигнал на
// сервер при смене состояния. Запасной путь для сцены — simulate.
export function useWatch({ deviceId, video, canvas, isLive }: Params) {
  const reference = useRef<Float32Array | null>(null);
  // Состояние для тика — в ref: сигнал уходит ровно один раз на смену.
  const watched = useRef(INITIAL_WATCH);
  const [watch, setWatch] = useState(INITIAL_WATCH);
  const [share, setShare] = useState(0);
  const [reply, setReply] = useState<Reply | null>(null);
  const [sent, setSent] = useState<CameraState>("clear");

  const frame = useCallback(() => {
    if (video.current == null || canvas.current == null) return null;
    return { video: video.current, canvas: canvas.current };
  }, [video, canvas]);

  const send = useCallback(
    async (state: CameraState) => {
      const parts = frame();
      if (parts == null) return;
      setSent(state);
      setReply(
        await postSignal(
          deviceId,
          state,
          snapshotOf(parts.video, parts.canvas),
        ),
      );
    },
    [deviceId, frame],
  );

  const calibrate = useCallback(() => {
    const parts = frame();
    if (parts == null) return;
    reference.current = sampleRegion(parts.video, parts.canvas);
    watched.current = INITIAL_WATCH;
    setWatch(INITIAL_WATCH);
    setShare(0);
  }, [frame]);

  useEffect(() => {
    if (!isLive) return;
    const timer = setTimeout(calibrate, CALIBRATE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isLive, calibrate]);

  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      const parts = frame();
      if (parts == null || reference.current == null) return;
      const current = changedShare(
        reference.current,
        sampleRegion(parts.video, parts.canvas),
      );
      const next = nextWatch(watched.current, current);
      if (next.state !== watched.current.state) send(next.state);
      watched.current = next;
      setWatch(next);
      setShare(current);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [isLive, frame, send]);

  // Без предмета в кадре: шлём противоположное тому, что ушло последним.
  const simulate = () => send(sent === "clear" ? "obstruction" : "clear");

  return { watch, share, reply, sent, calibrate, simulate };
}

async function postSignal(
  deviceId: string,
  state: CameraState,
  snapshot: string,
): Promise<Reply> {
  const at = new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  try {
    const response = await fetch(`/api/devices/${deviceId}/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state, snapshot }),
    });
    if (!response.ok)
      return { text: "Сервер не принял сигнал", incidentCode: null, at };
    const body: { text: string; incidentCode: string | null } =
      await response.json();
    return { ...body, at };
  } catch {
    return { text: "Нет связи с сервером", incidentCode: null, at };
  }
}
