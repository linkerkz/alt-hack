import { askVision } from "@/lib/openrouter";

// ИИ по снимку камеры: детектор на устройстве заметил изменение в рамке
// стрелки, модель решает, препятствие это или нет, и описывает, что видит.

// Вывод ИИ по кадру.
export type Verdict = {
  // В рамке есть предмет, который мешает стрелке.
  obstruction: boolean;
  // Коротко для ДСП: «камень у остряка, перевод невозможен».
  summary: string;
};

// Дольше ждать нельзя: ДСП должен увидеть инцидент за секунды.
const TIMEOUT_MS = 8000;

const SCHEMA = {
  name: "switch_snapshot",
  definition: {
    type: "object",
    properties: {
      obstruction: {
        type: "boolean",
        description:
          "true — в зоне стрелки лежит или застрял посторонний предмет",
      },
      summary: {
        type: "string",
        description: "Одно короткое предложение по-русски для дежурного",
      },
    },
    required: ["obstruction", "summary"],
    additionalProperties: false,
  },
};

// Вывод ИИ; null — ИИ не подключён или не ответил: система работает без него.
export async function analyzeSnapshot(snapshot: string, objectId: string) {
  const answer = await askVision({
    prompt: promptFor(objectId),
    image: snapshot,
    schema: SCHEMA,
    timeoutMs: TIMEOUT_MS,
  });
  return parseVerdict(answer);
}

function promptFor(objectId: string) {
  return [
    `Ты — система видеонаблюдения железнодорожной станции. Камера смотрит на стрелочный перевод ${objectId} (на демо — его макет).`,
    "Детектор заметил изменение в кадре. Реши, есть ли в зоне стрелки посторонний предмет, который может помешать переводу: камень, ветка, инструмент, мусор, любой лишний объект.",
    "Не считай препятствием руку или человека, который проходит мимо, тень, блик и смену освещения.",
    "summary — одно предложение для дежурного по станции: что за предмет и где, или почему это не препятствие.",
  ].join("\n");
}

function parseVerdict(answer: unknown): Verdict | null {
  if (typeof answer !== "object" || answer == null) return null;
  if (!("obstruction" in answer) || !("summary" in answer)) return null;
  const { obstruction, summary } = answer;
  if (typeof obstruction !== "boolean" || typeof summary !== "string") {
    return null;
  }
  return { obstruction, summary: summary.trim() };
}
