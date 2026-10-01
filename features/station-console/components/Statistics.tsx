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
    <section className="space-y-3 rounded-md border border-line p-5">
      <p className="text-[10px] text-muted uppercase tracking-widest">
        Статистика смены
      </p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-line border-t">
              <td className="py-2 text-muted">{row.label}</td>
              <td className="py-2 text-right font-heading text-ink tabular-nums">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
