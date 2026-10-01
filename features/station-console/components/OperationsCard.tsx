import { Kicker } from "@/components/ui/Kicker";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import { CommandButton } from "./CommandButton";

type Props = {
  stationId: string;
  operations: StationConsoleData["pager"]["operations"];
  // Поручать бригаде может только ДСП; остальные видят статус.
  canAssign: boolean;
};

// Ближайшие операции по плану путей: что бригаде сделать к прибытию или
// отправлению. ДСП поручает одной кнопкой — поручение уходит на пейджер, —
// а поезду на пути даёт отправление: маршрут задан, машинист уведомлён.
export function OperationsCard({ stationId, operations, canAssign }: Props) {
  return (
    <section className="flex flex-col gap-1">
      <Kicker className="mb-1">Ближайшие операции</Kicker>
      {operations.length === 0 ? (
        <p className="border-line border-t py-1.5 text-[13px] text-muted">
          До конца плана операций нет.
        </p>
      ) : (
        <ul>
          {operations.map((operation) => (
            <li
              key={operation.id}
              className="grid grid-cols-[44px_minmax(0,1fr)] gap-x-2 gap-y-1.5 border-line border-t py-2 text-[13px]"
            >
              <span className="font-heading text-[16px] leading-tight">
                {operation.time}
              </span>
              <div className="flex flex-col items-start gap-1.5">
                <span>{operation.text}</span>
                <OperationState
                  stationId={stationId}
                  operation={operation}
                  canAssign={canAssign}
                />
                {operation.departure != null && (
                  <DepartureState
                    stationId={stationId}
                    departure={operation.departure}
                    canDepart={canAssign}
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type StateProps = Omit<Props, "operations"> & {
  operation: Props["operations"][number];
};

// Поручено — статус ответа бригады; нет — кнопка у ДСП. Выполненную
// операцию можно поручить снова: бригада могла уйти раньше времени.
function OperationState({ stationId, operation, canAssign }: StateProps) {
  const { status } = operation;
  const waiting = status != null && status.tone !== "normal";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status != null && (
        <span className={`text-[12px] ${TONE_TEXT_CLASS[status.tone]}`}>
          <StatusGlyph tone={status.tone} /> {status.label}
        </span>
      )}
      {canAssign && !waiting && (
        <CommandButton
          stationId={stationId}
          command={operation.command}
          size="sm"
          variant={status == null ? "secondary" : "ghost"}
        >
          {status == null ? "Поручить бригаде" : "Поручить снова"}
        </CommandButton>
      )}
    </div>
  );
}

type DepartureProps = {
  stationId: string;
  departure: NonNullable<Props["operations"][number]["departure"]>;
  // Отправление даёт ДСП — та же роль, что поручает бригаде.
  canDepart: boolean;
};

// Отправление дано — статус для всех; поезд на пути и состав готов —
// кнопка у ДСП. Пока поезд не прибыл, задачи ДСП ещё нет.
function DepartureState({ stationId, departure, canDepart }: DepartureProps) {
  if (departure.state === "given") {
    return (
      <span className={`text-[12px] ${TONE_TEXT_CLASS.normal}`}>
        <StatusGlyph tone="normal" /> Отправление дано, маршрут{" "}
        {departure.route} задан, машинист уведомлён
      </span>
    );
  }
  if (departure.state === "early" || !canDepart) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <CommandButton
        stationId={stationId}
        command={departure.command}
        size="sm"
        variant="secondary"
      >
        Дать отправление
      </CommandButton>
      <span className="text-[12px] text-muted">маршрут {departure.route}</span>
    </div>
  );
}
