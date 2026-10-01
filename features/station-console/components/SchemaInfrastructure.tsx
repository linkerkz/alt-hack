import type { Neighbors } from "../types";

type Props = { neighbors: Neighbors };

// Неизменная часть схемы 1000×360: платформа, съезды, стрелки, подписи путей.
export function SchemaInfrastructure({ neighbors }: Props) {
  return (
    <g>
      <rect
        x={330}
        y={129}
        width={340}
        height={28}
        className="fill-surface stroke-neutral-400"
      />
      <text
        x={500}
        y={147}
        fontSize={12}
        textAnchor="middle"
        className="fill-muted"
      >
        Платформа (пути 1 и 3)
      </text>
      <text x={4} y={16} fontSize={12} className="fill-muted">
        ← нечётная горловина · от ст. {neighbors.odd}
      </text>
      <text
        x={996}
        y={16}
        fontSize={12}
        textAnchor="end"
        className="fill-muted"
      >
        чётная горловина · к ст. {neighbors.even} →
      </text>
      <text
        x={515}
        y={352}
        fontSize={11}
        textAnchor="end"
        className="fill-neutral-600"
      >
        тупик манёврового
      </text>
      <path d="M520 325 V345" strokeWidth={4} className="stroke-neutral-800" />
      {LINKS.map((d) => (
        <path
          key={d}
          d={d}
          strokeWidth={4}
          className="fill-none stroke-neutral-500"
        />
      ))}
      {TRACK_LABELS.map(([label, x, y]) => (
        <text
          key={label}
          x={x}
          y={y}
          fontSize={13}
          className="fill-neutral-800"
        >
          {label}
        </text>
      ))}
      {SWITCHES.map(([id, x, y]) => (
        <g key={id}>
          <circle
            cx={x}
            cy={y}
            r={4}
            strokeWidth={1.5}
            className="fill-paper stroke-neutral-800"
          />
          <text
            x={x}
            y={y + 18}
            fontSize={10}
            textAnchor="middle"
            className="fill-neutral-600"
          >
            {id}
          </text>
        </g>
      ))}
      <path
        d="M960 230 V254"
        strokeWidth={1.5}
        className="stroke-neutral-800"
      />
      <circle
        cx={960}
        cy={260}
        r={6}
        className="fill-neutral-500 stroke-neutral-800"
      />
      <text x={938} y={264} fontSize={11} className="fill-neutral-800">
        Ч
      </text>
    </g>
  );
}

// Съезды между путями, кроме двух через С3 — их состояние меняется.
const LINKS = [
  "M110 230 L165 285",
  "M250 170 L300 230",
  "M855 115 L910 170",
  "M775 60 L830 115",
  "M835 285 L890 230",
  "M800 285 L750 335",
];

const TRACK_LABELS: [string, number, number][] = [
  ["5", 728, 52],
  ["3", 728, 107],
  ["1 гл.", 728, 162],
  ["2 гл.", 728, 222],
  ["4", 728, 277],
  ["6", 700, 327],
];

const SWITCHES: [string, number, number][] = [
  ["С1", 90, 170],
  ["С5", 110, 230],
  ["С7", 250, 170],
  ["С2", 910, 170],
  ["С4", 830, 115],
  ["С6", 890, 230],
  ["С8", 800, 285],
];
