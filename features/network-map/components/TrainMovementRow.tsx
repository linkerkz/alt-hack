import { TRAIN_KIND_LABEL } from "../status";
import type { TrainMovement } from "../types";

type Props = {
  movement: TrainMovement;
  direction: "toUs" | "fromUs";
  neighborName: string;
};

// Строка поезда: к нам — когда прибудет, от нас — когда уйдёт и дойдёт до соседа.
export function TrainMovementRow({ movement, direction, neighborName }: Props) {
  const isToUs = direction === "toUs";

  return (
    <div className="flex items-center gap-3 px-3 py-1.5">
      <span
        className={`w-3 text-sm ${isToUs ? "text-sky-300" : "text-emerald-300"}`}
      >
        <span aria-hidden>{isToUs ? "↓" : "↑"}</span>
        <span className="sr-only">{isToUs ? "к нам" : "от нас"}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-zinc-100">
          № {movement.number}{" "}
          <span className="text-[11px] text-muted">
            {TRAIN_KIND_LABEL[movement.kind]}
            {movement.passesStation && " · проездом"}
          </span>
        </span>
        <span className="block truncate text-[11px] text-muted">
          {movement.originName} → {movement.destinationName}
        </span>
      </span>
      <span className="shrink-0 text-right text-[11px] tabular-nums leading-tight">
        {isToUs ? (
          <ToUsTimes movement={movement} neighborName={neighborName} />
        ) : (
          <FromUsTimes movement={movement} neighborName={neighborName} />
        )}
      </span>
    </div>
  );
}

type TimesProps = {
  movement: TrainMovement;
  neighborName: string;
};

function ToUsTimes({ movement, neighborName }: TimesProps) {
  return (
    <>
      <span className="block text-zinc-200">
        приб. {formatIn(movement.arrival)}
      </span>
      <span className="block text-muted">
        {movement.departure <= 0
          ? "в пути"
          : `из ${neighborName} ${formatIn(movement.departure)}`}
      </span>
    </>
  );
}

function FromUsTimes({ movement, neighborName }: TimesProps) {
  return (
    <>
      <span className="block text-zinc-200">
        {movement.departure <= 0
          ? `ушёл ${formatDuration(-movement.departure)} назад`
          : `отпр. ${formatIn(movement.departure)}`}
      </span>
      <span className="block text-muted">
        в {neighborName} {formatIn(movement.arrival)}
      </span>
    </>
  );
}

function formatIn(minutes: number) {
  return `через ${formatDuration(minutes)}`;
}

// 45 мин, 2 ч, 2 ч 59 м — коротко, чтобы строка не переносилась.
function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} м`;
}
