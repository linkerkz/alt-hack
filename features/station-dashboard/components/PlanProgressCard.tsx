import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { Meter } from "@/components/ui/Meter";
import { Metric } from "@/components/ui/Metric";
import type { PlanProgress } from "../types";

export function PlanProgressCard({ progress }: { progress: PlanProgress }) {
  const { completed, inProgress, problems, total } = progress;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <Card className="space-y-3 p-5">
      <Kicker>Выполнение плана</Kicker>
      <p className="font-heading text-[40px] leading-none">{percent}%</p>
      <Meter
        parts={[{ value: percent, className: "bg-accent" }]}
        label="Выполнение плана"
      />
      <dl className="grid grid-cols-3 gap-3 text-[13px]">
        <Metric label="Выполнено" value={completed} valueClass="text-normal" />
        <Metric
          label="В работе"
          value={inProgress}
          valueClass="text-accent-700"
        />
        <Metric label="Проблемы" value={problems} valueClass="text-critical" />
      </dl>
      <p className="text-[11px] text-muted">Всего операций: {total}</p>
    </Card>
  );
}
