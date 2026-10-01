import { createSupabaseClient } from "@/lib/supabase";
import type { StationLayout, TrackKind } from "./types";

// Устройство станции из базы: пути, маршруты со стрелками и поезда, за
// которыми закреплены бригады. Нужно, чтобы считать индекс по плану.
export async function stationLayout(stationId: string): Promise<StationLayout> {
  const supabase = await createSupabaseClient();
  const [tracks, routes, crews] = await Promise.all([
    supabase
      .from("tracks")
      .select("number, kind")
      .eq("station_id", stationId)
      .overrideTypes<TrackRow[], { merge: false }>(),
    supabase
      .from("routes")
      .select("id, switches")
      .eq("station_id", stationId)
      .overrideTypes<RouteRow[], { merge: false }>(),
    supabase
      .from("resources")
      .select("train_number")
      .eq("station_id", stationId)
      .eq("kind", "crew")
      .not("train_number", "is", null)
      .overrideTypes<CrewRow[], { merge: false }>(),
  ]);

  return {
    tracks: tracks.data ?? [],
    routes: routes.data ?? [],
    crewTrains: (crews.data ?? []).map((row) => row.train_number),
  };
}

type TrackRow = { number: number; kind: TrackKind };

type RouteRow = { id: string; switches: string[] };

type CrewRow = { train_number: string };
