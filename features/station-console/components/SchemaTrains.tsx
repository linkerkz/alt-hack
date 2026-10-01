import type { StationConsoleData } from "../queries";
import { TRACKS } from "../schemaTrains";

type Props = { schema: StationConsoleData["schema"] };

// Поезда на путях и фокус на инциденте: остальная станция под вуалью.
// Фокус включает FocusScope, здесь — только классы приглушения.
export function SchemaTrains({ schema }: Props) {
  const { trains, offNote } = schema;

  return (
    <g>
      <rect
        x={335}
        y={0}
        width={665}
        height={360}
        className="pointer-events-none fill-paper opacity-0 transition-opacity duration-400 group-data-[focus]/console:opacity-72"
      />
      <g className="opacity-0 transition-opacity duration-400 group-data-[focus]/console:opacity-100">
        <rect
          x={2}
          y={36}
          width={328}
          height={276}
          rx={6}
          strokeWidth={1.2}
          strokeDasharray="5 4"
          className="fill-none stroke-accent"
        />
        <text
          x={10}
          y={328}
          fontSize={11}
          letterSpacing="0.06em"
          className="fill-accent-700"
        >
          ЗОНА ИНЦИДЕНТА · НЕЧЁТНАЯ ГОРЛОВИНА
        </text>
      </g>
      {trains.map((train) => {
        const y = trackY(train.track);
        const isPassenger = train.kind === "passenger";
        return (
          <g
            key={train.label}
            className={`transition-opacity duration-400 ${train.quiet ? "group-data-[focus]/console:opacity-30" : ""}`}
          >
            <rect
              x={train.x}
              y={y - 8}
              width={train.width}
              height={16}
              rx={3}
              strokeWidth={train.late ? 2.5 : 1.5}
              className={trainClass(isPassenger, train.late)}
            />
            <text
              x={train.x + train.width / 2}
              y={y + 4}
              fontSize={11}
              textAnchor="middle"
              className={isPassenger ? "fill-ink" : "fill-neutral-100"}
            >
              {train.label}
            </text>
          </g>
        );
      })}
      <text
        x={6}
        y={206}
        fontSize={12}
        fontStyle="italic"
        className="fill-accent-700"
      >
        {offNote}
      </text>
    </g>
  );
}

function trackY(track: number) {
  return TRACKS.find((item) => item.n === track)?.y ?? 0;
}

// Пассажирский — контур, грузовой — заливка; опоздавший — обводка «Критично».
function trainClass(isPassenger: boolean, late: boolean) {
  const fill = isPassenger ? "fill-paper" : "fill-neutral-700";
  if (late) return `${fill} stroke-critical`;
  return `${fill} ${isPassenger ? "stroke-ink" : "stroke-neutral-800"}`;
}
