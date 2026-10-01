import { HORIZON_MINUTES } from "../flows";
import { TRAIN_EVENT_LABEL, TRAIN_KIND_LABEL } from "../status";
import type { TrainEvent, TrainEventType } from "../types";

const EVENT_CLASS: Record<TrainEventType, string> = {
  arrival: "text-sky-300",
  departure: "text-emerald-300",
  stop: "text-sky-300",
  passing: "text-zinc-400",
};

export function TrainEventList({ events }: { events: TrainEvent[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-[11px] text-muted uppercase tracking-widest">
        Ближайшие поезда · {HORIZON_MINUTES / 60} ч
      </h3>
      {events.length === 0 ? (
        <p className="text-muted text-xs">Поездов в ближайшие часы нет</p>
      ) : (
        <ul className="space-y-1">
          {events.map((event) => (
            <li
              key={`${event.trainId}-${event.minutes}`}
              className="flex items-center gap-3 rounded bg-surface-0/60 px-2.5 py-1.5"
            >
              <span className="w-14 shrink-0 font-mono text-xs text-zinc-300">
                {formatIn(event.minutes)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-zinc-100">
                  № {event.number}{" "}
                  <span className="text-[11px] text-muted">
                    {TRAIN_KIND_LABEL[event.kind]}
                  </span>
                </span>
                <span className="block truncate text-[11px] text-muted">
                  {event.originName} → {event.destinationName}
                </span>
              </span>
              <span className={`text-right text-xs ${EVENT_CLASS[event.type]}`}>
                {TRAIN_EVENT_LABEL[event.type]}
                {event.departureMinutes != null && (
                  <span className="block text-[11px] text-muted">
                    отпр. через {formatIn(event.departureMinutes)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatIn(minutes: number) {
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest}`;
}
