import { Card } from "@/components/ui/Card";
import { Kicker } from "@/components/ui/Kicker";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import { INDEX_THRESHOLDS } from "@/lib/efficiencyIndex";
import { toStatus } from "../status";
import type { EfficiencyPoint } from "../types";
import { EfficiencyHistoryChart } from "./EfficiencyHistoryChart";

type Props = {
  value: number;
  history: EfficiencyPoint[];
  // Индекс посчитал пульт по плану путей, а не взят из базы станций.
  isLive: boolean;
};

export function EfficiencyPanel({ value, history, isLive }: Props) {
  const status = toStatus(value);

  return (
    <Card className="flex min-w-0 flex-col gap-4 p-6">
      <div className="flex flex-col gap-1">
        <Kicker tone="accent">I · Индекс эффективности</Kicker>
        <p className="text-[13px] text-muted">
          {isLive
            ? "Рассчитан пультом по плану путей"
            : "Значение из базы станций"}
        </p>
      </div>

      <p className="flex items-end gap-3">
        <span
          className={`font-heading font-semibold text-[96px] leading-[0.82] tracking-[-0.03em] ${TONE_TEXT_CLASS[status]}`}
        >
          {value}
        </span>
        <span className="pb-1 font-heading text-[24px] text-muted">/ 100</span>
      </p>

      <IndexScale value={value} />

      <div className="flex flex-col gap-2 border-line border-t pt-3">
        <EfficiencyHistoryChart points={history} />
      </div>
    </Card>
  );
}

// Шкала с зонами состояний и отметкой текущего значения. Ширина зон — те же
// пороги, что определяют статус (lib/efficiencyIndex.ts).
function IndexScale({ value }: { value: number }) {
  const { warning, normal } = INDEX_THRESHOLDS;
  const zones = [
    { from: 0, to: warning, label: "Критично", className: "bg-critical/35" },
    {
      from: warning,
      to: normal,
      label: "Внимание",
      className: "bg-warning/35",
    },
    { from: normal, to: 100, label: "Норма", className: "bg-normal/35" },
  ];

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="img"
        aria-label={`Шкала индекса: ${value} из 100`}
        className="relative h-5"
      >
        <div className="absolute inset-x-0 top-2 flex h-1 gap-0.5">
          {zones.map((zone) => (
            <div
              key={zone.label}
              className={zone.className}
              style={{ flex: zone.to - zone.from }}
            />
          ))}
        </div>
        <span
          className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ink"
          style={{ left: `${value}%` }}
        />
      </div>
      <div className="flex text-[11.5px] text-muted">
        {zones.map((zone) => (
          <span key={zone.label} style={{ flex: zone.to - zone.from }}>
            {zone.from} · {zone.label}
          </span>
        ))}
      </div>
    </div>
  );
}
