import { Card } from "@/components/ui/Card";
import { IndexValue } from "@/components/ui/IndexValue";
import { Kicker } from "@/components/ui/Kicker";
import { Meter } from "@/components/ui/Meter";
import type { Tone } from "@/components/ui/tone";
import { INDEX_THRESHOLDS } from "@/lib/efficiencyIndex";
import { STATUS_LABEL, toStatus } from "../status";

const STATUS_EXPLANATION: Record<Tone, string> = {
  normal: "Станция работает в пределах плановых показателей.",
  warning: "Есть отклонения от плана — см. блок «Требует внимания» ниже.",
  critical: "Станция работает в критическом режиме — нужны срочные меры.",
};

export function EfficiencyPanel({ value }: { value: number }) {
  const status = toStatus(value);

  return (
    <Card className="space-y-4 p-5">
      <Kicker>Индекс эффективности</Kicker>
      <IndexValue
        value={value}
        max={100}
        tone={status}
        label={STATUS_LABEL[status]}
        caption={STATUS_EXPLANATION[status]}
      />
      <div className="space-y-1.5">
        <div className="relative">
          <Meter parts={scaleParts()} label="Шкала индекса эффективности" />
          <span
            className="-translate-y-1/2 absolute top-1/2 h-3 w-[3px] rounded-full bg-ink"
            style={{ left: `calc(${value}% - 1.5px)` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted">
          <span>Критично</span>
          <span>Внимание</span>
          <span className="font-medium text-normal">Норма</span>
        </div>
      </div>
    </Card>
  );
}

// Ширина зон шкалы — те же пороги, что определяют статус (lib/efficiencyIndex.ts).
function scaleParts() {
  const { warning, normal } = INDEX_THRESHOLDS;
  return [
    { value: warning, className: "bg-critical/60" },
    { value: normal - warning, className: "bg-warning/60" },
    { value: 100 - normal, className: "bg-normal/60" },
  ];
}
