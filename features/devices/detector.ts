import type { ObjectDetector } from "@mediapipe/tasks-vision";
import type { CameraState } from "./types";
import { WATCH_REGION } from "./watch";

// ИИ на устройстве: модель распознавания объектов (EfficientDet-Lite0, 80
// классов COCO) работает прямо в браузере камеры — без сети и ключей.
// Человек в зоне — не препятствие (рука ставит или убирает предмет).

// Версия WASM совпадает с пакетом в package.json.
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL =
  "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite";
export const MODEL_NAME = "EfficientDet-Lite0";

// Ниже этой уверенности модель видит призраков. Бутылку на однотонном фоне
// она узнаёт с уверенностью ~0.35: порог ниже, ложные срабатывания отсекает
// отсчёт в несколько секунд.
const MIN_SCORE = 0.3;

// Мебель и техника — фон сцены, а не предмет в стрелке: иначе стол под
// макетом навсегда держал бы тревогу.
const BACKGROUND = [
  "dining table",
  "chair",
  "couch",
  "bed",
  "bench",
  "tv",
  "laptop",
  "potted plant",
  "refrigerator",
  "oven",
  "sink",
  "toilet",
];

// Что модель увидела в зоне объекта. Рамка — доли кадра.
export type Finding = {
  label: string;
  person: boolean;
  score: number;
  box: { x: number; y: number; width: number; height: number };
};

// Модель грузится один раз (~5 МБ, дальше из кэша). Только процессор:
// через WebGL кадр шёл ~4 с и возвращался пустым, на процессоре — ~140 мс.
export async function loadDetector() {
  const { FilesetResolver, ObjectDetector } = await import(
    "@mediapipe/tasks-vision"
  );
  const fileset = await FilesetResolver.forVisionTasks(WASM);
  return withoutInfoLogs(() =>
    ObjectDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL, delegate: "CPU" },
      runningMode: "VIDEO",
      scoreThreshold: MIN_SCORE,
      categoryDenylist: BACKGROUND,
      maxResults: 5,
    }),
  );
}

// WASM модели пишет служебное «INFO: …» в console.error, а dev-оверлей Next
// показывает его красной ошибкой. Ссылку на console.error загрузчик WASM
// запоминает при загрузке — на это время подставляем фильтр без «INFO:»,
// потом возвращаем настоящий: остальные ошибки идут как обычно.
async function withoutInfoLogs<T>(load: () => Promise<T>) {
  const { error } = console;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("INFO:")) return;
    error(...args);
  };
  try {
    return await load();
  } finally {
    console.error = error;
  }
}

// Находки модели на кадре, которые задевают зону объекта.
export function findingsIn(detector: ObjectDetector, video: HTMLVideoElement) {
  const { videoWidth, videoHeight } = video;
  const { detections } = detector.detectForVideo(video, performance.now());
  return detections.flatMap((detection): Finding[] => {
    const [category] = detection.categories;
    const { boundingBox } = detection;
    if (category == null || boundingBox == null) return [];
    const box = {
      x: boundingBox.originX / videoWidth,
      y: boundingBox.originY / videoHeight,
      width: boundingBox.width / videoWidth,
      height: boundingBox.height / videoHeight,
    };
    if (!touchesRegion(box)) return [];
    const name = category.categoryName;
    return [
      {
        label: LABEL[name] ?? "предмет",
        person: name === "person",
        score: category.score,
        box,
      },
    ];
  });
}

// Предмет есть, только когда в зоне нет человека: рука ставит или убирает
// его — ждём, пока она уйдёт.
export function leansByFindings(state: CameraState, seen: Finding[]) {
  if (seen.some((finding) => finding.person)) return false;
  const hasObject = seen.length > 0;
  return state === "clear" ? hasObject : !hasObject;
}

// «бутылка 92%» — самая уверенная находка; null — ИИ ничего не назвал.
export function labelOf(seen: Finding[]) {
  const [top] = seen
    .filter((finding) => !finding.person)
    .toSorted((a, b) => b.score - a.score);
  return top == null ? null : `${top.label} ${Math.round(top.score * 100)}%`;
}

function touchesRegion(box: Finding["box"]) {
  const region = WATCH_REGION;
  return (
    box.x < region.x + region.width &&
    box.x + box.width > region.x &&
    box.y < region.y + region.height &&
    box.y + box.height > region.y
  );
}

// Подписи частых на столе классов COCO; остальное — «предмет».
const LABEL: Record<string, string> = {
  person: "человек",
  bottle: "бутылка",
  cup: "кружка",
  "wine glass": "бокал",
  "cell phone": "телефон",
  book: "книга",
  backpack: "рюкзак",
  handbag: "сумка",
  scissors: "ножницы",
  knife: "нож",
  "sports ball": "мяч",
  banana: "банан",
  apple: "яблоко",
  orange: "апельсин",
  remote: "пульт",
  mouse: "мышь",
  keyboard: "клавиатура",
  umbrella: "зонт",
  "teddy bear": "игрушка",
};
