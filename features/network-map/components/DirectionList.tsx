import { HORIZON_MINUTES } from "../flows";
import type { Direction } from "../types";

// Направления станции: сколько поездов прибудет к ней от каждого соседа
// и от неё к соседу — те же числа, что на стрелках участков.
export function DirectionList({ directions }: { directions: Direction[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-[11px] text-muted uppercase tracking-widest">
        Направления · прибудут за {HORIZON_MINUTES / 60} ч
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-muted">
            <th className="pb-1 text-left font-normal">Соседняя станция</th>
            <th className="pb-1 text-right font-normal">к нам</th>
            <th className="pb-1 text-right font-normal">от нас</th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {directions.map((direction) => (
            <tr key={direction.neighborId} className="border-line border-t">
              <td className="py-1.5 font-sans text-zinc-200">
                {direction.neighborName}
              </td>
              <td className="py-1.5 text-right">
                <Count value={direction.toUs} />
              </td>
              <td className="py-1.5 text-right">
                <Count value={direction.fromUs} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className={value === 0 ? "text-zinc-600" : "text-sky-300"}>
      {value}
    </span>
  );
}
