import type { Finding } from "../detector";

type Props = { findings: Finding[] };

// Рамки того, что видит ИИ: предмет — красным с уверенностью, человек —
// серым пунктиром «игнор». Доли кадра совпадают с видео: оно без обрезки.
export function FindingBoxes({ findings }: Props) {
  return findings.map(({ label, person, score, box }) => (
    <div
      key={`${label}-${box.x.toFixed(2)}-${box.y.toFixed(2)}`}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
      }}
      className={`absolute border-2 transition-all duration-150 ${person ? "border-device-dim border-dashed" : "border-device-alert"}`}
    >
      <span
        className={`absolute -top-5 left-0 whitespace-nowrap px-1 text-[11px] uppercase ${person ? "bg-device-dim text-device" : "bg-device-alert text-device"}`}
      >
        {person ? `${label} · игнор` : `${label} ${Math.round(score * 100)}%`}
      </span>
    </div>
  ));
}
