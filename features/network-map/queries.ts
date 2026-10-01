import {
  arrivalsFrom,
  departuresTo,
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
  const visibleIds = new Set(sections.flatMap((s) => [s.fromId, s.toId]));
  for (const id of scopeIds) visibleIds.add(id);

  const stations = sortBySeverity(
    STATIONS.filter((station) => visibleIds.has(station.id)),
  ).map((station) => toZoneStation(station, scopeIds));

  return {
    title: titleOf(scope),
    stations,
    sections: sections.map((section) => ({
      ...section,
      flow: sectionFlow(TRAINS, section),
    })),
    summary: summarize(stations.filter((station) => station.isInScope)),
  };
}

export async function getStationTraffic(
  stationId: string,
): Promise<StationTraffic> {
  return {
    flow: stationFlow(TRAINS, stationId),
    directions: directionsOf(stationId),
    events: stationEvents(TRAINS, stationId, nameOf).slice(0, EVENT_LIMIT),
  };
}

export async function getStation(stationId: string) {
  return STATIONS.find((station) => station.id === stationId) ?? null;
}

function stationIdsOf(scope: MapScope) {
  if (scope.kind === "station") return new Set([scope.stationId]);
  return new Set(
    STATIONS.filter(
      (station) => station.dispatchAreaId === scope.dispatchAreaId,
    ).map((station) => station.id),
  );
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
      fromUs: departuresTo(TRAINS, stationId, neighborId),
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
