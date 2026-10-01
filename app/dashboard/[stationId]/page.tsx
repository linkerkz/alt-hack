import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import {
  canOpenStation,
  homePath,
  ownConsolePath,
  ownDashboardPath,
} from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import { getStation } from "@/features/network-map/queries";
import { AttentionList } from "@/features/station-console/components/AttentionList";
import { EfficiencyHistoryChart } from "@/features/station-console/components/EfficiencyHistoryChart";
import { EfficiencyPanel } from "@/features/station-console/components/EfficiencyPanel";
import { OperationsGantt } from "@/features/station-console/components/OperationsGantt";
import { PlanProgressCard } from "@/features/station-console/components/PlanProgressCard";
import { ReportHeader } from "@/features/station-console/components/ReportHeader";
import { Statistics } from "@/features/station-console/components/Statistics";
import { SummaryCards } from "@/features/station-console/components/SummaryCards";
import { getStationDashboard } from "@/features/station-console/queries";

export default async function StationDashboardPage({
  params,
}: PageProps<"/dashboard/[stationId]">) {
  const user = await requireUser();
  const { stationId } = await params;
  const station = await getStation(stationId);
  if (station == null) notFound();
  if (!canOpenStation(user, station)) redirect(homePath(user) ?? "/login");

  const dashboard = await getStationDashboard(station);
  const {
    planProgress,
    operations,
    attentionItems,
    statistics,
    efficiencyHistory,
  } = dashboard;
  const planPercent =
    planProgress.total === 0
      ? 0
      : Math.round((planProgress.completed / planProgress.total) * 100);

  return (
    <>
      <AppHeader
        current="analytics"
        stationHref={ownConsolePath(user)}
        dashboardHref={ownDashboardPath(user)}
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
          planPercent={planPercent}
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
      </main>
    </>
  );
}
