import { TONE_GLYPH, TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import type { ConsoleViewer } from "../types";
import { CollapsedPanel } from "./CollapsedPanel";
import { ConsoleTabs } from "./ConsoleTabs";
import { ExpandedPanel } from "./ExpandedPanel";
import { IncidentPanel } from "./IncidentPanel";
import { OverviewPanel } from "./OverviewPanel";

type Props = {
  role: ConsoleViewer;
  data: StationConsoleData;
  // Инцидент открыт: есть его вкладка.
  hasIncident: boolean;
};

// Правая панель пульта, одна для всех ролей: вкладки «Станция» и
// «Инцидент»; отличаются только кнопки в ходе. Свёрнутая — узкая полоса.
// Сервер готовит обе вкладки и полосу, какую показать — решает вид в URL.
export function SidePanel({ role, data, hasIncident }: Props) {
  const { incident } = data;
  const myTurn = incident.turn?.owner === role;

  return (
    <>
      <CollapsedPanel
        labels={{ overview: "Станция", incident: `Инцидент ${incident.code}` }}
        marker={<Marker data={data} myTurn={myTurn} />}
      />
      <ExpandedPanel
        tabs={
          <ConsoleTabs
            incidentCode={hasIncident ? incident.code : null}
            myTurn={myTurn}
          />
        }
        overview={<OverviewPanel data={data} viewer={role} />}
        incident={hasIncident && <IncidentPanel data={data} viewer={role} />}
      />
    </>
  );
}

type MarkerProps = { data: StationConsoleData; myTurn: boolean };

// Значок на свёрнутой полосе: ход за вами или активный инцидент.
function Marker({ data, myTurn }: MarkerProps) {
  const { incident } = data;
  if (myTurn) {
    return (
      <span className="text-[12px] text-accent-700" title="Ваш ход">
        ▲ ход
      </span>
    );
  }
  if (!incident.isActive) return null;
  return (
    <span
      className={`text-[12px] ${TONE_TEXT_CLASS[incident.tone]}`}
      title="Активный инцидент"
    >
      {TONE_GLYPH[incident.tone]}
    </span>
  );
}
