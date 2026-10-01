// Код инцидента в базе — «И-0417»; в адресе отчёта — только номер.
export const INCIDENT_CODE_PREFIX = "И-";

export function incidentReportPath(stationId: string, incidentCode: string) {
  const number = incidentCode.replace(INCIDENT_CODE_PREFIX, "");
  return `/dashboard/${stationId}/incidents/${number}`;
}
