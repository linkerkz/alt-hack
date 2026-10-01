import { Heading } from "@/components/ui/Heading";
import type { StationConsoleData } from "../queries";
import { PLAN_BAR_CLASS } from "../status";

type Props = { plan: StationConsoleData["plan"] };

// План занятости путей: строка на путь, полосы операций, линия текущего времени.
export function TrackPlan({ plan }: Props) {
  const { ticks, rows, nowPercent } = plan;

  return (
    <div className="flex flex-col gap-2 border-line border-t px-5 pt-2.5 pb-24">
      <Heading note="14:00–14:45 · линия — текущее время">
        План занятости путей
      </Heading>
      <div className="grid grid-cols-[72px_minmax(0,1fr)]">
        <span />
        <div className="relative h-4">
          {ticks.map((tick) => (
            <span
              key={tick.label}
              className="absolute -translate-x-1/2 text-[10px] text-neutral-600"
              style={{ left: `${tick.left}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>
      {rows.map((row) => (
        <div
          key={row.track}
          className={`grid min-h-[30px] grid-cols-[72px_minmax(0,1fr)] border-line border-t transition-opacity duration-400 ${row.dimmed ? "opacity-35" : ""}`}
        >
          <div className="flex flex-col justify-center leading-tight">
            <span className="text-[13px]">Путь {row.track}</span>
            <span className="text-[10px] text-neutral-600">{row.note}</span>
          </div>
          <div className="relative">
            {row.bars.map((bar) => (
              <div
                key={`${bar.kind}-${bar.left}-${bar.label}`}
                className={`absolute top-[5px] bottom-[5px] truncate rounded-sm px-[5px] text-[11px] leading-[18px] ${PLAN_BAR_CLASS[bar.kind]}`}
                style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
              >
                {bar.label}
              </div>
            ))}
            <div
              className="absolute inset-y-0 w-0 border-ink border-l-[1.5px]"
              style={{ left: `${nowPercent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
