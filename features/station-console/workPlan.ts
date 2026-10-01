import { askVision } from "@/lib/openrouter";
import { supabaseAdmin } from "@/lib/supabase";
import { replanOptions } from "./mock";
import type { ChosenOption, LiveIncident } from "./types";

// План работ ремонтной бригаде от ИИ: модель видит снимок камеры, вывод по
// нему, доклад путейцев и принятый вариант перепланирования и составляет
// окно работ, меры безопасности и чеклист для наряда.

export type WorkPlan = {
  title: string;
  description: string;
  window: string;
  safety: string[];
  items: string[];
};

type Params = { incident: LiveIncident; option: ChosenOption };

// Имена соседних станций модели не нужны: окно работ от них не зависит.
const NEIGHBORS = { odd: "соседней", even: "соседней" };

// План составляют, пока ДСП ждёт на пульте. Бесплатные модели со снимком
// отвечают до минуты, а при лимите основной время идёт и на запасную.
const TIMEOUT_MS = 90000;

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
        description: "4–8 пунктов чеклиста по порядку выполнения",
      },
    },
    required: ["title", "description", "window", "safety", "items"],
    additionalProperties: false,
  },
};

// План работ; null — ИИ не подключён, не успел или ответил не по формату.
export async function generateWorkPlan(params: Params) {
  const snapshot = await snapshotOf(params.incident.id);
  if (snapshot == null) return null;
  const answer = await askVision({
    prompt: promptFor(params),
    image: snapshot,
    schema: SCHEMA,
    timeoutMs: TIMEOUT_MS,
  });
  return parsePlan(answer);
}

function promptFor({ incident, option }: Params) {
  const chosen = replanOptions(NEIGHBORS)[option];
  const changes = chosen.changes.map(
    (change) => `- поезд ${change.train}: ${change.text}`,
  );
  return [
    "Ты — инженер дистанции пути. Составь план работ для ремонтной бригады по стрелочному переводу С3 в нечётной горловине станции.",
    "На снимке — кадр камеры над стрелкой в момент обнаружения (на демо — макет стрелки).",
    `Камера и ИИ: ${incident.analysis ?? "посторонний предмет у остряка стрелки С3"}.`,
    "Путейцы убрали предмет и доложили: стрелка повреждена, нужен ремонт. Маршруты через С3 на пути 3 и 5 закрыты.",
    `Сейчас 14:11. ДСЦС принял «${chosen.name}», движение идёт в обход С3:`,
    ...changes,
    "Ремонт нужно закончить к 14:27, чтобы к 14:29 вернуть С3 в эксплуатацию и пути 3 и 5 — к исходному плану.",
    "Пиши по-русски, коротко, языком наряда. Чеклист — конкретные действия по порядку: от разрешения ДСП и записи в журнал ДУ-46 до проверки перевода с пульта и доклада ДСП.",
  ].join("\n");
}

// Снимок инцидента — data URL JPEG; читаем секретным ключом, как и пишем.
async function snapshotOf(incidentId: string) {
  const { data } = await supabaseAdmin()
    .from("incidents")
    .select("snapshot")
    .eq("id", incidentId)
    .maybeSingle<{ snapshot: string | null }>();
  return data?.snapshot ?? null;
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

function listOf(answer: object, key: string) {
  const value: unknown = Reflect.get(answer, key);
  if (!Array.isArray(value)) return null;
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}
