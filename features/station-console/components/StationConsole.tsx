import type { StationConsoleData } from "../queries";
import type { ConsoleRole, ConsoleState, Neighbors } from "../types";
import { ConsoleBar } from "./ConsoleBar";
import { EfficiencySummary } from "./EfficiencySummary";
import { IncidentBanner } from "./IncidentBanner";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { ReturnToServiceDialog } from "./ReturnToServiceDialog";
import { SidePanel } from "./SidePanel";
import { StationSchema } from "./StationSchema";
import { TrackPlan } from "./TrackPlan";

type Props = {
  role: ConsoleRole;
  operatorName: string;
  stationName: string;
  data: StationConsoleData;
  state: ConsoleState;
  neighbors: Neighbors;
  // Карта участка; null — роли карта недоступна.
  mapHref: string | null;
};

// Пульт станции: слева индекс, схема и план путей, справа — панель роли.
export function StationConsole(props: Props) {
  const { role, stationName, data, state, neighbors, mapHref } = props;
  const { incident, dsp } = data;
  // Баннер напоминает ДСЦС об инциденте, пока его карточка не видна.
  const showBanner =
    role === "dscs" &&
    incident.isActive &&
    (state.tab === "overview" || !state.panel);

  return (
    <>
      <ConsoleBar
        stationName={stationName}
        clock={data.clock}
        mapHref={mapHref}
      />
      {showBanner && (
        <IncidentBanner
          code={incident.code}
          title={incident.detection.title}
          suggestion={incident.suggestion}
          state={state}
        />
      )}
      <main className="flex flex-1 flex-wrap">
        <section className="flex min-w-0 flex-[999_1_620px] flex-col border-line border-r">
          <EfficiencySummary efficiency={data.efficiency} />
          <StationSchema
            schema={data.schema}
            incidentCode={incident.code}
            state={state}
            neighbors={neighbors}
          />
          <TrackPlan plan={data.plan} />
        </section>
        <SidePanel
          role={role}
          operatorName={props.operatorName}
          data={data}
          state={state}
          mapHref={mapHref}
        />
      </main>
      {role === "dsp" && dsp.confirmOpen && (
        <ReturnToServiceDialog
          stationId={data.stationId}
          state={state}
          workOrder={data.workOrder}
          crew={data.incident.detection.crew}
        />
      )}
      <LiveRefresh />
    </>
  );
}
