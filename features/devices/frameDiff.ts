import type { CameraState } from "./types";
import { WATCH_REGION } from "./watch";

// Резервный детектор, если модель ИИ не загрузилась (нет сети на первом
// запуске): зона объекта сравнивается с эталоном «свободно» по яркости на
// грубой сетке.

// Порог доли изменившихся клеток: «предмет есть» и «снова свободно» разнесены,
// чтобы состояние не дрожало на границе.
const OBSTRUCTION_SHARE = 0.12;
const CLEAR_SHARE = 0.05;

const GRID_WIDTH = 64;
const GRID_HEIGHT = 48;
// Насколько должна измениться яркость клетки (0–255), чтобы она считалась другой.
const CELL_THRESHOLD = 28;

// Яркость зоны объекта на сетке. Средняя вычтена: автоэкспозиция камеры
// меняет яркость всего кадра, а не одной клетки, — это не предмет.
export function sampleRegion(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
) {
  canvas.width = GRID_WIDTH;
  canvas.height = GRID_HEIGHT;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (context == null) throw new Error("Canvas 2D недоступен");
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

// Тянет ли кадр к смене состояния: из «свободно» — много изменений, из
// «предмет» — почти как эталон.
export function leansAway(state: CameraState, share: number) {
  return state === "clear" ? share > OBSTRUCTION_SHARE : share < CLEAR_SHARE;
}
