import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { canOpenStation, homePath } from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import { getStation, getStationTrains } from "@/features/network-map/queries";
import { getLiveIndexes } from "@/features/station-console/queries";
import { AttentionList } from "@/features/station-dashboard/components/AttentionList";
import { EfficiencyHistoryChart } from "@/features/station-dashboard/components/EfficiencyHistoryChart";
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
  const user = await requireUser();
  const { stationId } = await params;
  const [found, liveIndexes] = await Promise.all([
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
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-4 overflow-y-auto p-6">
        <ReportHeader
          stationId={station.id}
          stationName={station.name}
          stationCode={station.code}
          efficiencyIndex={station.efficiencyIndex}
        />

        <SummaryCards
          efficiencyIndex={station.efficiencyIndex}
          planPercent={planProgress.percent}
          trainCount={station.trainCount}
          delayCount={statistics.delayCount}
          trackLoad={station.trackLoad}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <EfficiencyPanel value={station.efficiencyIndex} />
          <PlanProgressCard progress={planProgress} />
        </div>

        <OperationsGantt operations={operations} />

        <div className="grid gap-4 md:grid-cols-2">
          <Statistics stats={statistics} />
          <AttentionList items={attentionItems} />
        </div>

        <EfficiencyHistoryChart points={efficiencyHistory} />

        <TrainRadar trains={trains} />
      </main>
    </>
  );
}
