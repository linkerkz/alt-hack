import type { Role } from "./types";

// Демо-аккаунты из supabase/seed.sql: быстрый вход под каждой ролью для жюри.
export const DEMO_ACCOUNTS: { email: string; role: Role; scope: string }[] = [
  { email: "dsp@station.demo", role: "dsp", scope: "Алматы-1" },
  { email: "dscs@station.demo", role: "dscs", scope: "Алматы-1" },
  { email: "dnc@station.demo", role: "dnc", scope: "Алматинский круг" },
  { email: "ds@station.demo", role: "ds", scope: "Алматы-1" },
];
