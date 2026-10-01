import { DeviceButton } from "@/components/ui/DeviceButton";
import { MODEL_NAME } from "../detector";
import type { useWatch } from "../useWatch";

type Props = {
  camera: ReturnType<typeof useWatch>;
  isLive: boolean;
};

// Нижняя панель камеры: чем смотрит, последний ответ станции в одну строку
// и тестовые кнопки для сцены.
export function CameraPanel({ camera, isLive }: Props) {
  const { sensor, share, reply, sent, sending } = camera;
  const isDiff = sensor === "diff";

  return (
    <footer className="flex shrink-0 items-center gap-3 border-device-line border-t bg-device px-3 pt-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] text-[11px] uppercase">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p
          className={
            sensor === "loading" ? "animate-pulse text-device-warn" : ""
          }
        >
          {sensor === "loading" && "ИИ: загрузка…"}
          {sensor === "ai" && `ИИ · ${MODEL_NAME}`}
          {isDiff && `Резерв · отличие ${Math.round(share * 100)}%`}
        </p>
        <p
          className={`truncate ${sending ? "animate-pulse text-device-warn" : "text-device-dim"}`}
        >
          {sending ? "кадр → станция…" : replyText(reply)}
        </p>
      </div>
      {isDiff && (
        <DeviceButton
          onClick={camera.calibrate}
          disabled={!isLive}
          className="min-h-10 text-[11px]"
        >
          Эталон
        </DeviceButton>
      )}
      <DeviceButton
        onClick={camera.simulate}
        disabled={!isLive || sending}
        className="min-h-10 text-[11px]"
      >
        {sent === "clear" ? "Тест: предмет" : "Тест: чисто"}
      </DeviceButton>
    </footer>
  );
}

function replyText(reply: Props["camera"]["reply"]) {
  if (reply == null) return "станция: сигналов не было";
  const code = reply.incidentCode == null ? "" : ` · ${reply.incidentCode}`;
  return `${reply.at}${code} · ${reply.text}`;
}
