import { notFound } from "next/navigation";
import { CameraScreen } from "@/features/devices/components/CameraScreen";
import { DEVICE_VIEWPORT, deviceMetadata } from "@/features/devices/metadata";
import { deviceCode } from "@/features/devices/paths";
import { getDevice } from "@/features/devices/queries";
import { getStation } from "@/features/network-map/queries";

// Камера горловины: открывается без входа по id устройства, ставится на
// домашний экран и работает как отдельное приложение — во весь экран.

export async function generateMetadata({ params }: PageProps<"/camera/[id]">) {
  return deviceMetadata(await getDevice((await params).id));
}

export const viewport = DEVICE_VIEWPORT;

export default async function CameraPage({
  params,
}: PageProps<"/camera/[id]">) {
  const device = await getDevice((await params).id);
  if (device?.kind !== "camera") notFound();
  const station = await getStation(device.stationId);

  return (
    <CameraScreen
      deviceId={device.id}
      objectId={device.objectId}
      code={deviceCode(device)}
      stationName={station?.name ?? device.stationId}
    />
  );
}
