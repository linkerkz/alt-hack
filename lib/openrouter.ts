import { env } from "@/lib/env";

// Клиент OpenRouter: OpenAI-совместимый chat completions, без SDK. Схему
// ответа и его разбор задаёт фича — lib о камерах и стрелках не знает.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

type Params = {
  prompt: string;
  // Картинка — data URL (JPEG, PNG, WebP).
  image: string;
  // Имя и JSON Schema ответа.
  schema: { name: string; definition: object };
  timeoutMs: number;
};

// JSON-ответ модели как unknown — проверяет вызывающий. null — ИИ не
// подключён (нет ключа), не успел или ответил не по формату.
export async function askVision({
  prompt,
  image,
  schema,
  timeoutMs,
}: Params): Promise<unknown> {
  if (env.openRouterApiKey == null) return null;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody(prompt, image, schema)),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) return null;
    return contentOf(await response.json());
  } catch {
    return null;
  }
}

function requestBody(prompt: string, image: string, schema: Params["schema"]) {
  return {
    model: env.openRouterModel,
    messages: [
      {
        role: "user",
        // Текст — перед картинкой, как советует OpenRouter.
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: image } },
        ],
      },
    ],
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
