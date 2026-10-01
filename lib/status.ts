export type Status = "normal" | "warning" | "critical";

// Пороги индекса эффективности: ниже warning — «Внимание», ниже critical — «Критично».
const STATUS_THRESHOLDS = { warning: 75, critical: 55 };

export function toStatus(efficiencyIndex: number): Status {
  if (efficiencyIndex < STATUS_THRESHOLDS.critical) return "critical";
  if (efficiencyIndex < STATUS_THRESHOLDS.warning) return "warning";
  return "normal";
}

export const STATUS_ORDER: Status[] = ["critical", "warning", "normal"];

export const STATUS_LABEL: Record<Status, string> = {
  normal: "Норма",
  warning: "Внимание",
  critical: "Критично",
};

// Цвета для Leaflet (там нужны значения, а не классы Tailwind).
export const STATUS_COLOR: Record<Status, string> = {
  normal: "oklch(0.5 0.1 150)",
  warning: "#a06f24",
  critical: "oklch(0.52 0.17 28)",
};

export const STATUS_TEXT_CLASS: Record<Status, string> = {
  normal: "text-status-normal",
  warning: "text-status-warning",
  critical: "text-status-critical",
};

// Цвет — обводка, не заливка: так принято в редакторской теме проекта.
export const STATUS_BADGE_CLASS: Record<Status, string> = {
  normal: "border-status-normal text-status-normal",
  warning: "border-status-warning text-status-warning",
  critical: "border-status-critical text-status-critical",
};

export const STATUS_DOT_CLASS: Record<Status, string> = {
  normal: "bg-status-normal",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
};
