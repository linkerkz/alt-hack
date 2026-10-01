import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { Meter } from "@/components/ui/Meter";
import { Metric } from "@/components/ui/Metric";
import type { PlanProgress } from "../types";

export function PlanProgressCard({ progress }: { progress: PlanProgress }) {
  const { completed, inProgress, problems, total, percent } = progress;
  // «Проблемы» — реальный conflict_count станции, отдельный от статусов
  // операций, поэтому «Ожидают» считаем остатком, а не статусом «planned».
  const waiting = Math.max(total - completed - problems, 0);

  return (
    <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Kicker>Выполнение плана</Kicker>
        <span className="text-[13px] text-muted">
          {total} {pluralOperations(total)}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-heading font-semibold text-[44px] leading-none tracking-[-0.02em]">
          {percent}
          <span className="text-[22px] text-muted">%</span>
        </span>
        <span className="text-[13px] text-muted">
          {completed} из {total} выполнено
        </span>
      </div>

      <Meter
        parts={[
          { value: shareOf(completed, total), className: "bg-normal" },
          { value: shareOf(problems, total), className: "bg-critical" },
          { value: shareOf(waiting, total), className: "bg-neutral-300" },
        ]}
        label="Выполнение плана по операциям"
      />

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Выполнено" value={completed} valueClass="text-normal" />
        <Metric
          label="В работе"
          value={inProgress}
          valueClass="text-accent-700"
        />
        <Metric label="Проблемы" value={problems} valueClass="text-critical" />
        <Metric label="Ожидают" value={waiting} />
      </dl>
    </Card>
  );
}

function shareOf(part: number, total: number) {
  return total === 0 ? 0 : (part / total) * 100;
}

function pluralOperations(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "операция";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100))
    return "операции";
  return "операций";
}
