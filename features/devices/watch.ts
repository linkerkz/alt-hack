import type { CameraState } from "./types";

// Наблюдение камеры: зона объекта в кадре сравнивается с эталоном «объект
// свободен». Сравниваем яркость на грубой сетке — без нейросетей и сети,
// одинаково быстро на любом телефоне.

// Зона объекта — доли кадра; её рамку камера рисует поверх видео.
export const WATCH_REGION = { x: 0.2, y: 0.22, width: 0.6, height: 0.56 };

// Как часто сравниваем кадр с эталоном.
export const TICK_MS = 250;

// Порог доли изменившихся клеток: «предмет есть» и «снова свободно» разнесены,
// чтобы состояние не дрожало на границе.
export const OBSTRUCTION_SHARE = 0.12;
const CLEAR_SHARE = 0.05;

// Сколько тиков подряд должно держаться новое состояние: ~1 с на предмет и
// ~2 с на «свободно» — рука, мелькнувшая в кадре, тревогу не поднимет.
const OBSTRUCTION_TICKS = 4;
const CLEAR_TICKS = 8;

const GRID_WIDTH = 64;
const GRID_HEIGHT = 48;
// Насколько должна измениться яркость клетки (0–255), чтобы она считалась другой.
const CELL_THRESHOLD = 28;

const SNAPSHOT_WIDTH = 480;

export type Watch = { state: CameraState; streak: number };

export const INITIAL_WATCH: Watch = { state: "clear", streak: 0 };

// Яркость зоны объекта на сетке. Средняя вычтена: автоэкспозиция камеры
// меняет яркость всего кадра, а не одной клетки, — это не предмет.
export function sampleRegion(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
) {
  const context = drawingContext(canvas, GRID_WIDTH, GRID_HEIGHT);
  const { videoWidth, videoHeight } = video;
  context.drawImage(
    video,
    WATCH_REGION.x * videoWidth,
    WATCH_REGION.y * videoHeight,
    WATCH_REGION.width * videoWidth,
    WATCH_REGION.height * videoHeight,
    0,
    0,
    GRID_WIDTH,
    GRID_HEIGHT,
  );
  const { data } = context.getImageData(0, 0, GRID_WIDTH, GRID_HEIGHT);
  const cells = new Float32Array(GRID_WIDTH * GRID_HEIGHT);
  for (let i = 0; i < cells.length; i++) {
    const [r, g, b] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
    cells[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  const mean = cells.reduce((sum, cell) => sum + cell, 0) / cells.length;
  return cells.map((cell) => cell - mean);
}

// Доля клеток зоны, которые заметно отличаются от эталона: 0 — как эталон.
export function changedShare(reference: Float32Array, frame: Float32Array) {
  let changed = 0;
  for (let i = 0; i < frame.length; i++) {
    if (Math.abs(frame[i] - reference[i]) > CELL_THRESHOLD) changed++;
  }
  return changed / frame.length;
}

// Следующее состояние наблюдения по доле изменений в кадре.
export function nextWatch(watch: Watch, share: number): Watch {
  const leaning =
    watch.state === "clear" ? share > OBSTRUCTION_SHARE : share < CLEAR_SHARE;
  if (!leaning) return { state: watch.state, streak: 0 };

  const streak = watch.streak + 1;
  const needed = watch.state === "clear" ? OBSTRUCTION_TICKS : CLEAR_TICKS;
  if (streak < needed) return { state: watch.state, streak };
  return { state: flip(watch.state), streak: 0 };
}

// Кадр целиком для ДСП: JPEG шириной 480 в пропорциях камеры, ~30–50 КБ.
export function snapshotOf(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  const height = Math.round(
    (SNAPSHOT_WIDTH * video.videoHeight) / video.videoWidth,
  );
  const context = drawingContext(canvas, SNAPSHOT_WIDTH, height);
  context.drawImage(video, 0, 0, SNAPSHOT_WIDTH, height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

function drawingContext(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
) {
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (context == null) throw new Error("Canvas 2D недоступен");
  return context;
}

function flip(state: CameraState): CameraState {
  return state === "clear" ? "obstruction" : "clear";
}
