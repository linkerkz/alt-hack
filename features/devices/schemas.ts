import type { CameraState } from "./types";

// Снимок 480 px в JPEG весит ~50 КБ; больше — это уже не наш кадр.
const MAX_SNAPSHOT_LENGTH = 400_000;
const JPEG_PREFIX = "data:image/jpeg;base64,";

// Подпись находки ИИ на устройстве — короткая строка.
const MAX_LABEL_LENGTH = 60;

export type Observation = {
  state: CameraState;
  snapshot: string;
  // Что увидел ИИ на устройстве: «бутылка 92%»; null — ничего не назвал.
  label: string | null;
};

// Тело сигнала камеры: что видит и кадр. Приходит от устройства вне
// приложения, поэтому проверяем каждое поле; null — сигнал не принят.
export function parseObservation(body: unknown): Observation | null {
  if (typeof body !== "object" || body == null) return null;
  if (!("state" in body) || !("snapshot" in body)) return null;
  const { state, snapshot } = body;
  if (state !== "obstruction" && state !== "clear") return null;
  if (typeof snapshot !== "string" || !snapshot.startsWith(JPEG_PREFIX)) {
    return null;
  }
  if (snapshot.length > MAX_SNAPSHOT_LENGTH) return null;
  return { state, snapshot, label: labelOf(body) };
}

// Подпись необязательна: старая прошивка или железка без ИИ её не шлёт.
function labelOf(body: object) {
  if (!("label" in body)) return null;
  const { label } = body;
  if (typeof label !== "string" || label.length > MAX_LABEL_LENGTH) return null;
  return label.trim() === "" ? null : label.trim();
}
