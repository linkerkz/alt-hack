import { Kicker } from "@/components/ui/Kicker";
import { TONE_GLYPH, TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { ScenarioEvent } from "../types";

type Props = { events: ScenarioEvent[] };

// Лента событий станции: свежие сверху, значок — уровень события.
export function EventFeed({ events }: Props) {
  return (
    <section className="flex flex-col gap-1">
      <Kicker className="mb-1">Лента событий</Kicker>
      <ul>
        {events.map((event) => (
          <li
            key={event.id}
            className="grid grid-cols-[14px_44px_1fr] gap-1.5 border-line border-t py-1.5 text-[12.5px]"
          >
            <span
              aria-hidden
              className={`text-[10px] leading-[19px] ${event.level == null ? "text-neutral-500" : TONE_TEXT_CLASS[event.level]}`}
            >
              {event.level == null ? "·" : TONE_GLYPH[event.level]}
            </span>
            <span className="text-neutral-600">{event.time}</span>
            <span>{event.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
