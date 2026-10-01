export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabasePublishableKey: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  // Только сервер: обходит RLS. Без NEXT_PUBLIC_, чтобы не попал в браузер.
  supabaseSecretKey: required(
    "SUPABASE_SECRET_KEY",
    process.env.SUPABASE_SECRET_KEY,
  ),
  // ИИ: анализ снимка камеры и план работ. Необязателен: без ключа камера
  // работает без анализа, поэтому старт приложения от него не зависит.
  openRouterApiKey: optional(process.env.OPENROUTER_API_KEY),
  // Модели OpenRouter с поддержкой JSON-схемы. Запасная — на случай, если
  // основная не ответила (лимит, простой); null — без запасной.
  // Vision — для снимка камеры.
  openRouterModel:
    optional(process.env.OPENROUTER_MODEL) ?? "google/gemini-2.5-flash",
  openRouterFallbackModel: optional(process.env.OPENROUTER_FALLBACK_MODEL),
  // Текстовая — для плана работ.
  openRouterTextModel:
    optional(process.env.OPENROUTER_TEXT_MODEL) ??
    "nvidia/nemotron-3-super-120b-a12b:free",
  openRouterTextFallbackModel: optional(
    process.env.OPENROUTER_TEXT_FALLBACK_MODEL,
  ),
};

function optional(value: string | undefined) {
  return value == null || value === "" ? null : value;
}

function required(name: string, value: string | undefined) {
  if (value == null || value === "") {
    throw new Error(
      `Переменная окружения ${name} не задана (см. .env.example)`,
    );
  }
  return value;
}
