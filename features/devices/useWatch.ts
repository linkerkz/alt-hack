import { type RefObject, useCallback, useRef, useState } from "react";
import { type Finding, findingsIn, labelOf, leansByFindings } from "./detector";
import { changedShare, leansAway, sampleRegion } from "./frameDiff";
import { type Reply, sendSignal } from "./signal";
import type { CameraState } from "./types";
import { useSensor } from "./useSensor";
import { useTick } from "./useTick";
import { INITIAL_WATCH, nextWatch, snapshotOf } from "./watch";

type Params = {
  deviceId: string;
  video: RefObject<HTMLVideoElement | null>;
  canvas: RefObject<HTMLCanvasElement | null>;
  // Видео пошло — можно грузить модель и смотреть кадры.
  isLive: boolean;
};

// Наблюдение за зоной объекта: каждый тик — кадр в детектор, смена состояния
// после отсчёта — сигнал на сервер со снимком. Тест — запасной путь для сцены.
export function useWatch({ deviceId, video, canvas, isLive }: Params) {
  const reference = useRef<Float32Array | null>(null);
  // Состояние для тика — в ref: сигнал уходит ровно один раз на смену.
  const watched = useRef(INITIAL_WATCH);
  const [watch, setWatch] = useState(INITIAL_WATCH);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [share, setShare] = useState(0);
  const [reply, setReply] = useState<Reply | null>(null);
  const [sent, setSent] = useState<CameraState>("clear");
  const [sending, setSending] = useState(false);

  async function send(state: CameraState, seen: Finding[]) {
    if (video.current == null || canvas.current == null) return;
    setSent(state);
    setSending(true);
    const snapshot = snapshotOf(video.current, canvas.current, seen);
    setReply(
      await sendSignal(deviceId, { state, snapshot, label: labelOf(seen) }),
    );
    setSending(false);
  }

  // Эталон «свободно» — только для резервного режима.
  const calibrate = useCallback(() => {
    if (video.current == null || canvas.current == null) return;
    reference.current = sampleRegion(video.current, canvas.current);
    watched.current = INITIAL_WATCH;
    setWatch(INITIAL_WATCH);
  }, [video, canvas]);

  const { detector, sensor } = useSensor(isLive, calibrate);

  // Кадр: что видно в зоне и не пора ли сменить состояние.
  function look() {
    const frame = video.current;
    if (frame == null || canvas.current == null) return;
    if (frame.readyState < frame.HAVE_CURRENT_DATA) return;
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
      setShare(Math.round(current * 100) / 100);
    }
    const next = nextWatch(watched.current, leaning);
    if (next.state !== watched.current.state) send(next.state, seen);
    watched.current = next;
    setWatch(next);
    // Пустой кадр за пустым — тот же массив, без перерисовки.
    setFindings((shown) =>
      shown.length === 0 && seen.length === 0 ? shown : seen,
    );
  }

  useTick(look, sensor !== "loading");

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
