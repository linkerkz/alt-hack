import type { ReactNode } from "react";
import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { InstallHint } from "./InstallHint";
import { KeepAwake } from "./KeepAwake";

type Props = {
  kicker: string;
  title: string;
  children: ReactNode;
};

// Экран полевого устройства на телефоне: во всю высоту, с отступами под
// вырез и полосу жестов, экран не гаснет.
export function DeviceFrame({ kicker, title, children }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-5 px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      <KeepAwake />
      <header className="space-y-1 border-line border-b pb-3">
        <Kicker tone="accent">{kicker}</Kicker>
        <Heading level={2}>{title}</Heading>
      </header>
      <InstallHint />
      {children}
    </main>
  );
}
