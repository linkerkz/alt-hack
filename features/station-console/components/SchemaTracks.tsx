import type { StationConsoleData } from "../queries";
import { TRACKS } from "../schema";

type Props = { schema: StationConsoleData["schema"] };

// Состояние схемы: занятость путей, закрытые съезды через С3, входной Н,
// предпросмотр варианта или заданный маршрут.
export function SchemaTracks({ schema }: Props) {
  const { occupied, fault, overlay } = schema;
  const linkClass = fault ? "stroke-critical" : "stroke-neutral-500";

  return (
    <g>
      {TRACKS.map((track) => {
        const isBusy = occupied.includes(track.n);
        return (
          <path
            key={track.n}
            d={`M${track.from} ${track.y} H${track.to}`}
            strokeWidth={isBusy ? 6 : 3.5}
            className={`fill-none ${isBusy ? "stroke-ink" : "stroke-neutral-500"}`}
          />
        );
      })}
      {C3_LINKS.map((d) => (
        <path
          key={d}
          d={d}
          strokeWidth={4}
          strokeDasharray={fault ? "7 5" : undefined}
          className={`fill-none ${linkClass}`}
        />
      ))}
      {overlay?.paths.map((d) => (
        <path
          key={d}
          d={d}
          strokeWidth={overlay.dashed ? 7 : 5}
          strokeDasharray={overlay.dashed ? "10 7" : undefined}
          strokeLinecap="round"
          className="fill-none stroke-accent opacity-85"
        />
      ))}
      {overlay != null && (
        <text
          x={overlay.labelX}
          y={overlay.labelY}
          fontSize={12}
          fontStyle="italic"
          className="fill-accent-700"
        >
          {overlay.label}
        </text>
      )}
    </g>
  );
}

// Съезды нечётной горловины через стрелку С3: путь 1 → 3 и 3 → 5.
const C3_LINKS = ["M90 170 L145 115", "M170 115 L225 60"];
