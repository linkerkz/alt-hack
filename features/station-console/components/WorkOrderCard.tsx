import Link from "next/link";
import { Kicker } from "@/components/ui/Kicker";
import { Meter } from "@/components/ui/Meter";
import { TONE_GLYPH, TONE_TEXT_CLASS, type Tone } from "@/components/ui/tone";
import type { LiveWorkOrder, WorkOrderStatus } from "../types";

type Props = { workOrder: LiveWorkOrder };

const STATUS: Record<WorkOrderStatus, { label: string; tone: Tone }> = {
  issued: { label: "Выдан, бригада не взяла", tone: "warning" },
  in_progress: { label: "Взят в работу", tone: "warning" },
  done: { label: "Работы выполнены", tone: "normal" },
  returned: { label: "Объект в эксплуатации", tone: "normal" },
};

// Наряд ремонтной бригаде: ход чеклиста вживую, печатный лист с QR и сам чеклист.
export function WorkOrderCard({ workOrder }: Props) {
  const { id, status, checked, total } = workOrder;
  const { label, tone } = STATUS[status];
  const share = total === 0 ? 0 : (checked / total) * 100;

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Kicker>Наряд ремонтной бригаде</Kicker>
        <span className={`text-[12px] ${TONE_TEXT_CLASS[tone]}`}>
          {TONE_GLYPH[tone]} {label}
        </span>
      </div>
      <p className="text-[13px]">
        {workOrder.title} · чеклист {checked} из {total}
      </p>
      <Meter
        label={`Чеклист: ${checked} из ${total}`}
        parts={[{ value: share, className: "bg-accent" }]}
      />
      <div className="flex gap-4 text-[12.5px]">
        <Link
          prefetch={false}
          href={`/work-orders/${id}/print`}
          target="_blank"
          className="text-accent-700 underline underline-offset-2 hover:text-accent-600"
        >
          Печать наряда с QR
        </Link>
        <Link
          prefetch={false}
          href={`/work-orders/${id}`}
          target="_blank"
          className="text-accent-700 underline underline-offset-2 hover:text-accent-600"
        >
          Чеклист рабочего
        </Link>
      </div>
    </section>
  );
}
