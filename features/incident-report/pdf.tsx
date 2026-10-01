import { renderPdf } from "@/lib/pdf";
import { ReportPdf } from "./components/ReportPdf";
import type { IncidentReport } from "./types";

type Params = { report: IncidentReport; stationName: string };

// PDF отчёта по инциденту и имя файла для скачивания.
export async function renderReportPdf({ report, stationName }: Params) {
  const pdf = await renderPdf(
    <ReportPdf report={report} stationName={stationName} />,
  );
  return { pdf, fileName: `Отчёт по инциденту ${report.code}.pdf` };
}
