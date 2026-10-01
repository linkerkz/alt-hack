import { env } from "@/lib/env";

// Клиент OpenRouter: OpenAI-совместимый chat completions, без SDK. Схему
// ответа и его разбор задаёт фича — lib о камерах и стрелках не знает.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

type Params = {
  prompt: string;
  // Имя и JSON Schema ответа.
  schema: Schema;
  timeoutMs: number;
};

type Schema = { name: string; definition: object };

// JSON-ответ модели как unknown — проверяет вызывающий. null — ИИ не
// подключён (нет ключа), не успел или ответил не по формату.

// Запрос со снимком — к vision-моделям. Картинка — data URL (JPEG, PNG, WebP).
export async function askVision({
  image,
  ...params
}: Params & { image: string }) {
  const { openRouterModel, openRouterFallbackModel } = env;
  // Текст — перед картинкой, как советует OpenRouter.
  const content = [
    { type: "text", text: params.prompt },
    { type: "image_url", image_url: { url: image } },
  ];
  return ask(params, content, [openRouterModel, openRouterFallbackModel]);
}

// Запрос только текстом: отвечает быстрее и подходит больше моделей.
export async function askText(params: Params) {
  const { openRouterTextModel, openRouterTextFallbackModel } = env;
  return ask(params, params.prompt, [
    openRouterTextModel,
    openRouterTextFallbackModel,
  ]);
}

async function ask(
  { schema, timeoutMs }: Params,
  content: unknown,
  models: (string | null)[],
): Promise<unknown> {
  if (env.openRouterApiKey == null) return null;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody(content, models, schema)),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      console.error(
        `OpenRouter: HTTP ${response.status}`,
        await response.text(),
      );
      return null;
    }
    return contentOf(await response.json());
  } catch (error) {
    // Таймаут или сеть: в лог, чтобы было видно, почему ИИ молчит.
    console.error("OpenRouter: запрос не выполнен", error);
    return null;
  }
}

// models — основная, за ней запасная: следующую OpenRouter берёт сам, если
// предыдущая вернула ошибку (лимит, простой).
function requestBody(
  content: unknown,
  models: (string | null)[],
  schema: Schema,
) {
  return {
    models: models.filter((model) => model != null),
    messages: [{ role: "user", content }],
    // Только провайдеры, которые держат JSON-схему: иначе вернут не тот формат.
    provider: { require_parameters: true },
    response_format: {
      type: "json_schema",
      json_schema: {
        name: schema.name,
        strict: true,
        schema: schema.definition,
      },
    },
  };
}

// choices[0].message.content — строка с JSON; разбираем без доверия.
function contentOf(body: unknown) {
  if (typeof body !== "object" || body == null || !("choices" in body)) {
    return null;
  }
  const { choices } = body;
  if (!Array.isArray(choices)) return null;
  const content: unknown = choices[0]?.message?.content;
  if (typeof content !== "string") return null;
  try {
    return JSON.parse(content);
  } catch {
    return null;
  }
}
