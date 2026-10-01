export const env = {
  supabaseUrl: required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ),
  supabasePublishableKey: required(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),
  // Пароль демо-аккаунтов из supabase/seed.sql; без него нет быстрого входа.
  demoPassword: process.env.DEMO_PASSWORD ?? null,
};

function required(name: string, value: string | undefined) {
  if (value == null || value === "") {
    throw new Error(
      `Переменная окружения ${name} не задана (см. .env.example)`,
    );
  }
  return value;
}
