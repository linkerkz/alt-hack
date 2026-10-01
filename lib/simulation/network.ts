import { createSupabaseClient } from "@/lib/supabase";
import { incidentDelays } from "./delays";
import type { SimStation } from "./schedule";
import { simulateTrains } from "./trains";

// Поезда всей сети на момент now (минуты эпохи Unix): станции и сбои — из
// базы, движение — из симуляции. Одни и те же поезда видят карта и пульт.
export async function networkTrains(now: number, horizon: number) {
  const [stations, delays] = await Promise.all([
    simStations(),
    incidentDelays(),
  ]);
  return simulateTrains({ stations, delays, now, horizon });
}

// Текущая минута эпохи Unix — момент симуляции.
export function currentMinute() {
  return Math.floor(Date.now() / 60_000);
}

// Станции без координат в симуляцию не попадают: ход считаем по расстоянию.
async function simStations() {
  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from("stations")
    .select("id, lat, lon, kind")
    .not("lat", "is", null)
    .overrideTypes<SimStation[], { merge: false }>();
  return data ?? [];
}
