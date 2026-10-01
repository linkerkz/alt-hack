import { notFound } from "next/navigation";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { DeviceFrame } from "@/features/devices/components/DeviceFrame";
import { PagerAlert } from "@/features/devices/components/PagerAlert";
import { PagerHistory } from "@/features/devices/components/PagerHistory";
import { PagerIdle } from "@/features/devices/components/PagerIdle";
import { PagerMessageCard } from "@/features/devices/components/PagerMessageCard";
import { DEVICE_VIEWPORT, deviceMetadata } from "@/features/devices/metadata";
import { deviceCode } from "@/features/devices/paths";
import { getDevice, getPagerMessages } from "@/features/devices/queries";
import { getStation } from "@/features/network-map/queries";
import { simClock } from "@/lib/clock";

// Пейджер станционной бригады: вызовы к стрелке и задачи ДСП. Открывается
// без входа по id устройства и сам перечитывает сообщения раз в 3 с.

export async function generateMetadata({ params }: PageProps<"/pager/[id]">) {
  return deviceMetadata(await getDevice((await params).id));
}

export const viewport = DEVICE_VIEWPORT;

export default async function PagerPage({ params }: PageProps<"/pager/[id]">) {
  const device = await getDevice((await params).id);
  if (device?.kind !== "pager") notFound();
  const [station, messages] = await Promise.all([
    getStation(device.stationId),
    getPagerMessages(device.stationId),
  ]);
  const open = messages.filter(
    (message) => message.status === "sent" || message.status === "accepted",
  );
  const closed = messages.filter((message) => !open.includes(message));
  // Сигналит только свежее сообщение, на которое ещё не ответили.
  const [newest] = messages;
  const signal = newest?.status === "sent" ? newest : null;

  return (
    <DeviceFrame
      code={deviceCode(device)}
      stationName={station?.name ?? device.stationId}
      title={device.name}
    >
      <LiveRefresh />
      <PagerAlert message={signal} />
      {open.length === 0 ? (
        <PagerIdle />
      ) : (
        open.map((message) => (
          <PagerMessageCard
            key={message.id}
            deviceId={device.id}
            message={message}
            time={simClock(message.createdAt)}
          />
        ))
      )}
      {closed.length > 0 && <PagerHistory messages={closed} />}
    </DeviceFrame>
  );
}
