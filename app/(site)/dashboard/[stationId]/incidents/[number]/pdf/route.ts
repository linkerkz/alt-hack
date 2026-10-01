import { notFound, redirect } from "next/navigation";
import { canOpenStation, homePath } from "@/features/auth/access";
import { requireUser } from "@/features/auth/queries";
import { renderReportPdf } from "@/features/incident-report/pdf";
import { getIncidentReport } from "@/features/incident-report/queries";
import { getStation } from "@/features/network-map/queries";

// Отчёт по инциденту файлом PDF — с теми же правами, что и страница отчёта.
export async function GET(
  _request: Request,
  context: RouteContext<"/dashboard/[stationId]/incidents/[number]/pdf">,
) {
  const user = await requireUser();
  const { stationId, number } = await context.params;
  const [station, report] = await Promise.all([
    getStation(stationId),
    getIncidentReport(number),
  ]);
  if (station == null || report == null) notFound();
  if (!canOpenStation(user, station)) redirect(homePath(user) ?? "/login");

  const { pdf, fileName } = await renderReportPdf({
    report,
    stationName: station.name,
  });
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": attachment(fileName),
      "Cache-Control": "private, no-store",
    },
  });
}

// Кириллица в имени файла — через filename*; латинское имя — для клиентов,
// которые его не понимают.
function attachment(fileName: string) {
  return `attachment; filename="incident-report.pdf"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
