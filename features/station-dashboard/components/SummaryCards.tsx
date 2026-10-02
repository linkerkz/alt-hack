import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Props = {
  trainCount: number;
  delayCount: number;
  trackLoad: number;
};

// Высокая загрузка путей — тот же порог, что и в «Требует внимания».
const TRACK_LOAD_WARNING = 85;

const VALUE_CLASS =
  "font-heading font-semibold text-[44px] leading-none tracking-[-0.02em]";

export function SummaryCards({ trainCount, delayCount, trackLoad }: Props) {
  const isTrackLoadHigh = trackLoad >= TRACK_LOAD_WARNING;

  return (
    <Card className="flex min-w-0 flex-col gap-3 p-6">
      <Kicker tone="accent">III · Сводка</Kicker>
      <dl className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 border-line border-b pb-3">
          <dt className="text-[13px] text-muted">Поезда за сутки</dt>
          <dd className={VALUE_CLASS}>{trainCount}</dd>
        </div>

        <div className="flex flex-col gap-1 border-line border-b pb-3">
          <dt className="text-[13px] text-muted">Задержки</dt>
          {delayCount === 0 ? (
            <dd className="font-heading font-semibold text-[26px] text-normal leading-tight">
              Без задержек
            </dd>
          ) : (
            <dd className={`${VALUE_CLASS} text-critical`}>{delayCount}</dd>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <dt className="flex items-center justify-between gap-2 text-[13px] text-muted">
            Загрузка путей
            {isTrackLoadHigh && <StatusBadge tone="warning" label="Высокая" />}
          </dt>
          <dd
            className={`${VALUE_CLASS} ${isTrackLoadHigh ? "text-warning" : ""}`}
          >
            {trackLoad}
            <span className="font-normal text-[24px] text-muted"> %</span>
          </dd>
          <dd className="relative mt-1 h-1 bg-neutral-200">
            <div
              className={`absolute inset-y-0 left-0 ${isTrackLoadHigh ? "bg-warning" : "bg-neutral-700"}`}
              style={{ width: `${trackLoad}%` }}
            />
            <div
              className="absolute -inset-y-1 w-px bg-neutral-700"
              style={{ left: `${TRACK_LOAD_WARNING}%` }}
            />
          </dd>
          <dd className="text-[11.5px] text-muted">
            порог внимания — {TRACK_LOAD_WARNING} %
          </dd>
        </div>
      </dl>
    </Card>
  );
}
