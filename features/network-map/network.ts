import { cache } from "react";
import { createSupabaseClient } from "@/lib/supabase";
import { openIncidents } from "./live";
import type { Section, Station, StationKind, Status, Train } from "./types";

// Сеть из базы: станции с открытыми сбоями, участки, поезда и названия
// кругов. Кэш на запрос: страница читает сеть один раз.
export const getNetwork = cache(async () => {
  const supabase = await createSupabaseClient();
  const [stations, sections, trains, areas, incidents] = await Promise.all([
    supabase
      .from("stations")
      .select(STATION_COLUMNS)
      .not("lat", "is", null)
      .overrideTypes<StationRow[], { merge: false }>(),
    supabase
      .from("sections")
      .select("id, from_id, to_id, status, note")
      .overrideTypes<SectionRow[], { merge: false }>(),
    supabase
      .from("trains")
      .select(
        "number, kind, train_stops!inner(position, station_id, arrival_min, departure_min)",
      )
      .order("position", { referencedTable: "train_stops" })
      .overrideTypes<TrainRow[], { merge: false }>(),
    supabase
      .from("dispatch_areas")
      .select("id, name")
      .overrideTypes<{ id: string; name: string }[], { merge: false }>(),
    openIncidents(),
  ]);

  return {
    stations: (stations.data ?? []).map(
      (row): Station => toStation(row, incidents.get(row.id) ?? []),
    ),
    sections: (sections.data ?? []).map(toSection),
    trains: (trains.data ?? []).map(toTrain),
    areaNames: new Map((areas.data ?? []).map((area) => [area.id, area.name])),
  };
});

export type Network = Awaited<ReturnType<typeof getNetwork>>;

export const STATION_COLUMNS =
  "id, name, code, dispatch_area_id, kind, lat, lon, efficiency_index, train_count, track_load, avg_delay_minutes, conflict_count";

export function toStation(
  row: StationRow,
  incidents: Station["incidents"],
): Station {
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

function toTrain(row: TrainRow): Train {
  return {
    id: `train-${row.number}`,
    number: row.number,
    kind: row.kind,
    route: row.train_stops.map((stop) => ({
      stationId: stop.station_id,
      arrival: stop.arrival_min,
      departure: stop.departure_min,
    })),
  };
}

// Строки из базы без сгенерированных типов — форму задаём руками.
// Станции без координат (lat null) на карту не попадают — их отсекает запрос.
export type StationRow = {
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

type TrainRow = {
  number: string;
  kind: Train["kind"];
  train_stops: {
    position: number;
    station_id: string;
    arrival_min: number;
    departure_min: number;
  }[];
};
