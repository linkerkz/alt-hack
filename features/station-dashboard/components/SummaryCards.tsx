import { Card } from "@/components/ui/Card";
import { Meter } from "@/components/ui/Meter";
import { Metric } from "@/components/ui/Metric";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Props = {
  trainCount: number;
  delayCount: number;
  trackLoad: number;
};

// Высокая загрузка путей — тот же порог, что и в «Требует внимания».
const TRACK_LOAD_WARNING = 85;

export function SummaryCards({ trainCount, delayCount, trackLoad }: Props) {
  const isTrackLoadHigh = trackLoad >= TRACK_LOAD_WARNING;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card className="p-4">
        <Metric label="Поезда за сутки" value={trainCount} />
      </Card>

      <Card className="p-4">
        <Metric label="Задержки" value={delayCount}>
          {delayCount === 0 && (
            <span className="text-[12px] text-normal">Без задержек</span>
          )}
        </Metric>
      </Card>

      <Card className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] text-muted">Загрузка путей</span>
          {isTrackLoadHigh && <StatusBadge tone="warning" label="Высокая" />}
        </div>
        <p
          className={`font-heading font-semibold text-[22px] leading-[1.15] tracking-[-0.01em] ${isTrackLoadHigh ? "text-warning" : "text-ink"}`}
        >
          {trackLoad}%
        </p>
        <Meter
          parts={[
            {
              value: trackLoad,
              className: isTrackLoadHigh ? "bg-warning" : "bg-accent",
            },
          ]}
          label="Загрузка путей"
        />
      </Card>
    </div>
  );
}
