import type { Tone } from "@/components/ui/tone";

// Пороги индекса эффективности: ниже warning — «Внимание», ниже critical — «Критично».
// Совпадают с features/network-map/status.ts — один и тот же Station.efficiencyIndex.
const STATUS_THRESHOLDS = { warning: 75, critical: 55 };

export function toStatus(efficiencyIndex: number): Tone {
  if (efficiencyIndex < STATUS_THRESHOLDS.critical) return "critical";
  if (efficiencyIndex < STATUS_THRESHOLDS.warning) return "warning";
  return "normal";
}

export const STATUS_LABEL: Record<Tone, string> = {
  normal: "Норма",
  warning: "Внимание",
  critical: "Критично",
};
