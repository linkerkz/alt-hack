import type { Finding } from "./detector";
import type { CameraState } from "./types";

// Наблюдение камеры за зоной объекта: новое состояние принимается, только
// если держится несколько тиков подряд, — пока идёт отсчёт, камера
// показывает его на экране.

// Зона объекта — доли кадра; её рамку камера рисует поверх видео.
export const WATCH_REGION = { x: 0.2, y: 0.22, width: 0.6, height: 0.56 };

// Как часто смотрим кадр: 4 раза в секунду — модель тратит на кадр ~140 мс.
export const TICK_MS = 250;

// Предмет подтверждаем 3 с (отсчёт 3…2…1 на экране), «свободно» — 2 с.
const OBSTRUCTION_TICKS = 12;
const CLEAR_TICKS = 8;

const SNAPSHOT_WIDTH = 480;

export type Watch = { state: CameraState; streak: number };

export const INITIAL_WATCH: Watch = { state: "clear", streak: 0 };

// Следующее состояние: leaning — кадр тянет к смене состояния. Ничего не
// поменялось — тот же объект: экран камеры не перерисовывается впустую.
export function nextWatch(watch: Watch, leaning: boolean): Watch {
  if (!leaning) return watch.streak === 0 ? watch : { ...watch, streak: 0 };
  const streak = watch.streak + 1;
  if (streak < neededTicks(watch.state)) return { state: watch.state, streak };
  return { state: flip(watch.state), streak: 0 };
}

// Секунд до смены состояния; null — смена не назревает.
export function countdownOf(watch: Watch) {
  if (watch.streak === 0) return null;
  const left = neededTicks(watch.state) - watch.streak;
  return Math.ceil((left * TICK_MS) / 1000);
}

// Кадр для ДСП: JPEG шириной 480 в пропорциях камеры с рамками того, что
// увидел ИИ, ~30–50 КБ.
export function snapshotOf(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  findings: Finding[],
) {
  const width = SNAPSHOT_WIDTH;
  const height = Math.round((width * video.videoHeight) / video.videoWidth);
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context == null) throw new Error("Canvas 2D недоступен");
  context.drawImage(video, 0, 0, width, height);
  context.lineWidth = 3;
  context.font = "bold 14px monospace";
  for (const { label, person, score, box } of findings) {
    context.strokeStyle = person ? "#7f9187" : "#ff5c50";
    context.fillStyle = context.strokeStyle;
    const [x, y] = [box.x * width, box.y * height];
    context.strokeRect(x, y, box.width * width, box.height * height);
    const caption = `${label.toUpperCase()} ${Math.round(score * 100)}%`;
    context.fillText(caption, x + 4, Math.max(14, y - 6));
  }
  return canvas.toDataURL("image/jpeg", 0.7);
}

function neededTicks(state: CameraState) {
  return state === "clear" ? OBSTRUCTION_TICKS : CLEAR_TICKS;
}

function flip(state: CameraState): CameraState {
  return state === "clear" ? "obstruction" : "clear";
}
