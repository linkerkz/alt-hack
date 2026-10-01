import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import type { StationConsoleData } from "../queries";
import type { Turn } from "../turn";
import type { ConsoleState, ConsoleViewer } from "../types";
import { ApprovalForm } from "./ApprovalForm";
import { CommandButton } from "./CommandButton";
import { OptionPicker } from "./OptionPicker";
import { TurnItems } from "./TurnItems";

type Props = {
  stationId: string;
  turn: Turn;
  viewer: ConsoleViewer;
  comparison: StationConsoleData["comparison"];
  state: ConsoleState;
};

const ROLE_LABEL: Record<ConsoleViewer, string> = {
  dsp: "ДСП",
  dscs: "ДСЦС",
  dnc: "ДНЦ",
  ds: "ДС",
};

// Чей ход: у хозяина хода — карточка с кнопками, единственное место
// с действиями на панели; у остальных — кого ждём, без кнопок.
export function TurnCard(props: Props) {
  const { stationId, turn, viewer } = props;
  if (turn.owner !== viewer) return <Waiting turn={turn} />;

  return (
    <Card
      emphasis="accent"
      elevation="md"
      className="flex flex-col gap-2.5 p-3.5"
    >
      <Kicker tone="accent">▲ Ваш ход · {ROLE_LABEL[viewer]}</Kicker>
      <h3 className="font-heading font-semibold text-[21px] leading-[1.15]">
        {turn.title}
      </h3>
      <p className="text-[13px] text-neutral-800">{turn.text}</p>
      {turn.form === "option" && (
        <OptionPicker comparison={props.comparison} state={props.state} />
      )}
      {turn.form === "approval" && <ApprovalForm stationId={stationId} />}
      {turn.items.length > 0 && (
        <TurnItems stationId={stationId} items={turn.items} />
      )}
      {turn.buttons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {turn.buttons.map((button, i) => (
            <CommandButton
              key={button.label}
              stationId={stationId}
              command={button.command}
              variant={i === 0 ? "primary" : "secondary"}
            >
              {button.label}
            </CommandButton>
          ))}
        </div>
      )}
    </Card>
  );
}

// Ход другого участника: что сейчас происходит и кого ждём.
function Waiting({ turn }: { turn: Turn }) {
  return (
    <section className="flex flex-col gap-1.5 rounded border border-line bg-surface p-3.5">
      <p className="flex items-center gap-2 text-[12.5px] text-accent-700">
        <span className="size-3.5 flex-none animate-spin rounded-full border-2 border-accent-300 border-t-accent-600" />
        {turn.waiting}
      </p>
      <p className="font-heading font-semibold text-[18px] leading-tight">
        {turn.title}
      </p>
      <p className="text-[13px] text-neutral-800">{turn.text}</p>
    </section>
  );
}
