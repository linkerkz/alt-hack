import { FLOW_LABEL, FLOW_ORDER, flowCounterClass } from "../status";
import type { StationFlow } from "../types";

type Props = {
  flow: StationFlow;
  size?: "sm" | "lg";
};

// Счётчики станции: ↓ прибывают, ↑ отправляются, ⇢ проездом.
export function FlowCounters({ flow, size = "sm" }: Props) {
  if (size === "lg") {
    return (
      <dl className="grid grid-cols-3 gap-2">
        {FLOW_ORDER.map((key) => (
          <div
            key={key}
            className="rounded border border-line bg-surface-0/60 px-3 py-2"
          >
            <dt className="text-[11px] text-muted">{FLOW_LABEL[key].label}</dt>
            <dd
              className={`font-heading font-semibold text-xl tabular-nums ${flowCounterClass(key, flow[key])}`}
            >
              {FLOW_LABEL[key].icon} {flow[key]}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <span className="flex gap-2 text-xs tabular-nums">
      {FLOW_ORDER.map((key) => (
        <span
          key={key}
          title={FLOW_LABEL[key].label}
          className={flowCounterClass(key, flow[key])}
        >
          {FLOW_LABEL[key].icon}
          {flow[key]}
        </span>
      ))}
    </span>
  );
}
