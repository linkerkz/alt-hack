import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { canOpenStation, homePath } from "@/features/auth/access";
import { requireUser } from "@/features/auth/queries";
import { getStation } from "@/features/network-map/queries";
import { PrintButton } from "@/features/work-orders/components/PrintButton";
import { WorkOrderSheet } from "@/features/work-orders/components/WorkOrderSheet";
import { getWorkOrder } from "@/features/work-orders/queries";
import { SITE_URL } from "@/lib/site";

// Печатный наряд для сотрудников станции. Заголовок вкладки станет именем PDF.

export async function generateMetadata({
  params,
}: PageProps<"/work-orders/[id]/print">): Promise<Metadata> {
  const order = await getWorkOrder((await params).id);
  return {
    title: order == null ? "Наряд" : `Наряд ${order.objectId} — ${order.title}`,
  };
}

export default async function WorkOrderPrintPage({
  params,
}: PageProps<"/work-orders/[id]/print">) {
  const { id } = await params;
  const [user, order] = await Promise.all([requireUser(), getWorkOrder(id)]);
  if (order == null) notFound();
  const station = await getStation(order.stationId);
  if (station == null) notFound();
  if (!canOpenStation(user, station)) redirect(homePath(user) ?? "/login");

  return (
    <main className="flex flex-col items-center gap-6 py-8 print:py-0">
      <div className="print:hidden">
        <PrintButton />
      </div>
      <WorkOrderSheet
        order={order}
        stationName={station.name}
        checklistUrl={`${SITE_URL}/work-orders/${order.id}`}
      />
    </main>
  );
}
