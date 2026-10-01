import { redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import {
  canOpenNetwork,
  canOpenStation,
  homePath,
  ownConsolePath,
  ownDashboardPath,
  scopeOf,
} from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import type { CurrentUser } from "@/features/auth/types";
import { ZoneMapView } from "@/features/network-map/components/ZoneMapView";
import {
  getStationNeighbors,
  getZoneMap,
} from "@/features/network-map/queries";
import type { ZoneStation } from "@/features/network-map/types";
import { ApprovalRequests } from "@/features/station-console/components/ApprovalRequests";
import {
  getApprovalRequests,
  getLiveIndexes,
} from "@/features/station-console/queries";

// Соседа без участка в сети подписываем нейтрально.
const UNKNOWN_NEIGHBOR = "соседняя";

export default async function ZoneMapPage() {
  const user = await requireUser();
  const scope = scopeOf(user);
  if (!canOpenNetwork(user) || scope == null) {
    redirect(homePath(user) ?? "/login");
  }

  // Индекс станций с планом путей считает пульт — карта показывает его же.
  const zone = await getZoneMap(scope, await getLiveIndexes());
  const consoleStations = zone.stations.filter((station) =>
    canOpenStation(user, station),
  );
  const requests = await approvalRequestsOf(user, consoleStations);
  const requestStationIds = requests
    .filter((request) => request.state === "pending")
    .map((request) => request.stationId);

  return (
    <>
      <AppHeader
        current="network"
        stationHref={ownConsolePath(user)}
        dashboardHref={ownDashboardPath(user)}
        account={<AccountMenu user={user} />}
      />
      <ZoneMapView
        {...zone}
        defaultStationId={scope.kind === "station" ? scope.stationId : null}
        consoleStationIds={consoleStations.map((station) => station.id)}
        requestStationIds={requestStationIds}
        showRequests={user.role === "dnc"}
        overlay={
          requests.length > 0 && <ApprovalRequests requests={requests} />
        }
      />
      <LiveRefresh />
    </>
  );
}

// Запросы на согласование отвечает ДНЦ — только по станциям своего круга.
async function approvalRequestsOf(user: CurrentUser, stations: ZoneStation[]) {
  if (user.role !== "dnc") return [];
  const withNeighbors = await Promise.all(
    stations.map(async (station) => {
      const found = await getStationNeighbors(station.id);
      const neighbors = {
        odd: found.odd ?? UNKNOWN_NEIGHBOR,
        even: found.even ?? UNKNOWN_NEIGHBOR,
      };
      return { id: station.id, name: station.name, neighbors };
    }),
  );
  return getApprovalRequests(withNeighbors);
}
