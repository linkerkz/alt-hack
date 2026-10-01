import { Card } from "@/components/ui/Card";
import { IndexValue } from "@/components/ui/IndexValue";
import { Kicker } from "@/components/ui/Kicker";
import type { Tone } from "@/components/ui/tone";
import { STATUS_LABEL, toStatus } from "../status";

const STATUS_EXPLANATION: Record<Tone, string> = {
  normal: "Станция работает в пределах плановых показателей.",
  warning: "Есть отклонения от плана — см. блок «Требует внимания» ниже.",
  critical: "Станция работает в критическом режиме — нужны срочные меры.",
};

export function EfficiencyPanel({ value }: { value: number }) {
  const status = toStatus(value);

  return (
    <Card className="space-y-3 p-5">
      <Kicker>Индекс эффективности</Kicker>
      <IndexValue
        value={value}
        tone={status}
        label={STATUS_LABEL[status]}
        caption={STATUS_EXPLANATION[status]}
      />
    </Card>
  );
}
