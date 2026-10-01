import { MOCK_INCIDENT_REPORT } from "./mock";
import type { IncidentReport } from "./types";

// Пока отчёт один — заглушка по сценарию стрелки С3. Пульт ведёт на неё из
// закрытого инцидента, поэтому отвечаем на любой номер (из адреса без «И-»)
// и подставляем его в отчёт.
export async function getIncidentReport(
  number: string,
): Promise<IncidentReport | null> {
  if (!/^\d+$/.test(number)) return null;
  return { ...MOCK_INCIDENT_REPORT, code: `И-${number}`, state: "final" };
}
