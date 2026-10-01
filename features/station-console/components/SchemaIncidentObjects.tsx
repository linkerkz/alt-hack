import { TONE_COLOR } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";

type Props = { schema: StationConsoleData["schema"] };

// Стрелка С3 и входной светофор Н — объекты инцидента.
export function SchemaIncidentObjects({ schema }: Props) {
  const { switchC3, entrySignal } = schema;
  const c3Color =
    switchC3.status == null
      ? "var(--color-neutral-800)"
      : TONE_COLOR[switchC3.status];
  const signalColor =
    entrySignal == null ? "var(--color-neutral-500)" : TONE_COLOR[entrySignal];

  return (
    <g>
      <circle
        cx={170}
        cy={115}
        r={8}
        strokeWidth={2.5}
        style={{ stroke: c3Color }}
        className="fill-paper"
      />
      {switchC3.status != null && (
        <circle
          cx={170}
          cy={115}
          r={7}
          strokeWidth={2}
          style={{ stroke: c3Color }}
          className="origin-center animate-ping fill-none [transform-box:fill-box]"
        />
      )}
      <text
        x={170}
        y={98}
        fontSize={12}
        fontWeight={600}
        textAnchor="middle"
        style={{ fill: c3Color }}
      >
        {switchC3.label}
      </text>
      <path d="M40 170 V146" strokeWidth={1.5} className="stroke-neutral-800" />
      <circle
        cx={40}
        cy={140}
        r={6}
        style={{ fill: signalColor }}
        className="stroke-neutral-800"
      />
      <text x={52} y={144} fontSize={11} className="fill-neutral-800">
        Н
      </text>
    </g>
  );
}
