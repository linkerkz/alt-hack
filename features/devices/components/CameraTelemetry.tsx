import { type Finding, MODEL_NAME } from "../detector";
import type { Sensor } from "../useSensor";

type Props = {
  objectId: string;
  sensor: Sensor;
  alarm: boolean;
  findings: Finding[];
  // Доля отличия от эталона — только в резервном режиме.
  share: number;
  sending: boolean;
};

// Телеметрия камеры: чем смотрит, что видит в зоне и что с передачей.
export function CameraTelemetry(props: Props) {
  const { objectId, sensor, alarm, findings, share, sending } = props;
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px] uppercase">
      <dt className="text-device-dim">Сенсор</dt>
      <dd
        className={sensor === "loading" ? "animate-pulse text-device-warn" : ""}
      >
        {SENSOR_TEXT[sensor]}
      </dd>
      <dt className="text-device-dim">Объект</dt>
      <dd>Стрелка {objectId}</dd>
      <dt className="text-device-dim">Состояние</dt>
      <dd className={alarm ? "text-device-alert" : "text-device-ok"}>
        {alarm ? "■ Предмет в зоне" : "● Свободно"}
      </dd>
      <dt className="text-device-dim">В зоне</dt>
      <dd>
        {sensor === "diff"
          ? `отличие ${Math.round(share * 100)}%`
          : seenText(findings)}
      </dd>
      <dt className="text-device-dim">Передача</dt>
      <dd
        className={
          sending ? "animate-pulse text-device-warn" : "text-device-dim"
        }
      >
        {sending ? "кадр → станция…" : "готов"}
      </dd>
    </dl>
  );
}

const SENSOR_TEXT: Record<Sensor, string> = {
  loading: "Загрузка модели ИИ…",
  ai: `ИИ на устройстве · ${MODEL_NAME}`,
  diff: "Резерв · сравнение с эталоном",
};

function seenText(findings: Finding[]) {
  if (findings.length === 0) return "—";
  return findings
    .map(({ label, person, score }) =>
      person ? `${label} (игнор)` : `${label} ${Math.round(score * 100)}%`,
    )
    .join(", ");
}
