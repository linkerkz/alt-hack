import { MOCK_INCIDENT_REPORT } from "./mock";
import type { IncidentReport } from "./types";

// Пока отчёт один — заглушка И-0417; номер берём из адреса без «И-».
export async function getIncidentReport(
  number: string,
): Promise<IncidentReport | null> {
  return MOCK_INCIDENT_REPORT.code === `И-${number}`
    ? MOCK_INCIDENT_REPORT
    : null;
}
