import type { Tone } from "@/components/ui/tone";
import type { ReportState } from "./types";

export const REPORT_STATE_LABEL: Record<ReportState, string> = {
  draft: "черновик, инцидент открыт",
  final: "сформирован автоматически",
};

// Пороги индекса эффективности — те же, что в features/station-dashboard/status.ts:
// ниже warning — «Внимание», ниже critical — «Критично».
export const STATUS_THRESHOLDS = { warning: 75, critical: 55 };

export const STATUS_LABEL: Record<Tone, string> = {
  normal: "Норма",
  warning: "Внимание",
  critical: "Критично",
};

export function approvalLabel(needsApproval: boolean | null) {
  if (needsApproval == null) return "—";
  return needsApproval ? "нужно" : "не нужно";
}
