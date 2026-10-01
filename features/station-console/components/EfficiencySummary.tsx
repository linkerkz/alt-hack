import { IndexValue } from "@/components/ui/IndexValue";
import { Kicker } from "@/components/ui/Kicker";
import { Meter } from "@/components/ui/Meter";
import { Metric } from "@/components/ui/Metric";
import { StatusGlyph } from "@/components/ui/StatusGlyph";
import { TONE_BG_CLASS, TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import { STATUS_LABEL } from "../status";

type Props = { efficiency: StationConsoleData["efficiency"] };

// Индекс станции, пять показателей и причина, почему он снизился.
export function EfficiencySummary({ efficiency }: Props) {
  const { index, status, trend, metrics, reason, forecast } = efficiency;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-line border-b px-5 py-3.5">
      <div className="flex flex-col gap-1">
        <Kicker>Индекс станции</Kicker>
        <IndexValue
          value={index}
          tone={status}
          label={STATUS_LABEL[status]}
          caption={trend}
        />
      </div>
      <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-2">
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(104px,1fr))] gap-x-3.5 gap-y-3">
          {metrics.map((metric) => (
            <Metric
              key={metric.label}
              label={metric.label}
              value={
                <>
                  {metric.value}
                  {metric.loss > 0 && (
                    <span className="ml-1.5 font-sans text-[11px] text-critical">
                      −{metric.loss} б.
                    </span>
                  )}
                </>
              }
            >
              <Meter
                label={`${metric.label}: ${Math.round(metric.share)}% от максимума`}
                parts={[
                  {
                    value: metric.share,
                    className: TONE_BG_CLASS[metric.status],
                  },
                ]}
              />
            </Metric>
          ))}
        </dl>
        <p className="flex flex-wrap gap-4 text-[12px]">
          <span className="text-muted">{reason}</span>
          {forecast != null && (
            <span className={TONE_TEXT_CLASS[status]}>
              <StatusGlyph tone={status} /> {forecast}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
