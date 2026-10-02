import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { canOpenStation, homePath } from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import { getStation, getStationTrains } from "@/features/network-map/queries";
import { getLiveIndexes } from "@/features/station-console/queries";
import { AttentionList } from "@/features/station-dashboard/components/AttentionList";
import { EfficiencyPanel } from "@/features/station-dashboard/components/EfficiencyPanel";
import { OperationsGantt } from "@/features/station-dashboard/components/OperationsGantt";
import { PlanProgressCard } from "@/features/station-dashboard/components/PlanProgressCard";
import { ReportHeader } from "@/features/station-dashboard/components/ReportHeader";
import { Statistics } from "@/features/station-dashboard/components/Statistics";
import { SummaryCards } from "@/features/station-dashboard/components/SummaryCards";
import { TrainRadar } from "@/features/station-dashboard/components/TrainRadar";
import { getStationDashboard } from "@/features/station-dashboard/queries";

export default async function StationDashboardPage({
  params,
}: PageProps<"/dashboard/[stationId]">) {
  const { stationId } = await params;
  const [user, found, liveIndexes] = await Promise.all([
    requireUser(),
    getStation(stationId),
    getLiveIndexes(),
  ]);
  if (found == null) notFound();
  if (!canOpenStation(user, found)) redirect(homePath(user) ?? "/login");

  // Индекс станции с планом путей считает пульт — отчёт показывает его же.
  const efficiencyIndex = liveIndexes.get(found.id) ?? found.efficiencyIndex;
  const station = { ...found, efficiencyIndex };
  const trains = await getStationTrains(station.id);
  const dashboard = await getStationDashboard(station, trains);
  const {
    now,
    planProgress,
    operations,
    attentionItems,
    statistics,
    efficiencyHistory,
  } = dashboard;

  return (
    <>
      <AppHeader
        current="analytics"
        stationHref={`/stations/${station.id}`}
        dashboardHref={`/dashboard/${station.id}`}
        account={<AccountMenu user={user} />}
      />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 overflow-y-auto px-4 py-8 sm:px-8">
        <ReportHeader
          stationId={station.id}
          stationName={station.name}
          stationCode={station.code}
          efficiencyIndex={station.efficiencyIndex}
        />

        <section className="grid gap-6 lg:grid-cols-[5fr_4fr_3fr]">
          <EfficiencyPanel
            value={station.efficiencyIndex}
            history={efficiencyHistory}
            isLive={liveIndexes.has(station.id)}
          />
          <PlanProgressCard progress={planProgress} />
          <SummaryCards
            trainCount={station.trainCount}
            delayCount={statistics.delayCount}
            trackLoad={station.trackLoad}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[7fr_5fr]">
          <TrainRadar trains={trains} />
          <div className="flex min-w-0 flex-col gap-6">
            <AttentionList items={attentionItems} />
            <Statistics stats={statistics} />
          </div>
        </section>

        <OperationsGantt operations={operations} now={now} />

        <footer className="text-[12px] text-muted">
          Время — Алматы. Поезда проездом станцию не занимают и в операции не
          входят.
        </footer>
      </main>
    </>
  );
}
