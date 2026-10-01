import { Heading } from "@/components/ui/Heading";
import { Kicker } from "@/components/ui/Kicker";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatTime, SERVICE_LABEL, STATUS_BADGE } from "../status";
import type { WorkOrder } from "../types";

type Props = {
  order: WorkOrder;
  stationName: string;
};

// Шапка наряда на телефоне рабочего: кто, где, что случилось и чем кончилось.
export function WorkOrderSummary({ order, stationName }: Props) {
  const badge = STATUS_BADGE[order.status];
  return (
    <header className="space-y-3">
      <Kicker tone="accent">
        Наряд · {SERVICE_LABEL[order.service]} · ст. {stationName}
      </Kicker>
      <Heading level={1}>{order.title}</Heading>
      <StatusBadge tone={badge.tone} label={badge.label} />
      <p className="text-[14px] text-muted">{order.description}</p>
      {order.window != null && (
        <p className="text-[14px]">
          <span className="text-muted">Окно работ:</span> {order.window}
        </p>
      )}
      {order.safety.length > 0 && (
        <ul className="list-disc space-y-0.5 pl-5 text-[14px]">
          {order.safety.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      )}
      {order.doneAt != null && (
        <p className="border-normal border-l-2 pl-3 text-[14px]">
          Работы выполнены в {formatTime(order.doneAt)}.{" "}
          {order.resultNote ?? ""}
          {order.status === "done" && " Объект вернёт в эксплуатацию ДСП."}
        </p>
      )}
    </header>
  );
}
