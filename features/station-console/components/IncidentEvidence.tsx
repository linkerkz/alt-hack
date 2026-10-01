import Image from "next/image";
import type { StationConsoleData } from "../queries";

type Props = { incident: StationConsoleData["incident"] };

// Камера шлёт кадр 480×360: такие пропорции и держим.
const SNAPSHOT_WIDTH = 480;
const SNAPSHOT_HEIGHT = 360;

// Что видела камера: снимок в момент обнаружения, вывод ИИ и описание.
export function IncidentEvidence({ incident }: Props) {
  const { snapshot, analysis, fault } = incident;
  return (
    <>
      {snapshot != null && (
        <Image
          src={snapshot}
          alt="Снимок камеры в момент обнаружения"
          width={SNAPSHOT_WIDTH}
          height={SNAPSHOT_HEIGHT}
          unoptimized
          className="h-auto w-full rounded-[3px] border border-line"
        />
      )}
      {analysis != null && (
        <p className="border-accent border-l-2 pl-2.5 text-[13px]">
          <span className="text-accent-700">ИИ:</span> {analysis}
        </p>
      )}
      <p className="text-justify text-[13px] text-neutral-800">
        {fault.description}
      </p>
    </>
  );
}
