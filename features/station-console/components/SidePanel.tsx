import { TONE_GLYPH, TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import type { ConsoleRole, ConsoleState } from "../types";
import { CollapsedPanel } from "./CollapsedPanel";
import { ConsoleTabs } from "./ConsoleTabs";
import { DspPanel } from "./DspPanel";
import { IncidentPanel } from "./IncidentPanel";
import { OverviewPanel } from "./OverviewPanel";

type Props = {
  role: ConsoleRole;
  operatorName: string;
  data: StationConsoleData;
  state: ConsoleState;
  mapHref: string | null;
};

// Правая панель пульта: у ДСЦС обзор и инцидент, у ДСП — панель исполнения.
// Свёрнутая превращается в узкую полосу.
export function SidePanel({ role, operatorName, data, state, mapHref }: Props) {
  if (!state.panel) return <Collapsed role={role} data={data} state={state} />;

  return (
    <aside className="sticky top-0 flex max-h-screen min-w-0 max-w-full flex-[1_1_380px] flex-col">
      {role === "dsp" ? (
        <DspPanel operatorName={operatorName} data={data} state={state} />
      ) : (
        <>
          <ConsoleTabs
            state={state}
            incidentCode={state.step > 0 ? data.incident.code : null}
          />
          <div className="flex flex-1 flex-col gap-[18px] overflow-auto px-5 pt-4 pb-[120px]">
            {state.tab === "incident" ? (
              <IncidentPanel data={data} state={state} mapHref={mapHref} />
            ) : (
              <OverviewPanel incident={data.incident} state={state} />
            )}
          </div>
        </>
      )}
    </aside>
  );
}

type CollapsedProps = Pick<Props, "role" | "data" | "state">;

function Collapsed({ role, data, state }: CollapsedProps) {
  if (role === "dsp") {
    const { pendingCount } = data.dsp;
    return (
      <CollapsedPanel
        state={state}
        label="Панель ДСП"
        marker={
          pendingCount > 0 && (
            <span
              className="text-[12px] text-accent-700"
              title="Есть новые задачи"
            >
              ▲ {pendingCount}
            </span>
          )
        }
      />
    );
  }
  return (
    <CollapsedPanel
      state={state}
      label={
        state.tab === "incident" ? `Инцидент ${data.incident.code}` : "Обзор"
      }
      marker={
        data.incident.isActive && (
          <span
            className={`text-[12px] ${TONE_TEXT_CLASS[data.incident.tone]}`}
            title="Активный инцидент"
          >
            {TONE_GLYPH[data.incident.tone]}
          </span>
        )
      }
    />
  );
}
