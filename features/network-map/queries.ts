import { STATUS_ORDER, toStatus } from "@/lib/status";
import { SECTIONS, STATIONS } from "./mock";
import type { NetworkSummary, Station } from "./types";

export async function getNetworkMap() {
  const stations = sortBySeverity(STATIONS);

  return {
    stations,
    sections: SECTIONS,
    summary: summarize(stations),
  };
}

export async function getStation(stationId: string) {
  return STATIONS.find((station) => station.id === stationId) ?? null;
}

function sortBySeverity(stations: Station[]) {
  return stations.toSorted((a, b) => {
    const byStatus =
      STATUS_ORDER.indexOf(toStatus(a.efficiencyIndex)) -
      STATUS_ORDER.indexOf(toStatus(b.efficiencyIndex));
    return byStatus !== 0 ? byStatus : a.efficiencyIndex - b.efficiencyIndex;
  });
}

function summarize(stations: Station[]): NetworkSummary {
  const stationCountByStatus = { normal: 0, warning: 0, critical: 0 };
  let indexSum = 0;
  let trainCount = 0;
  let incidentCount = 0;

  for (const station of stations) {
    stationCountByStatus[toStatus(station.efficiencyIndex)] += 1;
    indexSum += station.efficiencyIndex;
    trainCount += station.trainCount;
    incidentCount += station.incidents.length;
  }

  return {
    avgEfficiencyIndex: Math.round(indexSum / stations.length),
    stationCount: stations.length,
    stationCountByStatus,
    trainCount,
    incidentCount,
  };
}
