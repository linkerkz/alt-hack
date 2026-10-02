import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import type { PlanProgress } from "../types";

export function PlanProgressCard({ progress }: { progress: PlanProgress }) {
  const { completed, inProgress, problems, total, percent } = progress;
  // «Проблемы» — реальный conflict_count станции, отдельный от статусов
  // операций, поэтому «Ожидают» считаем остатком, а не статусом «planned».
  const waiting = Math.max(total - completed - problems, 0);
  const rows = [
    { label: "Выполнено", value: completed, swatch: "bg-normal" },
    { label: "В работе", value: inProgress, swatch: "bg-accent" },
    { label: "Проблемы", value: problems, swatch: "bg-critical" },
    { label: "Ожидают", value: waiting, swatch: "bg-neutral-400" },
  ];

  return (
    <Card className="flex min-w-0 flex-col gap-4 p-6">
      <Kicker tone="accent">II · Выполнение плана</Kicker>

      <p className="flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className="font-heading font-semibold text-[80px] leading-[0.82] tracking-[-0.03em]">
          {percent}
        </span>
        <span className="pb-0.5 font-heading text-[30px] text-muted">%</span>
        <span className="ml-auto pb-1 text-[13px] text-muted">
          {completed} из {total} {pluralOperations(total)}
        </span>
      </p>

      <div
        role="img"
        aria-label="Выполнение плана по операциям"
        className="flex h-2.5 gap-0.5"
      >
        <div
          className="bg-normal"
          style={{ width: shareOf(completed, total) }}
        />
        <div
          className="bg-critical"
          style={{ width: shareOf(problems, total) }}
        />
        <div className="flex-1 bg-neutral-200" />
      </div>

      <dl className="grid grid-cols-2 border-line border-t">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex flex-col gap-0.5 border-line border-b py-3"
          >
            <dt className="flex items-center gap-2 text-[13px] text-muted">
              <span className={`size-2.5 ${row.swatch}`} />
              {row.label}
            </dt>
            <dd className="font-heading font-semibold text-[32px] leading-[1.05]">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

function shareOf(part: number, total: number) {
  return `${total === 0 ? 0 : (part / total) * 100}%`;
}

function pluralOperations(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return "операции";
  return "операций";
}
