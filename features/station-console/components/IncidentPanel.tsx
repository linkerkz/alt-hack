import type { StationConsoleData } from "../queries";
import type { ConsoleState } from "../types";
import { ActionCard } from "./ActionCard";
import { DecisionChain } from "./DecisionChain";
import { IncidentEvents } from "./IncidentEvents";
import { IncidentImpact } from "./IncidentImpact";
import { IncidentSummary } from "./IncidentSummary";
import { OptionComparison } from "./OptionComparison";
import { TaskList } from "./TaskList";

type Props = {
  data: StationConsoleData;
  state: ConsoleState;
  mapHref: string | null;
};

// Карточка инцидента: суть, текущий шаг, влияние, варианты и ход решения.
export function IncidentPanel({ data, state, mapHref }: Props) {
  const { incident, comparison, chain } = data;

  return (
    <div className="flex flex-col gap-[18px]">
      <IncidentSummary incident={incident} />
      <ActionCard
        action={incident.action}
        statusName={incident.statusName}
        state={state}
        mapHref={mapHref}
      />
      <IncidentImpact />
      <OptionComparison comparison={comparison} state={state} />
      {chain.length > 0 && <DecisionChain chain={chain} />}
      {incident.tasks.length > 0 && <TaskList tasks={incident.tasks} />}
      <IncidentEvents events={incident.events} />
    </div>
  );
}
