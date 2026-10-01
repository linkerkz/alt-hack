import type { Tone } from "@/components/ui/tone";
import { indexStatus } from "@/lib/efficiencyIndex";

// Пороги индекса — общие для всего приложения, см. lib/efficiencyIndex.ts.
export function toStatus(efficiencyIndex: number): Tone {
  return indexStatus(efficiencyIndex);
}

export const STATUS_LABEL: Record<Tone, string> = {
  normal: "Норма",
  warning: "Внимание",
  critical: "Критично",
};
