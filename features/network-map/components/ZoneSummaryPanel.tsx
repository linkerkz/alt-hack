import { Heading } from "@/components/ui/Heading";
import { IndexValue } from "@/components/ui/IndexValue";
import { Kicker } from "@/components/ui/Kicker";
import { Meter } from "@/components/ui/Meter";
import { Metric } from "@/components/ui/Metric";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_BG_CLASS, TONE_TEXT_CLASS } from "@/components/ui/tone";
import { STATUS_LABEL, STATUS_ORDER, toStatus } from "../status";
import type { ZoneSummary } from "../types";

type Props = {
  title: string;
  summary: ZoneSummary;
};

export function ZoneSummaryPanel({ title, summary }: Props) {
  const status = toStatus(summary.avgEfficiencyIndex);

  return (
    <section className="space-y-4 border-line border-b p-4">
      <div className="space-y-0.5">
        <Kicker>Зона ответственности</Kicker>
        <Heading level={1}>{title}</Heading>
      </div>

      <IndexValue
        value={summary.avgEfficiencyIndex}
        tone={status}
        label={STATUS_LABEL[status]}
        caption="средний индекс эффективности зоны"
      />

      {summary.stationCount > 1 && <StatusBreakdown summary={summary} />}

      <dl className="grid grid-cols-3 gap-3 border-line border-t pt-3">
        <Metric label="Поездов в зоне" value={summary.trainsWithinCount} />
        <Metric label="Идут к станциям" value={summary.arrivingCount} />
        <Metric
          label="Сбоев"
          value={summary.incidentCount}
          valueClass={summary.incidentCount > 0 ? "text-critical" : "text-ink"}
        />
      </dl>
    </section>
  );
}

function StatusBreakdown({ summary }: { summary: ZoneSummary }) {
  const { stationCount, stationCountByStatus } = summary;
  const parts = STATUS_ORDER.map((status) => ({
    value: (stationCountByStatus[status] / stationCount) * 100,
    className: TONE_BG_CLASS[status],
  }));

  return (
    <div className="space-y-2">
      <Meter parts={parts} label="Станции зоны по состояниям" />
      <ul className="flex justify-between text-[12px]">
        {STATUS_ORDER.map((status) => (
          <li key={status} className="flex items-baseline gap-1.5">
            <StatusGlyph tone={status} />
            <span className="text-muted">{STATUS_LABEL[status]}</span>
            <span
              className={`font-heading text-[17px] ${TONE_TEXT_CLASS[status]}`}
            >
              {stationCountByStatus[status]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
