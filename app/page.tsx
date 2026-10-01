import { AppHeader } from "@/components/ui/AppHeader";
import { MapLegend } from "@/features/network-map/components/MapLegend";
import { NetworkMap } from "@/features/network-map/components/NetworkMap";
import { NetworkSummaryPanel } from "@/features/network-map/components/NetworkSummaryPanel";
import { StationList } from "@/features/network-map/components/StationList";
import { StationPreview } from "@/features/network-map/components/StationPreview";
import { getNetworkMap } from "@/features/network-map/queries";

export default async function NetworkPage({ searchParams }: PageProps<"/">) {
  const { station } = await searchParams;
  const { stations, sections, summary } = await getNetworkMap();
  const selectedStation = stations.find((item) => item.id === station) ?? null;
  const selectedStationId = selectedStation?.id ?? null;

  return (
    <>
      <AppHeader current="network" />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-80 shrink-0 flex-col border-line border-r bg-surface-1">
          <NetworkSummaryPanel summary={summary} />
          <StationList
            stations={stations}
            selectedStationId={selectedStationId}
          />
        </aside>

        <main className="relative min-w-0 flex-1">
          <NetworkMap
            stations={stations}
            sections={sections}
            selectedStationId={selectedStationId}
          />
          <div className="pointer-events-none absolute inset-0 z-[1000] flex items-start justify-end p-4">
            {selectedStation != null && (
              <div className="pointer-events-auto max-h-full">
                <StationPreview station={selectedStation} />
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
