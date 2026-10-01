import { notFound } from "next/navigation";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { DeviceFrame } from "@/features/devices/components/DeviceFrame";
import { PagerAlert } from "@/features/devices/components/PagerAlert";
import { PagerIdle } from "@/features/devices/components/PagerIdle";
import { DEVICE_VIEWPORT, deviceMetadata } from "@/features/devices/metadata";
import { deviceCode } from "@/features/devices/paths";
import { getDevice } from "@/features/devices/queries";
import { getStation } from "@/features/network-map/queries";
import { PagerOrder } from "@/features/work-orders/components/PagerOrder";
import { getActiveWorkOrder } from "@/features/work-orders/queries";

// Пейджер бригады: свежий наряд своей службы. Открывается без входа по id
// устройства и сам перечитывает наряд раз в 3 с.

export async function generateMetadata({ params }: PageProps<"/pager/[id]">) {
  return deviceMetadata(await getDevice((await params).id));
}

export const viewport = DEVICE_VIEWPORT;

export default async function PagerPage({ params }: PageProps<"/pager/[id]">) {
  const device = await getDevice((await params).id);
  if (device?.kind !== "pager") notFound();
  const [station, order] = await Promise.all([
    getStation(device.stationId),
    getActiveWorkOrder(device.stationId, device.service),
  ]);

  return (
    <DeviceFrame
      code={deviceCode(device)}
      stationName={station?.name ?? device.stationId}
      title={device.name}
    >
      <LiveRefresh />
      <PagerAlert orderId={order?.id ?? null} />
      {order == null ? <PagerIdle /> : <PagerOrder order={order} />}
    </DeviceFrame>
  );
}
