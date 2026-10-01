import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";

type Props = { participants: StationConsoleData["incident"]["participants"] };

// Участники инцидента и что с их частью работы.
export function Participants({ participants }: Props) {
  return (
    <ul>
      {participants.map((participant) => (
        <li
          key={`${participant.who}-${participant.what}`}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2.5 border-line border-t py-[7px] text-[13px] first:border-t-0"
        >
          <span className="flex flex-col">
            <span>{participant.who}</span>
            <span className="text-[11.5px] text-neutral-600">
              {participant.what}
            </span>
          </span>
          <span className={`text-[12px] ${TONE_TEXT_CLASS[participant.tone]}`}>
            <StatusGlyph tone={participant.tone} /> {participant.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
