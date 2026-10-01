import { notFound, redirect } from "next/navigation";
import { AppHeader } from "@/components/ui/AppHeader";
import { canOpenStation, homePath } from "@/features/auth/access";
import { AccountMenu } from "@/features/auth/components/AccountMenu";
import { requireUser } from "@/features/auth/queries";
import { IndexChart } from "@/features/incident-report/components/IndexChart";
import { ReportKpis } from "@/features/incident-report/components/ReportKpis";
import { ReportList } from "@/features/incident-report/components/ReportList";
import { ReportOptions } from "@/features/incident-report/components/ReportOptions";
import { ReportPdfLink } from "@/features/incident-report/components/ReportPdfLink";
import { ReportTimeline } from "@/features/incident-report/components/ReportTimeline";
import { ReportTitle } from "@/features/incident-report/components/ReportTitle";
import { getIncidentReport } from "@/features/incident-report/queries";
import { getStation } from "@/features/network-map/queries";

export default async function IncidentReportPage({
  params,
}: PageProps<"/dashboard/[stationId]/incidents/[number]">) {
  const user = await requireUser();
  const { stationId, number } = await params;
  const [station, report] = await Promise.all([
    getStation(stationId),
    getIncidentReport(number),
  ]);
  if (station == null || report == null) notFound();
  if (!canOpenStation(user, station)) redirect(homePath(user) ?? "/login");

  return (
    <>
      <AppHeader
        current="analytics"
        stationHref={`/stations/${station.id}`}
        dashboardHref={`/dashboard/${station.id}`}
        account={<AccountMenu user={user} />}
      />
      <main className="mx-auto w-full max-w-[860px] flex-1 overflow-y-auto px-4 pt-7 pb-16 sm:px-8">
        <article className="flex flex-col gap-6.5">
          <div className="flex items-start justify-between gap-4">
            <ReportTitle {...report} />
            <ReportPdfLink
              href={`/dashboard/${station.id}/incidents/${number}/pdf`}
            />
          </div>
          <ReportKpis kpis={report.kpis} />
          <IndexChart
            history={report.indexHistory}
            forecast={report.forecast}
          />
          <div className="grid gap-9 md:grid-cols-2">
            <ReportTimeline events={report.timeline} />
            <div className="flex flex-col gap-3.5">
              <ReportOptions options={report.options} />
              <ReportList
                title="Решение и согласования"
                items={report.decisions}
              />
              <ReportList title="Выполненные работы" items={report.works} />
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
