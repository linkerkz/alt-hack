import { Disclosure } from "@/components/ui/Disclosure";
import type { StationConsoleData } from "../queries";
import type { ConsoleState, ConsoleViewer } from "../types";
import { IncidentEvents } from "./IncidentEvents";
import { IncidentEvidence } from "./IncidentEvidence";
import { IncidentHeader } from "./IncidentHeader";
import { IncidentImpact } from "./IncidentImpact";
import { IncidentProgress } from "./IncidentProgress";
import { OptionComparison } from "./OptionComparison";
import { Participants } from "./Participants";
import { TurnCard } from "./TurnCard";
import { WorkOrderCard } from "./WorkOrderCard";

type Props = {
  data: StationConsoleData;
  state: ConsoleState;
  viewer: ConsoleViewer;
};

// Карточка инцидента сверху вниз: что случилось, на каком этапе, чей ход —
// и подробности, раскрыт тот раздел, что нужен для хода сейчас.
export function IncidentPanel({ data, state, viewer }: Props) {
  const { incident, comparison, workOrder } = data;
  const { sections, turn } = incident;

  return (
    <div className="flex flex-col gap-4">
      <IncidentHeader incident={incident} />
      <IncidentProgress progress={incident.progress} />
      {turn == null ? (
        <p className="border-line border-y py-3 text-[14px] text-muted">
          Инцидент закрыт. Отчёт сформирован автоматически.
        </p>
      ) : (
        <TurnCard
          stationId={data.stationId}
          turn={turn}
          viewer={viewer}
          comparison={comparison}
          state={state}
        />
      )}
      <div className="border-line border-b">
        <Disclosure title="Снимок камеры и ИИ" open={sections.evidence.open}>
          <IncidentEvidence incident={incident} />
        </Disclosure>
        {sections.options != null && (
          <Disclosure title="Влияние и варианты" open={sections.options.open}>
            <IncidentImpact />
            <OptionComparison comparison={comparison} state={state} />
          </Disclosure>
        )}
        {sections.participants != null && (
          <Disclosure
            title="Участники"
            meta={String(incident.participants.length)}
            open={sections.participants.open}
          >
            <Participants participants={incident.participants} />
            {workOrder != null && <WorkOrderCard workOrder={workOrder} />}
          </Disclosure>
        )}
        <Disclosure title="Хронология" meta={String(incident.events.length)}>
          <IncidentEvents events={incident.events} />
        </Disclosure>
      </div>
    </div>
  );
}
