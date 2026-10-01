import type { StationConsoleData } from "../queries";
import type { ConsoleState, Neighbors } from "../types";
import { CollapsedPanel } from "./CollapsedPanel";
import { ConsoleBar } from "./ConsoleBar";
import { ConsoleTabs } from "./ConsoleTabs";
import { DemoBar } from "./DemoBar";
import { EfficiencySummary } from "./EfficiencySummary";
import { IncidentBanner } from "./IncidentBanner";
import { IncidentPanel } from "./IncidentPanel";
import { OverviewPanel } from "./OverviewPanel";
import { StationSchema } from "./StationSchema";
import { TrackPlan } from "./TrackPlan";

type Props = {
  stationName: string;
  data: StationConsoleData;
  state: ConsoleState;
  neighbors: Neighbors;
  // Карта участка; null — роли карта недоступна.
  mapHref: string | null;
};

// Пульт станции ДСЦС: слева индекс, схема и план путей, справа — обзор
// или карточка инцидента.
export function StationConsole({
  stationName,
  data,
  state,
  neighbors,
  mapHref,
}: Props) {
  const { incident } = data;
  // Баннер напоминает об инциденте, пока его карточка не видна.
  const showBanner =
    incident.isActive && (state.tab === "overview" || !state.panel);

  return (
    <>
      <ConsoleBar
        stationName={stationName}
        clock={data.clock}
        mapHref={mapHref}
      />
      {showBanner && (
        <IncidentBanner suggestion={incident.suggestion} state={state} />
      )}
      <main className="flex flex-1 flex-wrap">
        <section className="flex min-w-0 flex-[999_1_620px] flex-col border-line border-r">
          <EfficiencySummary efficiency={data.efficiency} />
          <StationSchema
            schema={data.schema}
            state={state}
            neighbors={neighbors}
          />
          <TrackPlan plan={data.plan} />
        </section>
        {state.panel ? (
          <aside className="sticky top-0 flex max-h-screen min-w-0 max-w-full flex-[1_1_380px] flex-col">
            <ConsoleTabs state={state} hasIncident={state.step > 0} />
            <div className="flex flex-1 flex-col gap-[18px] overflow-auto px-5 pt-4 pb-[120px]">
              {state.tab === "incident" ? (
                <IncidentPanel data={data} state={state} mapHref={mapHref} />
              ) : (
                <OverviewPanel incident={incident} state={state} />
              )}
            </div>
          </aside>
        ) : (
          <CollapsedPanel state={state} hasActiveIncident={incident.isActive} />
        )}
      </main>
      <DemoBar state={state} stepName={data.stepName} />
    </>
  );
}
