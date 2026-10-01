import { TONE_GLYPH, TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";

type Props = { incident: StationConsoleData["incident"] };

// Пока путейцы не нашли повреждения, инцидент — «Внимание».
const SEVERITY = {
  normal: "Норма",
  warning: "Внимание",
  critical: "Критично",
};

// Шапка инцидента: код, что случилось и где.
export function IncidentHeader({ incident }: Props) {
  const { tone, fault } = incident;
  return (
    <header className="flex flex-col gap-1">
      <p
        className={`text-[11px] uppercase tracking-[0.08em] ${TONE_TEXT_CLASS[tone]}`}
      >
        {TONE_GLYPH[tone]} {SEVERITY[tone]} · {incident.code} ·{" "}
        {incident.detectedAt}
      </p>
      <h2 className="font-heading font-semibold text-[25px] leading-[1.12]">
        {fault.title}
      </h2>
      <p className="text-[12.5px] text-muted">
        Стрелка С3, нечётная горловина · {fault.source}
      </p>
    </header>
  );
}
