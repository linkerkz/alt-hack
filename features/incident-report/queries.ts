import { buildMockReport } from "./mock";
import { INCIDENT_CODE_PREFIX } from "./paths";
import type { IncidentReport } from "./types";

const INCIDENT_NUMBER = /^\d{4}$/;

// Пока все отчёты — заглушка сценария С3; номер берём из адреса без «И-».
export async function getIncidentReport(
  number: string,
): Promise<IncidentReport | null> {
  if (!INCIDENT_NUMBER.test(number)) return null;
  return buildMockReport(`${INCIDENT_CODE_PREFIX}${number}`);
}
