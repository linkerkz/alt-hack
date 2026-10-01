import { LinkStatus } from "./LinkStatus";

type Props = {
  code: string;
  stationName: string;
  objectId: string;
  alarm: boolean;
};

// Подписи поверх кадра, как у камеры наблюдения: кто снимает — слева
// сверху, связь и время — справа, состояние зоны — крупно снизу.
export function CameraOverlay({ code, stationName, objectId, alarm }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 pt-[max(env(safe-area-inset-top),0.75rem)] text-[11px] uppercase tracking-[0.1em] [text-shadow:0_1px_2px_#000]">
      <div className="flex items-start justify-between gap-3">
        <p className="flex flex-col">
          <span className="font-bold text-device-warn">{code}</span>
          <span>
            ст. {stationName} · {objectId}
          </span>
        </p>
        <div className="flex flex-col items-end gap-0.5">
          <LinkStatus />
          <span className="flex items-center gap-1.5 text-device-alert">
            <span className="size-2 animate-pulse rounded-full bg-device-alert" />
            REC
          </span>
        </div>
      </div>
      <p
        className={`self-start bg-black/60 px-2 py-1 font-bold text-[15px] ${alarm ? "text-device-alert" : "text-device-ok"}`}
      >
        {alarm ? "■ Предмет в зоне" : "● Свободно"}
      </p>
    </div>
  );
}
