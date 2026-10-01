import type { ObjectDetector } from "@mediapipe/tasks-vision";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type Finding,
  findingsIn,
  labelOf,
  leansByFindings,
  loadDetector,
} from "./detector";
import { changedShare, leansAway, sampleRegion } from "./frameDiff";
import { type Reply, sendSignal } from "./signal";
import type { CameraState } from "./types";
import { INITIAL_WATCH, nextWatch, snapshotOf, TICK_MS } from "./watch";

type Params = {
  deviceId: string;
  video: RefObject<HTMLVideoElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  // Видео пошло — можно грузить модель и смотреть кадры.
  isLive: boolean;
};

// Чем камера смотрит: модель ещё грузится, ИИ на устройстве или резервное
// сравнение с эталоном (модель не загрузилась).
export type Sensor = "loading" | "ai" | "diff";

// Наблюдение за зоной объекта: каждый тик — кадр в детектор, смена состояния
// после отсчёта — сигнал на сервер со снимком. Тест — запасной путь для сцены.
export function useWatch({ deviceId, video, canvas, isLive }: Params) {
  const detector = useRef<ObjectDetector | null>(null);
  const reference = useRef<Float32Array | null>(null);
  // Состояние для тика — в ref: сигнал уходит ровно один раз на смену.
  const watched = useRef(INITIAL_WATCH);
  const [sensor, setSensor] = useState<Sensor>("loading");
  const [watch, setWatch] = useState(INITIAL_WATCH);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [share, setShare] = useState(0);
  const [reply, setReply] = useState<Reply | null>(null);
  const [sent, setSent] = useState<CameraState>("clear");
  const [sending, setSending] = useState(false);

  const send = useCallback(
    async (state: CameraState, seen: Finding[]) => {
      if (video.current == null || canvas.current == null) return;
      setSent(state);
      setSending(true);
      const snapshot = snapshotOf(video.current, canvas.current, seen);
      setReply(
        await sendSignal(deviceId, { state, snapshot, label: labelOf(seen) }),
      );
      setSending(false);
    },
    [deviceId, video, canvas],
  );

  // Эталон «свободно» — только для резервного режима.
  const calibrate = useCallback(() => {
    if (video.current == null || canvas.current == null) return;
    reference.current = sampleRegion(video.current, canvas.current);
    watched.current = INITIAL_WATCH;
    setWatch(INITIAL_WATCH);
  }, [video, canvas]);

  useEffect(() => {
    if (!isLive) return;
    loadDetector()
      .then((loaded) => {
        detector.current = loaded;
        setSensor("ai");
      })
      .catch(() => {
        calibrate();
        setSensor("diff");
      });
    return () => detector.current?.close();
  }, [isLive, calibrate]);

  useEffect(() => {
    if (sensor === "loading") return;
    const timer = setInterval(() => {
      const frame = video.current;
      if (frame == null || canvas.current == null) return;
      let seen: Finding[] = [];
      let leaning = false;
      if (detector.current != null) {
        seen = findingsIn(detector.current, frame);
        leaning = leansByFindings(watched.current.state, seen);
      } else if (reference.current != null) {
        const current = changedShare(
          reference.current,
          sampleRegion(frame, canvas.current),
        );
        leaning = leansAway(watched.current.state, current);
        setShare(current);
      }
      const next = nextWatch(watched.current, leaning);
      if (next.state !== watched.current.state) send(next.state, seen);
      watched.current = next;
      setWatch(next);
      setFindings(seen);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [sensor, video, canvas, send]);

  // Без предмета в кадре: шлём противоположное тому, что ушло последним.
  const simulate = () =>
    send(sent === "clear" ? "obstruction" : "clear", findings);

  return {
    sensor,
    watch,
    findings,
    share,
    reply,
    sent,
    sending,
    calibrate,
    simulate,
  };
}
