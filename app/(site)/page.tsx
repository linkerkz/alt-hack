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
import { getZoneMap } from "@/features/network-map/queries";
import type { ZoneStation } from "@/features/network-map/types";
import { ApprovalRequests } from "@/features/station-console/components/ApprovalRequests";
import {
  getApprovalRequests,
  getLiveIndexes,
} from "@/features/station-console/queries";
import type { Neighbors } from "@/features/station-console/types";

export default async function ZoneMapPage() {
  const user = await requireUser();
  const scope = scopeOf(user);
  if (!canOpenNetwork(user) || scope == null) {
    redirect(homePath(user) ?? "/login");
  }

  // Индекс станций с планом путей считает пульт — карта показывает его же.
  const { neighborsByStation, ...zone } = await getZoneMap(
    scope,
    await getLiveIndexes(),
  );
  const consoleStations = zone.stations.filter((station) =>
    canOpenStation(user, station),
  );
  const consoleStationIds = consoleStations.map((station) => station.id);
  const requests = await approvalRequestsOf(
    user,
    consoleStations,
    neighborsByStation,
  );
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
        selectableStationIds={consoleStationIds}
      />
      <ZoneMapView
        {...zone}
        defaultStationId={scope.kind === "station" ? scope.stationId : null}
        consoleStationIds={consoleStationIds}
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
function approvalRequestsOf(
  user: CurrentUser,
  stations: ZoneStation[],
  neighborsByStation: Record<string, Neighbors>,
) {
  if (user.role !== "dnc") return [];
  return getApprovalRequests(
    stations.map((station) => ({
      id: station.id,
      name: station.name,
      neighbors: neighborsByStation[station.id],
    })),
  );
}
