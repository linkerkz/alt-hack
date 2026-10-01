import { Kicker } from "@/components/ui/Kicker";
import type { ScenarioEvent } from "../types";

type Props = { events: ScenarioEvent[] };

// Свежие события инцидента видны сразу, остальные — по раскрытию.
const VISIBLE_COUNT = 2;

// Хронология инцидента: свежие сверху.
export function IncidentEvents({ events }: Props) {
  const visible = events.slice(0, VISIBLE_COUNT);
  const hidden = events.slice(VISIBLE_COUNT);

  return (
    <section className="flex flex-col gap-1.5">
      <Kicker>Хронология инцидента</Kicker>
      <EventRows events={visible} />
      {hidden.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none text-[12px] text-accent-700 hover:text-accent-600">
            <span className="group-open:hidden">Все {events.length}</span>
            <span className="hidden group-open:inline">Свернуть</span>
          </summary>
          <EventRows events={hidden} />
        </details>
      )}
    </section>
  );
}

function EventRows({ events }: Props) {
  return (
    <ul>
      {events.map((event) => (
        <li
          key={event.id}
          className="grid grid-cols-[44px_1fr] gap-2 border-line border-t py-1 text-[12.5px]"
        >
          <span className="text-neutral-600">{event.time}</span>
          <span>{event.text}</span>
        </li>
      ))}
    </ul>
  );
}
