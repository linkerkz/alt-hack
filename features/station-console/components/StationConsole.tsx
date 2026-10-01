import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { STEP } from "../mock";
import type { StationConsoleData } from "../queries";
import { isFocusStep } from "../schema";
import type { ConsoleState, ConsoleViewer, Neighbors } from "../types";
import { BannerGate } from "./BannerGate";
import { ConsoleViewProvider } from "./ConsoleView";
import { EfficiencySummary } from "./EfficiencySummary";
import { FocusScope } from "./FocusScope";
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
  const hasIncident = state.step !== STEP.normal;

  return (
    <ConsoleViewProvider
      hasIncident={hasIncident}
      focusStep={isFocusStep(state.step)}
    >
      {incident.isActive && (
        <BannerGate>
          <IncidentBanner
            code={incident.code}
            detectedAt={incident.detectedAt}
            title={incident.fault.title}
            suggestion={incident.suggestion}
            tone={incident.tone}
          />
        </BannerGate>
      )}
      <main className="flex flex-1 flex-wrap">
        <FocusScope className="flex min-w-0 flex-[999_1_620px] flex-col border-line border-r">
          <EfficiencySummary
            stationName={stationName}
            efficiency={data.efficiency}
          />
          <StationSchema
            schema={data.schema}
            incidentCode={incident.code}
            neighbors={neighbors}
          />
          <TrackPlan plan={data.plan} clock={data.clock} />
        </FocusScope>
        <SidePanel role={role} data={data} hasIncident={hasIncident} />
      </main>
      <LiveRefresh />
    </ConsoleViewProvider>
  );
}
