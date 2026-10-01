import { redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
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
import { ZoneMapView } from "@/features/network-map/components/ZoneMapView";
import { getZoneMap } from "@/features/network-map/queries";

export default async function ZoneMapPage() {
  const user = await requireUser();
  const scope = scopeOf(user);
  if (!canOpenNetwork(user) || scope == null) {
    redirect(homePath(user) ?? "/login");
  }

  const zone = await getZoneMap(scope);
  const consoleStationIds = zone.stations
    .filter((station) => canOpenStation(user, station))
    .map((station) => station.id);

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
        consoleStationIds={consoleStationIds}
      />
    </>
  );
}
