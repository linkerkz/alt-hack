import { TONE_GLYPH, TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import type { ConsoleState, ConsoleViewer } from "../types";
import { CollapsedPanel } from "./CollapsedPanel";
import { ConsoleTabs } from "./ConsoleTabs";
import { IncidentPanel } from "./IncidentPanel";
import { OverviewPanel } from "./OverviewPanel";

type Props = {
  role: ConsoleViewer;
  data: StationConsoleData;
  state: ConsoleState;
  reportHref: string;
};

// Правая панель пульта, одна для всех ролей: вкладки «Станция» и
// «Инцидент»; отличаются только кнопки в ходе. Свёрнутая — узкая полоса.
export function SidePanel({ role, data, state, reportHref }: Props) {
  const myTurn = data.incident.turn?.owner === role;
  if (!state.panel) {
    return <Collapsed data={data} state={state} myTurn={myTurn} />;
  }

  return (
    <aside className="sticky top-0 flex max-h-screen min-w-0 max-w-full flex-[1_1_380px] flex-col">
      <ConsoleTabs
        state={state}
        incidentCode={state.step > 0 ? data.incident.code : null}
        myTurn={myTurn}
      />
      <div className="flex flex-1 flex-col gap-[18px] overflow-auto px-5 pt-4 pb-[120px]">
        {state.tab === "incident" ? (
          <IncidentPanel
            data={data}
            state={state}
            viewer={role}
            reportHref={reportHref}
          />
        ) : (
          <OverviewPanel data={data} state={state} viewer={role} />
        )}
      </div>
    </aside>
  );
}

type CollapsedProps = Omit<Props, "role" | "reportHref"> & {
  myTurn: boolean;
};

function Collapsed({ data, state, myTurn }: CollapsedProps) {
  const { incident } = data;
  return (
    <CollapsedPanel
      state={state}
      label={state.tab === "incident" ? `Инцидент ${incident.code}` : "Станция"}
      marker={
        myTurn ? (
          <span className="text-[12px] text-accent-700" title="Ваш ход">
            ▲ ход
          </span>
        ) : (
          incident.isActive && (
            <span
              className={`text-[12px] ${TONE_TEXT_CLASS[incident.tone]}`}
              title="Активный инцидент"
            >
              {TONE_GLYPH[incident.tone]}
            </span>
          )
        )
      }
    />
  );
}
