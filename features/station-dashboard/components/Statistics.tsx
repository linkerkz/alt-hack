import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { Table } from "@/components/ui/Table";
import type { StationStatistics } from "../types";

export function Statistics({ stats }: { stats: StationStatistics }) {
  const rows: { label: string; value: string }[] = [
    { label: "Обработано поездов", value: `${stats.trainsProcessed}` },
    {
      label: "Среднее время обработки",
      value: `${stats.avgProcessingMinutes} мин`,
    },
    { label: "Задержки", value: `${stats.delayCount}` },
    { label: "Средняя задержка", value: `${stats.avgDelayMinutes} мин` },
    { label: "Операций выполнено", value: `${stats.operationsCompleted}` },
  ];

  return (
    <Card className="space-y-3 p-5">
      <Kicker>Статистика смены</Kicker>
      <Table>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="text-right font-heading">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
