import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import type { Operation, OperationStatus } from "../types";

const STATUS_BAR_CLASS: Record<OperationStatus, string> = {
  completed: "bg-normal/70",
  "in-progress": "bg-accent",
  planned: "bg-neutral-300",
  delayed: "bg-critical/80",
};

type Bounds = { min: number; max: number };

export function OperationsGantt({ operations }: { operations: Operation[] }) {
  const bounds = getBounds(operations);
  const hours = getHourTicks(bounds);

  return (
    <Card className="space-y-3 p-5">
      <Kicker>Операции · временная шкала</Kicker>

      <div className="relative mb-1 ml-[calc(10rem+0.75rem)] h-4 text-[11px] text-muted">
        {hours.map((hour) => (
          <span
            key={hour}
            className="absolute -translate-x-1/2"
            style={{ left: `${toPercent(hour, bounds)}%` }}
          >
            {toClockLabel(hour)}
          </span>
        ))}
      </div>

      <ul className="space-y-2">
        {operations.map((operation) => (
          <li key={operation.id} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-[13px] text-ink">
              {operation.title}
            </span>
            <div className="relative h-5 flex-1 rounded bg-surface">
              <div
                className={`absolute inset-y-0 rounded ${STATUS_BAR_CLASS[operation.status]}`}
                style={barStyle(operation, bounds)}
                title={operationTooltip(operation)}
              />
            </div>
            {operation.delayMinutes != null && (
              <span className="w-16 shrink-0 text-right text-[12px] text-critical">
                +{operation.delayMinutes} мин
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function getBounds(operations: Operation[]): Bounds {
  const starts = operations.map((operation) =>
    parseClock(operation.plannedStart),
  );
  const ends = operations.map((operation) =>
    parseClock(operation.actualEnd ?? operation.plannedEnd),
  );
  return { min: Math.min(...starts), max: Math.max(...ends) };
}

function getHourTicks({ min, max }: Bounds): number[] {
  const firstHour = Math.floor(min / 60) * 60;
  const ticks: number[] = [];
  for (let hour = firstHour; hour <= max; hour += 60) ticks.push(hour);
  return ticks;
}

function toPercent(minutes: number, { min, max }: Bounds): number {
  const span = max - min;
  return span <= 0 ? 0 : ((minutes - min) / span) * 100;
}

function barStyle(operation: Operation, bounds: Bounds) {
  const start = parseClock(operation.plannedStart);
  const end = parseClock(operation.actualEnd ?? operation.plannedEnd);
  const left = toPercent(start, bounds);
  const width = Math.max(toPercent(end, bounds) - left, 2);
  return { left: `${left}%`, width: `${width}%` };
}

function operationTooltip(operation: Operation): string {
  const plan = `План: ${operation.plannedStart}–${operation.plannedEnd}`;
  if (operation.actualStart == null) return plan;

  const fact = `Факт: ${operation.actualStart}–${operation.actualEnd ?? "…"}`;
  const delay =
    operation.delayMinutes == null
      ? ""
      : ` · Задержка: +${operation.delayMinutes} мин`;
  return `${plan}\n${fact}${delay}`;
}

function toClockLabel(minutes: number): string {
  return `${Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0")}:00`;
}

function parseClock(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
