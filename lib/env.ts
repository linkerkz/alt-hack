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
};

function required(name: string, value: string | undefined) {
  if (value == null || value === "") {
    throw new Error(
      `Переменная окружения ${name} не задана (см. .env.example)`,
    );
  }
  return value;
}
