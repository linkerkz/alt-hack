import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { LiveRefresh } from "@/components/ui/LiveRefresh";
import { CameraScreen } from "@/features/devices/components/CameraScreen";
import { DeviceFrame } from "@/features/devices/components/DeviceFrame";
import { PagerAlert } from "@/features/devices/components/PagerAlert";
import { PagerIdle } from "@/features/devices/components/PagerIdle";
import { PAPER } from "@/features/devices/manifest";
import { getDevice } from "@/features/devices/queries";
import type { Pager } from "@/features/devices/types";
import { getStation } from "@/features/network-map/queries";
import { TakeWorkButton } from "@/features/work-orders/components/TakeWorkButton";
import { WorkChecklist } from "@/features/work-orders/components/WorkChecklist";
import { WorkOrderSummary } from "@/features/work-orders/components/WorkOrderSummary";
import { getActiveWorkOrder } from "@/features/work-orders/queries";
import { isTaken, SERVICE_LABEL } from "@/features/work-orders/status";

// Полевое устройство по QR: камера горловины или пейджер бригады. Открывается
// без входа (доступ даёт uuid) и ставится на домашний экран как приложение.

export async function generateMetadata({
  params,
}: PageProps<"/devices/[id]">): Promise<Metadata> {
  const device = await getDevice((await params).id);
  if (device == null) return { title: "Устройство" };
  return {
    title: device.name,
    manifest: `/devices/${device.id}/manifest.webmanifest`,
    appleWebApp: { capable: true, title: device.name },
    icons: { apple: "/devices/icon/180" },
  };
}

// Под вырез и полосу жестов — во весь экран, цвет панели — бумага.
export const viewport: Viewport = {
  themeColor: PAPER,
  viewportFit: "cover",
};

export default async function DevicePage({
  params,
}: PageProps<"/devices/[id]">) {
  const device = await getDevice((await params).id);
  if (device == null) notFound();
  const station = await getStation(device.stationId);
  const stationName = station?.name ?? device.stationId;

  if (device.kind === "camera") {
    return (
      <DeviceFrame kicker={`Камера · ст. ${stationName}`} title={device.name}>
        <CameraScreen deviceId={device.id} objectId={device.objectId} />
      </DeviceFrame>
    );
  }
  return <PagerScreen pager={device} stationName={stationName} />;
}

type PagerProps = { pager: Pager; stationName: string };

// Пейджер: свежий наряд своей службы, взять в работу и пройти чеклист.
async function PagerScreen({ pager, stationName }: PagerProps) {
  const order = await getActiveWorkOrder(pager.stationId, pager.service);

  return (
    <DeviceFrame
      kicker={`Пейджер · ${SERVICE_LABEL[pager.service]} · ст. ${stationName}`}
      title={pager.name}
    >
      <LiveRefresh />
      <PagerAlert orderId={order?.id ?? null} />
      {order == null ? (
        <PagerIdle />
      ) : (
        <div className="space-y-8">
          <WorkOrderSummary order={order} stationName={stationName} />
          {order.status === "issued" && <TakeWorkButton orderId={order.id} />}
          <WorkChecklist
            orderId={order.id}
            items={order.items}
            isOpen={isTaken(order.status)}
          />
        </div>
      )}
    </DeviceFrame>
  );
}
