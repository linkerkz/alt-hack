import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { isRole } from "./roles";
import type { CurrentUser } from "./types";

// Кэш на запрос: шапка и страница спрашивают пользователя по разу.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims.sub;
  if (userId == null) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, role, station_id, dispatch_area_id")
    .eq("id", userId)
    .maybeSingle();

  return toCurrentUser(profile);
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (user == null) redirect("/login");
  return user;
}

// Строка из базы без сгенерированных типов — проверяем форму руками.
function toCurrentUser(row: ProfileRow | null): CurrentUser | null {
  if (row == null || !isRole(row.role)) return null;

  return {
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    stationId: row.station_id,
    dispatchAreaId: row.dispatch_area_id,
  };
}

type ProfileRow = {
  id: string;
  full_name: string;
  role: string;
  station_id: string | null;
  dispatch_area_id: string | null;
};
