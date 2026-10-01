import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStation } from "@/features/network-map/queries";
import { TakeWorkButton } from "@/features/work-orders/components/TakeWorkButton";
import { WorkChecklist } from "@/features/work-orders/components/WorkChecklist";
import { WorkOrderSummary } from "@/features/work-orders/components/WorkOrderSummary";
import { getWorkOrder } from "@/features/work-orders/queries";
import { isTaken } from "@/features/work-orders/status";

// Чеклист рабочего по QR из наряда. Открывается без входа: proxy пропускает
// этот адрес, доступ даёт id наряда.

export async function generateMetadata({
  params,
}: PageProps<"/work-orders/[id]">): Promise<Metadata> {
  const order = await getWorkOrder((await params).id);
  return { title: order == null ? "Наряд" : `Наряд · ${order.title}` };
}

export default async function WorkOrderPage({
  params,
}: PageProps<"/work-orders/[id]">) {
  const { id } = await params;
  const order = await getWorkOrder(id);
  if (order == null) notFound();
  const station = await getStation(order.stationId);

  return (
    <main className="mx-auto w-full max-w-xl space-y-8 px-4 py-6">
      <WorkOrderSummary
        order={order}
        stationName={station?.name ?? order.stationId}
      />
      {order.status === "issued" && <TakeWorkButton orderId={order.id} />}
      <WorkChecklist
        orderId={order.id}
        items={order.items}
        isOpen={isTaken(order.status)}
      />
    </main>
  );
}
