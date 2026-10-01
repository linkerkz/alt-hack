import { cache } from "react";
import { currentMinute, networkTrains } from "@/lib/simulation/network";
import { createSupabaseClient } from "@/lib/supabase";
import { HORIZON_MINUTES } from "./flows";
import { openIncidents } from "./live";
import type { Section, Station, StationKind, Status } from "./types";

// Сеть: станции с открытыми сбоями, участки и названия кругов — из базы,
// поезда — из симуляции на текущую минуту с задержками от сбоев. Кэш на
// запрос: страница читает сеть один раз.
export const getNetwork = cache(async () => {
  const supabase = await createSupabaseClient();
  const now = currentMinute();
  const [stationRows, sections, areas, incidents, trains] = await Promise.all([
    supabase
      .from("stations")
      .select(
        "id, name, code, dispatch_area_id, kind, lat, lon, efficiency_index, train_count, track_load, avg_delay_minutes, conflict_count",
      )
      .not("lat", "is", null)
      .overrideTypes<StationRow[], { merge: false }>(),
    supabase
      .from("sections")
      .select("id, from_id, to_id, status, note")
      .overrideTypes<SectionRow[], { merge: false }>(),
    supabase
      .from("dispatch_areas")
      .select("id, name")
      .overrideTypes<{ id: string; name: string }[], { merge: false }>(),
    openIncidents(),
    networkTrains(now, HORIZON_MINUTES),
  ]);

  return {
    stations: (stationRows.data ?? []).map(
      (row): Station => toStation(row, incidents.get(row.id) ?? []),
    ),
    sections: (sections.data ?? []).map(toSection),
    trains,
    // Момент, от которого считано время поездов, — минуты эпохи Unix.
    now,
    areaNames: new Map((areas.data ?? []).map((area) => [area.id, area.name])),
  };
});

export type Network = Awaited<ReturnType<typeof getNetwork>>;

function toStation(row: StationRow, incidents: Station["incidents"]): Station {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    dispatchAreaId: row.dispatch_area_id,
    kind: row.kind,
    lat: row.lat,
    lon: row.lon,
    efficiencyIndex: row.efficiency_index,
    trainCount: row.train_count,
    trackLoad: row.track_load,
    avgDelayMinutes: row.avg_delay_minutes,
    conflictCount: row.conflict_count,
    incidents,
  };
}

function toSection(row: SectionRow): Section {
  return {
    id: row.id,
    fromId: row.from_id,
    toId: row.to_id,
    status: row.status,
    note: row.note ?? undefined,
  };
}

// Строки из базы без сгенерированных типов — форму задаём руками.
// Станции без координат (lat null) на карту не попадают — их отсекает запрос.
type StationRow = {
  id: string;
  name: string;
  code: string;
  dispatch_area_id: string;
  kind: StationKind;
  lat: number;
  lon: number;
  efficiency_index: number;
  train_count: number;
  track_load: number;
  avg_delay_minutes: number;
  conflict_count: number;
};

type SectionRow = {
  id: string;
  from_id: string;
  to_id: string;
  status: Status;
  note: string | null;
};
