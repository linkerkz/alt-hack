import { HORIZON_MINUTES } from "../flows";
import { FLOW_LABEL, FLOW_ORDER } from "../status";
import type { StationTrain, TrainFlow } from "../types";
import { TrainRow } from "./TrainRow";

// Поезда станции по категориям — те же, что в счётчиках над списком.
// «из X» и «в X» в строках — движения, которые считают стрелки участков.
export function StationTrainList({ trains }: { trains: StationTrain[] }) {
  return (
    <section className="space-y-3">
      <h3 className="font-semibold text-[11px] text-muted uppercase tracking-widest">
        Поезда · в пути или выйдут за {HORIZON_MINUTES / 60} ч
      </h3>
      {trains.length === 0 ? (
        <p className="text-muted text-xs">Поездов нет</p>
      ) : (
        FLOW_ORDER.map((flow) => (
          <FlowGroup
            key={flow}
            flow={flow}
            trains={trains.filter((train) => train.flow === flow)}
          />
        ))
      )}
    </section>
  );
}

function FlowGroup({
  flow,
  trains,
}: {
  flow: TrainFlow;
  trains: StationTrain[];
}) {
  if (trains.length === 0) return null;
  const { icon, label, hint } = FLOW_LABEL[flow];

  return (
    <div className="rounded border border-line">
      <header className="flex items-baseline justify-between gap-3 border-line border-b bg-surface-0/60 px-3 py-2">
        <span className="font-medium text-sm text-white">
          {icon} {label}{" "}
          <span className="font-normal text-[11px] text-muted">{hint}</span>
        </span>
        <span className="font-mono text-sky-300 text-xs tabular-nums">
          {trains.length}
        </span>
      </header>
      <ul className="divide-y divide-line">
        {trains.map((train) => (
          <li key={train.trainId}>
            <TrainRow train={train} />
          </li>
        ))}
      </ul>
    </div>
  );
}
