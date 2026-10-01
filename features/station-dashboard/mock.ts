import type { EfficiencyPoint, StationSnapshot } from "./types";

const HISTORY_HOURS = [8, 9, 10, 11, 12, 13];

// В базе нет таблицы для временного ряда индекса (только текущее значение
// efficiency_index в stations) — график динамики мокаем, выводя траекторию
// детерминированно из реальных полей станции, пока нет истории замеров.
export function buildEfficiencyHistory(
  station: StationSnapshot,
): EfficiencyPoint[] {
  const target = station.efficiencyIndex;
  const spread = Math.min(4 + station.conflictCount * 2, 18);
  const lastIndex = HISTORY_HOURS.length - 1;

  return HISTORY_HOURS.map((hour, index) => {
    const progress = index / lastIndex;
    const zigzag = index % 2 === 0 ? 1 : -1;
    const value = clamp(
      Math.round(target - spread * (1 - progress) + zigzag * 2),
      0,
      100,
    );
    return { time: `${pad(hour)}:00`, value };
  });
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
