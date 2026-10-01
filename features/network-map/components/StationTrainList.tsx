import { Kicker } from "@/components/ui/Kicker";
import { HORIZON_MINUTES } from "../flows";
import { FLOW_LABEL, FLOW_ORDER } from "../status";
import type { StationTrain, TrainFlow } from "../types";
import { TrainRow } from "./TrainRow";

// Поезда станции по категориям — те же, что в счётчиках над списком.
// «из X» и «в X» в строках — движения, которые считают стрелки участков.
export function StationTrainList({ trains }: { trains: StationTrain[] }) {
  return (
    <section className="space-y-3">
      <Kicker>Поезда · в пути или выйдут за {HORIZON_MINUTES / 60} ч</Kicker>
      {trains.length === 0 ? (
        <p className="text-[13px] text-muted">Поездов нет</p>
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
    <div>
      <header className="flex items-baseline justify-between gap-3 border-line border-b pb-1">
        <span className="font-heading font-semibold text-[17px]">
          {icon} {label}{" "}
          <span className="font-normal font-sans text-[11px] text-muted">
            {hint}
          </span>
        </span>
        <span className="font-heading text-[17px] text-accent-700">
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
