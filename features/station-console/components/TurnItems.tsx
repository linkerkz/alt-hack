import type { TurnItem } from "../turn";
import { CommandButton } from "./CommandButton";

type Props = { stationId: string; items: TurnItem[] };

// Задачи хода по отдельности: невыполненная — с кнопкой, выполненная — с итогом.
export function TurnItems({ stationId, items }: Props) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.text}
          className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-line border-t py-2 text-[13.5px]"
        >
          {item.result == null ? (
            <span>{item.text}</span>
          ) : (
            <span className="flex flex-col">
              <span className="text-normal">● {item.text}</span>
              <span className="text-[12px] text-muted">{item.result}</span>
            </span>
          )}
          {item.action != null && (
            <CommandButton
              stationId={stationId}
              command={item.action.command}
              variant="primary"
            >
              {item.action.label}
            </CommandButton>
          )}
        </li>
      ))}
    </ul>
  );
}
