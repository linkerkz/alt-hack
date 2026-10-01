import {
  arrivalsFrom,
  isTrainWithin,
  sectionFlow,
  stationEvents,
  stationFlow,
} from "./flows";
import { DISPATCH_AREA_NAMES, SECTIONS, STATIONS } from "./mock";
import { TRAINS } from "./mock-trains";
import { STATUS_ORDER, toStatus } from "./status";
import type {
  Direction,
  MapScope,
  Section,
  Station,
  StationTraffic,
  ZoneStation,
  ZoneSummary,
} from "./types";

const EVENT_LIMIT = 12;

export async function getZoneMap(scope: MapScope) {
  const scopeIds = stationIdsOf(scope);
  const sections = SECTIONS.filter(
    (section) => scopeIds.has(section.fromId) || scopeIds.has(section.toId),
  );
  const stations = sortBySeverity(visibleStations(scopeIds, sections)).map(
    (station) => toZoneStation(station, scopeIds),
  );
  const scopeStations = stations.filter((station) => station.isInScope);

  return {
    title: titleOf(scope),
    stations,
    // Карточки всех станций зоны считаем сразу: выбор станции идёт без запроса к серверу.
    trafficByStation: Object.fromEntries(
      scopeStations.map((station) => [station.id, trafficOf(station.id)]),
    ),
    sections: sections.map((section) => ({
      ...section,
      flow: sectionFlow(TRAINS, section),
    })),
    summary: summarize(scopeStations),
  };
}

export async function getStation(stationId: string) {
  return STATIONS.find((station) => station.id === stationId) ?? null;
}

function trafficOf(stationId: string): StationTraffic {
  return {
    directions: directionsOf(stationId),
    events: stationEvents(TRAINS, stationId, nameOf).slice(0, EVENT_LIMIT),
  };
}

function stationIdsOf(scope: MapScope) {
  if (scope.kind === "station") return new Set([scope.stationId]);
  return new Set(
    STATIONS.filter(
      (station) => station.dispatchAreaId === scope.dispatchAreaId,
    ).map((station) => station.id),
  );
}

// Станции зоны и их соседи — другие концы участков, выходящих из зоны.
function visibleStations(scopeIds: Set<string>, sections: Section[]) {
  const visibleIds = new Set(scopeIds);
  for (const section of sections) {
    visibleIds.add(section.fromId);
    visibleIds.add(section.toId);
  }
  return STATIONS.filter((station) => visibleIds.has(station.id));
}

function titleOf(scope: MapScope) {
  if (scope.kind === "station") return `Станция ${nameOf(scope.stationId)}`;
  return DISPATCH_AREA_NAMES[scope.dispatchAreaId] ?? "Диспетчерский круг";
}

function toZoneStation(station: Station, scopeIds: Set<string>): ZoneStation {
  return {
    ...station,
    flow: stationFlow(TRAINS, station.id),
    isInScope: scopeIds.has(station.id),
  };
}

function directionsOf(stationId: string): Direction[] {
  return SECTIONS.flatMap((section) => {
    if (section.fromId !== stationId && section.toId !== stationId) return [];
    const neighborId =
      section.fromId === stationId ? section.toId : section.fromId;
    return {
      neighborId,
      neighborName: nameOf(neighborId),
      toUs: arrivalsFrom(TRAINS, neighborId, stationId),
      fromUs: arrivalsFrom(TRAINS, stationId, neighborId),
    };
  });
}

function nameOf(stationId: string) {
  return (
    STATIONS.find((station) => station.id === stationId)?.name ?? stationId
  );
}

function sortBySeverity(stations: Station[]) {
  return stations.toSorted((a, b) => {
    const byStatus =
      STATUS_ORDER.indexOf(toStatus(a.efficiencyIndex)) -
      STATUS_ORDER.indexOf(toStatus(b.efficiencyIndex));
    return byStatus !== 0 ? byStatus : a.efficiencyIndex - b.efficiencyIndex;
  });
}

function summarize(stations: ZoneStation[]): ZoneSummary {
  const stationCountByStatus = { normal: 0, warning: 0, critical: 0 };
  let indexSum = 0;
  let arrivingCount = 0;
  let incidentCount = 0;

  for (const station of stations) {
    stationCountByStatus[toStatus(station.efficiencyIndex)] += 1;
    indexSum += station.efficiencyIndex;
    arrivingCount += station.flow.arriving;
    incidentCount += station.incidents.length;
  }

  const scopeIds = new Set(stations.map((station) => station.id));
  return {
    avgEfficiencyIndex: Math.round(indexSum / stations.length),
    stationCount: stations.length,
    stationCountByStatus,
    trainsWithinCount: TRAINS.filter((train) => isTrainWithin(train, scopeIds))
      .length,
    arrivingCount,
    incidentCount,
  };
}
