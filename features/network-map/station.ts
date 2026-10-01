import { cache } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { openIncidents } from "./live";
import { STATION_COLUMNS, type StationRow, toStation } from "./network";

// Одна станция без всей сети: пульту, отчёту и устройствам хватает строки
// станции, её открытых сбоев и соседей. Кэш на запрос: шапка, страница и
// действие читают по разу.

// Соседа без участка в сети подписываем нейтрально.
export const UNKNOWN_NEIGHBOR = "соседняя";

// Станции без координат (lat null) на карте нет — нет и её экранов.
export const getStation = cache(async (stationId: string) => {
  const supabase = await createSupabaseClient();
  const [{ data }, incidents] = await Promise.all([
    supabase
      .from("stations")
      .select(STATION_COLUMNS)
      .eq("id", stationId)
      .not("lat", "is", null)
      .maybeSingle()
      .overrideTypes<StationRow | null, { merge: false }>(),
    openIncidents(stationId),
  ]);

  return data == null ? null : toStation(data, incidents.get(stationId) ?? []);
});

// Соседи по участкам: нечётная сторона — откуда поезда идут к нам, чётная — куда от нас.
export const getStationNeighbors = cache(async (stationId: string) => {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("sections")
    .select(
      "from_id, to_id, from:stations!sections_from_id_fkey(name), to:stations!sections_to_id_fkey(name)",
    )
    .or(`from_id.eq.${stationId},to_id.eq.${stationId}`)
    .overrideTypes<NeighborRow[], { merge: false }>();

  const sections = data ?? [];
  const incoming = sections.find((section) => section.to_id === stationId);
  const outgoing = sections.find((section) => section.from_id === stationId);
  return {
    odd: incoming?.from.name ?? UNKNOWN_NEIGHBOR,
    even: outgoing?.to.name ?? UNKNOWN_NEIGHBOR,
  };
});

type NeighborRow = {
  from_id: string;
  to_id: string;
  from: { name: string };
  to: { name: string };
};
