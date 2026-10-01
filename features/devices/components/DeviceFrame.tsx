import type { ReactNode } from "react";
import { KeepAwake } from "./KeepAwake";
import { LinkStatus } from "./LinkStatus";

type Props = {
  // Код устройства: «CAM-01».
  code: string;
  stationName: string;
  title: string;
  children: ReactNode;
};

// Версия прошивки в строке статуса.
const FIRMWARE = "FW 0.3";

// Экран полевого устройства: строка статуса как у прошивки, во всю высоту с
// отступами под вырез и полосу жестов, экран не гаснет.
export function DeviceFrame({ code, stationName, title, children }: Props) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-4 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),1.25rem)]">
      <KeepAwake />
      <header className="flex flex-col gap-1 border-device-line border-b pb-2.5">
        <div className="flex items-center justify-between gap-3 text-[11px] text-device-dim uppercase tracking-[0.12em]">
          <span>
            <span className="font-bold text-device-warn">{code}</span> · ст.{" "}
            {stationName} · {FIRMWARE}
          </span>
          <LinkStatus />
        </div>
        <h1 className="font-bold text-[17px] uppercase tracking-[0.04em]">
          {title}
        </h1>
      </header>
      {children}
    </main>
  );
}
