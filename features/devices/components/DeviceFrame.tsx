import type { ReactNode } from "react";
import { KeepAwake } from "./KeepAwake";
import { LinkStatus } from "./LinkStatus";

type Props = {
  // Код устройства: «PGR-01».
  code: string;
  stationName: string;
  children: ReactNode;
};

// Экран полевого устройства: одна строка статуса как у прошивки, во всю
// высоту с отступами под вырез и полосу жестов, экран не гаснет.
export function DeviceFrame({ code, stationName, children }: Props) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-xl flex-col gap-4 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-[max(env(safe-area-inset-bottom),1.25rem)]">
      <KeepAwake />
      <header className="flex items-center justify-between gap-3 border-device-line border-b pb-2 text-[11px] text-device-dim uppercase tracking-[0.12em]">
        <span className="truncate">
          <span className="font-bold text-device-warn">{code}</span> · ст.{" "}
          {stationName}
        </span>
        <LinkStatus />
      </header>
      {children}
    </main>
  );
}
