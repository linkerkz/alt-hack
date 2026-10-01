import type { CameraState } from "../types";

type Props = {
  // Куда идёт смена: из «свободно» — к предмету, и наоборот.
  from: CameraState;
  seconds: number;
};

// Отсчёт посреди кадра: видно, как ИИ принимает решение, а не просто верим.
export function CountdownBadge({ from, seconds }: Props) {
  const toAlarm = from === "clear";
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <span
        className={`border-2 bg-device/80 px-3 py-1 font-bold text-[15px] uppercase tracking-[0.1em] ${toAlarm ? "border-device-alert text-device-alert" : "border-device-ok text-device-ok"}`}
      >
        {toAlarm ? "Подтверждение" : "Свободно через"} {seconds}
      </span>
    </div>
  );
}
