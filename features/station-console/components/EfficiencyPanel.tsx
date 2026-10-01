import { IndexRing } from "@/components/ui/IndexRing";
import type { Status } from "@/lib/status";
import { STATUS_BADGE_CLASS, STATUS_LABEL, toStatus } from "@/lib/status";

const STATUS_EXPLANATION: Record<Status, string> = {
  normal: "Станция работает в пределах плановых показателей.",
  warning: "Есть отклонения от плана — см. блок «Требует внимания» ниже.",
  critical: "Станция работает в критическом режиме — нужны срочные меры.",
};

export function EfficiencyPanel({ value }: { value: number }) {
  const status = toStatus(value);

  return (
    <section className="flex items-center gap-5 rounded-lg border border-line bg-surface-1 p-5">
      <IndexRing value={value} size={100} />
      <div className="space-y-2">
        <p className="text-[11px] text-muted uppercase tracking-widest">
          Индекс эффективности
        </p>
        <span
          className={`inline-flex rounded border px-2.5 py-1 font-medium text-xs uppercase tracking-wider ${STATUS_BADGE_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
        <p className="max-w-xs text-sm text-zinc-300">
          {STATUS_EXPLANATION[status]}
        </p>
      </div>
    </section>
  );
}
