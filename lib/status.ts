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
  normal: "#34d399",
  warning: "#fbbf24",
  critical: "#f43f5e",
};

export const STATUS_TEXT_CLASS: Record<Status, string> = {
  normal: "text-emerald-400",
  warning: "text-amber-400",
  critical: "text-rose-500",
};

export const STATUS_BADGE_CLASS: Record<Status, string> = {
  normal: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  critical: "border-rose-500/40 bg-rose-500/15 text-rose-300",
};

export const STATUS_DOT_CLASS: Record<Status, string> = {
  normal: "bg-emerald-400",
  warning: "bg-amber-400",
  critical: "bg-rose-500",
};
