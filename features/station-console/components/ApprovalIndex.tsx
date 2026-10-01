import { Kicker } from "@/components/ui/Kicker";
import { Metric } from "@/components/ui/Metric";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { ApprovalRequest } from "../approval";
import { STATUS_LABEL } from "../status";

// Индекс станции: до сбоя, если ничего не менять и с удержанием.
export function ApprovalIndex({ index }: Pick<ApprovalRequest, "index">) {
  return (
    <div className="space-y-2 border-line border-b pb-2">
      <Kicker>Индекс станции</Kicker>
      <dl className="grid grid-cols-3 gap-2">
        {index.map((item) => (
          <Metric
            key={item.label}
            label={item.label}
            value={item.value}
            valueClass={TONE_TEXT_CLASS[item.status]}
          >
            <span className={`text-[11px] ${TONE_TEXT_CLASS[item.status]}`}>
              <StatusGlyph tone={item.status} /> {STATUS_LABEL[item.status]}
            </span>
          </Metric>
        ))}
      </dl>
    </div>
  );
}
