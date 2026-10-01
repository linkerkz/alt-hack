import { redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import {
  canOpenNetwork,
  canOpenStation,
  homePath,
  scopeOf,
} from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import { MapLegend } from "@/features/network-map/components/MapLegend";
import { NetworkMap } from "@/features/network-map/components/NetworkMap";
import { StationList } from "@/features/network-map/components/StationList";
import { StationPreview } from "@/features/network-map/components/StationPreview";
import { ZoneSummaryPanel } from "@/features/network-map/components/ZoneSummaryPanel";
import { getStationTraffic, getZoneMap } from "@/features/network-map/queries";

export default async function ZoneMapPage({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const scope = scopeOf(user);
  if (!canOpenNetwork(user) || scope == null) {
    redirect(homePath(user) ?? "/login");
  }

  const { station } = await searchParams;
  const { title, stations, sections, summary } = await getZoneMap(scope);
  const scopeStations = stations.filter((item) => item.isInScope);

  // У ДСП/ДСЦС/ДС своя станция выбрана сразу — режим «моя станция».
  const requestedId =
    typeof station === "string"
      ? station
      : scope.kind === "station"
        ? scope.stationId
        : null;
  const selectedStation =
    scopeStations.find((item) => item.id === requestedId) ?? null;
  const traffic =
    selectedStation == null
      ? null
      : await getStationTraffic(selectedStation.id);

  return (
    <>
      <AppHeader current="network" account={<AccountMenu user={user} />} />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-80 shrink-0 flex-col border-line border-r bg-surface-1">
          <ZoneSummaryPanel title={title} summary={summary} />
          <StationList
            stations={scopeStations}
            selectedStationId={selectedStation?.id ?? null}
          />
        </aside>

        <main className="relative min-w-0 flex-1">
          <NetworkMap
            stations={stations}
            sections={sections}
            selectedStationId={selectedStation?.id ?? null}
          />
          <div className="pointer-events-none absolute inset-0 z-[1000] flex items-start justify-end p-4">
            {selectedStation != null && traffic != null && (
              <div className="pointer-events-auto max-h-full">
                <StationPreview
                  station={selectedStation}
                  traffic={traffic}
                  canOpenConsole={canOpenStation(user, selectedStation)}
                />
              </div>
            )}
          </div>
          <div className="absolute bottom-6 left-4 z-[1000]">
            <MapLegend />
          </div>
        </main>
      </div>
    </>
  );
}
