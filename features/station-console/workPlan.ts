import { askText } from "@/lib/openrouter";
import { replanOptions } from "./mock";
import type { ChosenOption } from "./types";

// План работ ремонтной бригаде от ИИ: модель знает сбой по сценарию демо
// (бутылка в стрелке С3, остряк повреждён) и принятый вариант
// перепланирования и составляет окно работ, меры безопасности и чеклист.
// Снимок не шлём: текстом модель отвечает в разы быстрее, а сбой и так известен.

export type WorkPlan = {
  title: string;
  description: string;
  window: string;
  safety: string[];
  items: string[];
};

// Имена соседних станций модели не нужны: окно работ от них не зависит.
const NEIGHBORS = { odd: "соседней", even: "соседней" };

// План составляют, пока ДСП ждёт на пульте. Текстом модель отвечает за
// 15–20 с; запас — на случай, если основная занята и отвечает запасная.
const TIMEOUT_MS = 45000;

// Чеклист короче — не план, длиннее — бригада не пройдёт его на телефоне.
const ITEMS = { min: 3, max: 10 };

const SCHEMA = {
  name: "work_plan",
  definition: {
    type: "object",
    properties: {
      title: { type: "string", description: "Название наряда, до 60 знаков" },
      description: {
        type: "string",
        description: "Что случилось и что сделать, 1–2 предложения",
      },
      window: {
        type: "string",
        description: "Окно работ: с какого и до какого времени и почему",
      },
      safety: {
        type: "array",
        items: { type: "string" },
        description: "2–4 меры безопасности перед началом работ",
      },
      items: {
        type: "array",
        items: { type: "string" },
        description: "5–8 пунктов чеклиста по порядку, без номеров",
      },
    },
    required: ["title", "description", "window", "safety", "items"],
    additionalProperties: false,
  },
};

// План работ; null — ИИ не подключён, не успел или ответил не по формату.
export async function generateWorkPlan(option: ChosenOption) {
  const answer = await askText({
    prompt: promptFor(option),
    schema: SCHEMA,
    timeoutMs: TIMEOUT_MS,
  });
  return parsePlan(answer);
}

function promptFor(option: ChosenOption) {
  const chosen = replanOptions(NEIGHBORS)[option];
  const changes = chosen.changes.map(
    (change) => `- поезд ${change.train}: ${change.text}`,
  );
  return [
    "Ты — инженер дистанции пути. Составь план работ для ремонтной бригады по стрелочному переводу С3 в нечётной горловине станции.",
    "Камера в горловине заметила пластиковую бутылку у остряка стрелки С3: перевод не доходил до конца.",
    "Путейцы убрали бутылку и доложили: остряк повреждён, нужен ремонт. Маршруты через С3 на пути 3 и 5 закрыты.",
    `Сейчас 14:11. ДСЦС принял «${chosen.name}», движение идёт в обход С3:`,
    ...changes,
    "Ремонт нужно закончить к 14:27, чтобы к 14:29 вернуть С3 в эксплуатацию и пути 3 и 5 — к исходному плану.",
    "Пиши по-русски, коротко, языком наряда. Чеклист — 5–8 пунктов, каждый — одно действие до 100 знаков, без нумерации: от разрешения ДСП и записи в журнал ДУ-46 до проверки перевода с пульта и доклада ДСП.",
  ].join("\n");
}

function parsePlan(answer: unknown): WorkPlan | null {
  if (typeof answer !== "object" || answer == null) return null;
  const title = textOf(answer, "title");
  const description = textOf(answer, "description");
  const window = textOf(answer, "window");
  const safety = listOf(answer, "safety");
  const items = listOf(answer, "items");
  if (title == null || description == null || window == null) return null;
  if (safety == null || items == null || items.length < ITEMS.min) return null;
  return {
    title,
    description,
    window,
    safety,
    items: items.slice(0, ITEMS.max),
  };
}

function textOf(answer: object, key: string) {
  const value: unknown = Reflect.get(answer, key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

// Номера пунктам ставит чеклист сам: «1. » от модели срезаем, а дробь
// в начале пункта («2.5 мм …») оставляем.
function listOf(answer: object, key: string) {
  const value: unknown = Reflect.get(answer, key);
  if (!Array.isArray(value)) return null;
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.replace(/^\s*\d+[.)](?!\d)\s*/, "").trim())
    .filter((item) => item !== "");
}
