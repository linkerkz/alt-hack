import { LiveRefresh } from "@/components/ui/LiveRefresh";
import type { StationConsoleData } from "../queries";
import type { ConsoleState, ConsoleViewer, Neighbors } from "../types";
import { EfficiencySummary } from "./EfficiencySummary";
import { IncidentBanner } from "./IncidentBanner";
import { SidePanel } from "./SidePanel";
import { StationSchema } from "./StationSchema";
import { TrackPlan } from "./TrackPlan";

type Props = {
  role: ConsoleViewer;
  stationName: string;
  data: StationConsoleData;
  state: ConsoleState;
  neighbors: Neighbors;
};

// Пульт станции: слева станция с индексом, схема и план путей, справа —
// панель с инцидентом, одна для всех ролей.
export function StationConsole(props: Props) {
  const { role, stationName, data, state, neighbors } = props;
  const { incident } = data;
  // Баннер напоминает об инциденте, пока его карточка не видна.
  const showBanner =
    incident.isActive && (state.tab === "overview" || !state.panel);

  return (
    <>
      {showBanner && (
        <IncidentBanner
          code={incident.code}
          title={incident.fault.title}
          suggestion={incident.suggestion}
          tone={incident.tone}
          state={state}
        />
      )}
      <main className="flex flex-1 flex-wrap">
        <section className="flex min-w-0 flex-[999_1_620px] flex-col border-line border-r">
          <EfficiencySummary
            stationName={stationName}
            efficiency={data.efficiency}
          />
          <StationSchema
            schema={data.schema}
            incidentCode={incident.code}
            state={state}
            neighbors={neighbors}
          />
          <TrackPlan plan={data.plan} clock={data.clock} />
        </section>
        <SidePanel role={role} data={data} state={state} />
      </main>
      <LiveRefresh />
    </>
  );
}
