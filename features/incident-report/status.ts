import type { Tone } from "@/components/ui/tone";
import { INDEX_THRESHOLDS } from "@/lib/efficiencyIndex";
import type { ReportState } from "./types";

export const REPORT_STATE_LABEL: Record<ReportState, string> = {
  draft: "черновик, инцидент открыт",
  final: "сформирован автоматически",
};

// Границы полос состояния на графике: ниже warning — «Внимание», ниже
// critical — «Критично». Пороги общие — lib/efficiencyIndex.ts.
export const STATUS_THRESHOLDS = {
  warning: INDEX_THRESHOLDS.normal,
  critical: INDEX_THRESHOLDS.warning,
};

export const STATUS_LABEL: Record<Tone, string> = {
  normal: "Норма",
  warning: "Внимание",
  critical: "Критично",
};

export function approvalLabel(needsApproval: boolean | null) {
  if (needsApproval == null) return "—";
  return needsApproval ? "нужно" : "не нужно";
}
