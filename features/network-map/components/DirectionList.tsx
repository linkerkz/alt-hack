import { HORIZON_MINUTES } from "../flows";
import type { Direction, TrainMovement } from "../types";
import { TrainMovementRow } from "./TrainMovementRow";

// Поезда станции по направлениям: те же движения, что на стрелках участков,
// поэтому число у соседа совпадает со стрелкой на карте.
export function DirectionList({ directions }: { directions: Direction[] }) {
  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-[11px] text-muted uppercase tracking-widest">
        Поезда по направлениям · в пути и за {HORIZON_MINUTES / 60} ч
      </h3>
      {directions.map((direction) => (
        <DirectionGroup key={direction.neighborId} direction={direction} />
      ))}
    </section>
  );
}

function DirectionGroup({ direction }: { direction: Direction }) {
  const { neighborName, toUs, fromUs } = direction;

  return (
    <div className="rounded border border-line">
      <header className="flex items-baseline justify-between gap-3 border-line border-b bg-surface-0/60 px-3 py-2">
        <span className="font-medium text-sm text-white">{neighborName}</span>
        <span className="font-mono text-xs tabular-nums">
          <Count label="к нам" value={toUs.length} />
          <span className="text-zinc-600"> · </span>
          <Count label="от нас" value={fromUs.length} />
        </span>
      </header>
      {toUs.length + fromUs.length === 0 ? (
        <p className="px-3 py-2 text-muted text-xs">Поездов нет</p>
      ) : (
        <ul className="divide-y divide-line">
          <MovementItems
            movements={toUs}
            direction="toUs"
            neighborName={neighborName}
          />
          <MovementItems
            movements={fromUs}
            direction="fromUs"
            neighborName={neighborName}
          />
        </ul>
      )}
    </div>
  );
}

type ItemsProps = {
  movements: TrainMovement[];
  direction: "toUs" | "fromUs";
  neighborName: string;
};

function MovementItems({ movements, direction, neighborName }: ItemsProps) {
  return movements.map((movement) => (
    <li key={`${direction}-${movement.trainId}`}>
      <TrainMovementRow
        movement={movement}
        direction={direction}
        neighborName={neighborName}
      />
    </li>
  ));
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <span className={value === 0 ? "text-zinc-600" : "text-sky-300"}>
      {label} {value}
    </span>
  );
}
