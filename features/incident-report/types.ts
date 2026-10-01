// Отчёт по инциденту: черновик собирается, пока инцидент открыт,
// после закрытия — формируется автоматически.
export type IncidentReport = {
  code: string;
  state: ReportState;
  title: string;
  summary: string;
  kpis: ReportKpi[];
  indexHistory: IndexPoint[];
  // Прогноз индекса, если ничего не менять: от момента сбоя до конца окна.
  forecast: [IndexPoint, IndexPoint];
  timeline: ReportEvent[];
  options: ReportOption[];
  decisions: string[];
  works: string[];
};

export type ReportState = "draft" | "final";

export type ReportKpi = {
  label: string;
  fact: string;
  // С чем сравниваем факт: прогноз или «без решения».
  compare: string;
  note: string;
};

// Время «ЧЧ:ММ» в пределах смены.
export type IndexPoint = { time: string; value: number };

export type ReportEvent = { time: string; text: string };

export type ReportOption = {
  name: string;
  index: number;
  maxDelayMinutes: number;
  // Нужно ли согласование ДНЦ; null — вариант «ничего не менять».
  needsApproval: boolean | null;
  chosen: boolean;
};
