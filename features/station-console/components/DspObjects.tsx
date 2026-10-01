import { Kicker } from "@/components/ui/Kicker";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";

type Props = { objects: StationConsoleData["dsp"]["objects"] };

// Объекты и маршруты ДСП с их состоянием.
export function DspObjects({ objects }: Props) {
  return (
    <section className="flex flex-col gap-1">
      <Kicker className="mb-1">Объекты и маршруты</Kicker>
      <ul>
        {objects.map((object) => (
          <li
            key={object.name}
            className="flex justify-between gap-2.5 border-line border-t py-1.5 text-[13px]"
          >
            <span>{object.name}</span>
            <span className={TONE_TEXT_CLASS[object.tone]}>
              <StatusGlyph tone={object.tone} /> {object.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
