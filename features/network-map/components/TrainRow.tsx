import { TRAIN_KIND_LABEL } from "../status";
import type { StationTrain } from "../types";

// Строка поезда: слева номер и путь через станцию, справа — когда он у нас.
export function TrainRow({ train }: { train: StationTrain }) {
  const [primary, secondary] = timesOf(train);

  return (
    <div className="flex items-start gap-3 px-3 py-1.5">
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-zinc-100">
          № {train.number}{" "}
          <span className="text-[11px] text-muted">
            {TRAIN_KIND_LABEL[train.kind]}
          </span>
        </span>
        <span className="block truncate text-[12px] text-sky-300">
          {pathOf(train)}
        </span>
        <span className="block truncate text-[11px] text-muted">
          {train.originName} — {train.destinationName}
        </span>
      </span>
      <span className="shrink-0 text-right text-[11px] tabular-nums leading-tight">
        <span className="block text-zinc-200">{primary}</span>
        <span className="block text-muted">{secondary}</span>
      </span>
    </div>
  );
}

// «из Шу → в Отар»: только движения за горизонт, как на стрелках участков.
function pathOf({ fromName, toName }: StationTrain) {
  const parts = [
    fromName == null ? null : `из ${fromName}`,
    toName == null ? null : `в ${toName}`,
  ];
  return parts.filter((part) => part != null).join(" → ");
}

function timesOf(train: StationTrain): [string, string] {
  const { arrival, departure, nextArrival, toName } = train;
  const next =
    toName == null || nextArrival == null
      ? ""
      : `в ${toName} ${formatIn(nextArrival)}`;

  switch (train.flow) {
    case "arriving":
      return [
        `приб. ${formatIn(arrival)}`,
        train.isTerminal ? "конечная" : `отпр. ${formatIn(departure)}`,
      ];
    case "passing":
      return [
        arrival > 0
          ? `проследует ${formatIn(arrival)}`
          : `проследовал ${formatAgo(arrival)}`,
        next,
      ];
    case "departing":
      return [
        departure > 0
          ? `отпр. ${formatIn(departure)}`
          : `ушёл ${formatAgo(departure)}`,
        next,
      ];
  }
}

function formatIn(minutes: number) {
  return `через ${formatDuration(minutes)}`;
}

function formatAgo(minutes: number) {
  return `${formatDuration(-minutes)} назад`;
}

// 45 мин, 2 ч, 2 ч 59 м — коротко, чтобы строка не переносилась.
function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} ч` : `${hours} ч ${rest} м`;
}
