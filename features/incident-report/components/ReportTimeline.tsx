import { Heading } from "@/components/ui/Heading";
import type { ReportEvent } from "../types";

export function ReportTimeline({ events }: { events: ReportEvent[] }) {
  return (
    <section className="flex flex-col gap-1.5">
      <Heading>Хронология</Heading>
      <ol>
        {events.map((event) => (
          <li
            key={`${event.time} ${event.text}`}
            className="grid grid-cols-[44px_1fr] gap-2 border-line border-t py-1.5 text-[13px]"
          >
            <time className="text-neutral-600">{event.time}</time>
            <span>{event.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
