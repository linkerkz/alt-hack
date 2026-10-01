import { Card } from "@/components/ui/Card";
import { Metric } from "@/components/ui/Metric";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import { toStatus } from "../status";

type Props = {
  efficiencyIndex: number;
  planPercent: number;
  trainCount: number;
  delayCount: number;
  trackLoad: number;
};

export function SummaryCards({
  efficiencyIndex,
  planPercent,
  trainCount,
  delayCount,
  trackLoad,
}: Props) {
  const status = toStatus(efficiencyIndex);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <Card className="p-3">
        <Metric
          label="Индекс эффективности"
          value={`${efficiencyIndex}%`}
          valueClass={TONE_TEXT_CLASS[status]}
        />
      </Card>
      <Card className="p-3">
        <Metric label="Выполнение плана" value={`${planPercent}%`} />
      </Card>
      <Card className="p-3">
        <Metric label="Поезда" value={trainCount} />
      </Card>
      <Card className="p-3">
        <Metric
          label="Задержки"
          value={delayCount}
          valueClass={delayCount > 0 ? "text-warning" : undefined}
        />
      </Card>
      <Card className="p-3">
        <Metric
          label="Загрузка путей"
          value={`${trackLoad}%`}
          valueClass={trackLoad >= 85 ? "text-warning" : undefined}
        />
      </Card>
    </div>
  );
}
