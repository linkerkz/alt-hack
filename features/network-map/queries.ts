import {
  isTrainWithin,
  movingLegs,
  sectionFlow,
  stationFlow,
  stationTrains,
} from "./flows";
import { getNetwork, type Network } from "./network";
import { STATUS_ORDER, toStatus } from "./status";
import type {
  MapScope,
  MovingTrain,
  Section,
  Station,
  StationTrain,
  ZoneStation,
  ZoneSummary,
} from "./types";

// liveIndexes — индексы, посчитанные по плану путей (сейчас — пульт станции);
// они заменяют записанные в базе, чтобы карта и пульт показывали одно число.
export async function getZoneMap(
  scope: MapScope,
  liveIndexes: Map<string, number>,
) {
  const network = withIndexes(await getNetwork(), liveIndexes);
  const scopeIds = stationIdsOf(network, scope);
  const sections = network.sections.filter(
    (section) => scopeIds.has(section.fromId) || scopeIds.has(section.toId),
  );
  const stations = sortBySeverity(
    visibleStations(network, scopeIds, sections),
  ).map((station) => toZoneStation(network, station, scopeIds));
  const scopeStations = stations.filter((station) => station.isInScope);

  return {
    title: titleOf(network, scope),
    stations,
    // Карточки всех станций зоны считаем сразу: выбор станции идёт без запроса к серверу.
    trainsByStation: Object.fromEntries(
      scopeStations.map((station) => [
        station.id,
        trainsOf(network, station.id),
      ]),
    ),
    sections: sections.map((section) => ({
      ...section,
      flow: sectionFlow(network.trains, section),
    })),
    movingTrains: movingTrainsOn(network, sections),
    summary: summarize(network, scopeStations),
  };
}

export async function getStation(stationId: string) {
  const { stations } = await getNetwork();
  return stations.find((station) => station.id === stationId) ?? null;
}

// Соседи по участкам: нечётная сторона — откуда поезда идут к нам, чётная — куда от нас.
export async function getStationNeighbors(stationId: string) {
  const network = await getNetwork();
  const { sections } = network;
  const incoming = sections.find((section) => section.toId === stationId);
  const outgoing = sections.find((section) => section.fromId === stationId);
  return {
    odd: incoming == null ? null : nameOf(network, incoming.fromId),
    even: outgoing == null ? null : nameOf(network, outgoing.toId),
  };
}

function withIndexes(network: Network, indexes: Map<string, number>) {
  const stations = network.stations.map((station) => ({
    ...station,
    efficiencyIndex: indexes.get(station.id) ?? station.efficiencyIndex,
  }));
  return { ...network, stations };
}

// Ближайшие события станции сверху: прибытие или отправление.
function trainsOf(network: Network, stationId: string): StationTrain[] {
  const name = (id: string) => nameOf(network, id);
  return stationTrains(network.trains, stationId)
    .map(({ train, stop, incoming, outgoing, flow }) => ({
      trainId: train.id,
      number: train.number,
      kind: train.kind,
      flow,
      originName: name(train.route[0].stationId),
      destinationName: name(train.route[train.route.length - 1].stationId),
      fromName: incoming == null ? null : name(incoming.from.stationId),
      toName: outgoing == null ? null : name(outgoing.to.stationId),
      arrival: stop.arrival,
      departure: stop.departure,
      nextArrival: outgoing?.to.arrival ?? null,
      delay: stop.delay,
      isTerminal: train.route[train.route.length - 1] === stop,
    }))
    .toSorted((a, b) => eventTime(a) - eventTime(b));
}

// Поезда в пути по участкам зоны — в любую сторону.
function movingTrainsOn({ trains, now }: Network, sections: Section[]) {
  const sectionKeys = new Set(
    sections.flatMap(({ fromId, toId }) => [
      `${fromId}>${toId}`,
      `${toId}>${fromId}`,
    ]),
  );
  return movingLegs(trains)
    .filter(({ from, to }) =>
      sectionKeys.has(`${from.stationId}>${to.stationId}`),
    )
    .map(
      ({ train, from, to }): MovingTrain => ({
        trainId: train.id,
        number: train.number,
        kind: train.kind,
        fromId: from.stationId,
        toId: to.stationId,
        departsAt: epochMs(now + from.departure),
        arrivesAt: epochMs(now + to.arrival),
        delay: to.delay,
      }),
    );
}

function epochMs(minutes: number) {
  return minutes * 60_000;
}

function eventTime(train: StationTrain) {
  return train.flow === "departing" ? train.departure : train.arrival;
}

function stationIdsOf({ stations }: Network, scope: MapScope) {
  if (scope.kind === "station") return new Set([scope.stationId]);
  return new Set(
    stations
      .filter((station) => station.dispatchAreaId === scope.dispatchAreaId)
      .map((station) => station.id),
  );
}

// Станции зоны и их соседи — другие концы участков, выходящих из зоны.
function visibleStations(
  { stations }: Network,
  scopeIds: Set<string>,
  sections: Section[],
) {
  const visibleIds = new Set(scopeIds);
  for (const section of sections) {
    visibleIds.add(section.fromId);
    visibleIds.add(section.toId);
  }
  return stations.filter((station) => visibleIds.has(station.id));
}

function titleOf(network: Network, scope: MapScope) {
  if (scope.kind === "station") {
    return `Станция ${nameOf(network, scope.stationId)}`;
  }
  return network.areaNames.get(scope.dispatchAreaId) ?? "Диспетчерский круг";
}

function toZoneStation(
  { trains }: Network,
  station: Station,
  scopeIds: Set<string>,
): ZoneStation {
  return {
    ...station,
    flow: stationFlow(trains, station.id),
    isInScope: scopeIds.has(station.id),
  };
}

function nameOf({ stations }: Network, stationId: string) {
  return (
    stations.find((station) => station.id === stationId)?.name ?? stationId
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

function summarize({ trains }: Network, stations: ZoneStation[]): ZoneSummary {
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
    trainsWithinCount: trains.filter((train) => isTrainWithin(train, scopeIds))
      .length,
    arrivingCount,
    incidentCount,
  };
}
