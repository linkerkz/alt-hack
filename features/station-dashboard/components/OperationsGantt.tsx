import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { toMinutes } from "@/lib/clock";
import type { Operation, OperationStatus } from "../types";

type Props = {
  operations: Operation[];
  // Время отчёта «14:08» — линия «сейчас» на шкале.
  now: string;
};

type Bounds = { min: number; max: number };

const STATUS_LABEL: Record<OperationStatus, string> = {
  completed: "выполнено",
  "in-progress": "в работе",
  planned: "запланировано",
  delayed: "задержка",
};

const BAR_CLASS: Record<OperationStatus, string> = {
  completed: "border-neutral-600 bg-neutral-300",
  "in-progress": "border-accent bg-accent-200",
  planned: "border-dashed border-neutral-500",
  delayed: "border-critical bg-critical/25",
};

const LEGEND: OperationStatus[] = ["completed", "in-progress", "planned"];

// Окно шкалы вокруг «сейчас»: последний час и горизонт прогноза (3 ч).
// Операции смены растянуты на сутки — во всю ширину бруски стали бы точками.
const WINDOW_BEFORE_MINUTES = 60;
const WINDOW_AFTER_MINUTES = 180;

export function OperationsGantt({ operations, now }: Props) {
  const bounds = getBounds(toMinutes(now));
  const hours = getHourTicks(bounds);
  const nowLeft = toPercent(toMinutes(now), bounds);
  const visible = operations.filter((operation) => overlaps(operation, bounds));

  return (
    <Card className="flex min-w-0 flex-col gap-4 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Kicker tone="accent">VII · Операции</Kicker>
          <h2 className="font-heading font-semibold text-[22px]">
            Временная шкала
          </h2>
          <p className="text-[13px] text-muted">
            {toHourLabel(bounds.min)}–{toHourLabel(bounds.max)} · показано{" "}
            {visible.length} из {operations.length}
          </p>
        </div>
        <ul className="flex flex-wrap gap-4 text-[13px] text-neutral-800">
          {LEGEND.map((status) => (
            <li key={status} className="flex items-center gap-1.5">
              <span
                className={`h-2 w-4.5 rounded-xs border ${BAR_CLASS[status]}`}
              />
              {capitalize(STATUS_LABEL[status])}
            </li>
          ))}
        </ul>
      </div>

      {visible.length === 0 ? (
        <p className="font-heading text-[20px] text-muted">
          За горизонт прогноза (3 ч) операций нет
        </p>
      ) : (
        <div className="flex min-w-0 overflow-x-auto">
          <ul className="flex w-[250px] shrink-0 flex-col pt-6.5">
            {visible.map((operation) => (
              <li
                key={operation.id}
                className="flex h-9.5 flex-col justify-center border-line border-t pr-3"
              >
                <span className="truncate text-[14px]">{operation.title}</span>
                <span className="text-[11.5px] text-muted">
                  {timeRange(operation)} · {STATUS_LABEL[operation.status]}
                </span>
              </li>
            ))}
          </ul>

          <div className="relative mr-6 min-w-[560px] flex-1 pb-5.5">
            <div className="relative h-6.5 text-[11.5px] text-muted">
              {hours.map((hour) => (
                <span
                  key={hour}
                  className={`absolute top-1 ${tickAlign(hour, bounds)}`}
                  style={{ left: `${toPercent(hour, bounds)}%` }}
                >
                  {toHourLabel(hour)}
                </span>
              ))}
            </div>
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute top-6.5 bottom-0 w-px bg-line"
                style={{ left: `${toPercent(hour, bounds)}%` }}
              />
            ))}
            <div
              className="absolute top-1 bottom-5.5 z-10 w-px bg-accent"
              style={{ left: `${nowLeft}%` }}
            >
              <span className="-translate-x-1/2 absolute -bottom-5 left-1/2 whitespace-nowrap rounded-sm border border-accent bg-card px-1 text-[11px] text-accent-800">
                сейчас {now}
              </span>
            </div>
            {visible.map((operation) => (
              <div
                key={operation.id}
                className="relative h-9.5 border-line border-t"
              >
                <div
                  className={`absolute top-3 h-3.5 rounded-xs border ${BAR_CLASS[operation.status]}`}
                  style={barStyle(operation, bounds)}
                  title={operationTooltip(operation)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

// Шкала — целые часы окна вокруг момента отчёта.
function getBounds(now: number): Bounds {
  return {
    min: Math.floor((now - WINDOW_BEFORE_MINUTES) / 60) * 60,
    max: Math.ceil((now + WINDOW_AFTER_MINUTES) / 60) * 60,
  };
}

function overlaps(operation: Operation, { min, max }: Bounds) {
  const start = toMinutes(operation.plannedStart);
  return start <= max && toMinutes(endOf(operation)) >= min;
}

function getHourTicks({ min, max }: Bounds): number[] {
  const ticks: number[] = [];
  for (let hour = min; hour <= max; hour += 60) ticks.push(hour);
  return ticks;
}

// Крайние подписи не выходят за шкалу: первая — от линии, последняя — до неё.
function tickAlign(hour: number, { min, max }: Bounds) {
  if (hour === min) return "";
  if (hour === max) return "-translate-x-full";
  return "-translate-x-1/2";
}

function toPercent(minutes: number, { min, max }: Bounds): number {
  return ((minutes - min) / (max - min)) * 100;
}

// Брусок, начатый до окна или идущий за него, обрезаем по краю шкалы.
function barStyle(operation: Operation, bounds: Bounds) {
  const left = clamp(toPercent(toMinutes(operation.plannedStart), bounds));
  const right = clamp(toPercent(toMinutes(endOf(operation)), bounds));
  return { left: `${left}%`, width: `${Math.max(right - left, 0.9)}%` };
}

function endOf(operation: Operation) {
  return operation.actualEnd ?? operation.plannedEnd;
}

function timeRange(operation: Operation) {
  const { plannedStart, plannedEnd } = operation;
  return plannedStart === plannedEnd
    ? plannedStart
    : `${plannedStart}–${plannedEnd}`;
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

function clamp(percent: number) {
  return Math.min(100, Math.max(0, percent));
}

function toHourLabel(minutes: number): string {
  return `${String(Math.floor(minutes / 60) % 24).padStart(2, "0")}:00`;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
