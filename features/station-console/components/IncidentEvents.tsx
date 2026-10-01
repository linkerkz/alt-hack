import type { ScenarioEvent } from "../types";

type Props = { events: ScenarioEvent[] };

// Хронология инцидента: свежие сверху.
export function IncidentEvents({ events }: Props) {
  return (
    <ul>
      {events.map((event) => (
        <li
          key={event.id}
          className="grid grid-cols-[44px_1fr] gap-2 border-line border-t py-1 text-[12.5px] first:border-t-0"
        >
          <span className="text-neutral-600">{event.time}</span>
          <span>{event.text}</span>
        </li>
      ))}
    </ul>
  );
}
