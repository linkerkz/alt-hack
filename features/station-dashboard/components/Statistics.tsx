import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import type { StationStatistics } from "../types";

export function Statistics({ stats }: { stats: StationStatistics }) {
  const rows = [
    { label: "Обработано поездов", value: stats.trainsProcessed, unit: "" },
    {
      label: "Среднее время обработки",
      value: stats.avgProcessingMinutes,
      unit: "мин",
    },
    { label: "Задержки", value: stats.delayCount, unit: "" },
    { label: "Средняя задержка", value: stats.avgDelayMinutes, unit: "мин" },
    { label: "Операций выполнено", value: stats.operationsCompleted, unit: "" },
  ];

  return (
    <Card className="flex flex-1 flex-col gap-1 p-6">
      <Kicker tone="accent" className="mb-1">
        VI · Статистика смены
      </Kicker>
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline gap-2 border-line border-b py-2 last:border-b-0"
          >
            <dt className="whitespace-nowrap text-[14px] text-neutral-800">
              {row.label}
            </dt>
            <span
              aria-hidden
              className="flex-1 -translate-y-1 border-neutral-300 border-b border-dotted"
            />
            <dd className="font-heading font-semibold text-[24px] leading-none">
              {row.value}
            </dd>
            <span className="min-w-7 text-[12.5px] text-muted">{row.unit}</span>
          </div>
        ))}
      </dl>
    </Card>
  );
}
