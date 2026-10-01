import { Metric } from "@/components/ui/Metric";
import { FLOW_LABEL, FLOW_ORDER, flowCounterClass } from "../status";
import type { StationFlow } from "../types";

type Props = {
  flow: StationFlow;
  size?: "sm" | "lg";
};

// Счётчики станции: ↓ к нам, ↑ от нас, ⇢ проездом — каждый поезд в одном из них.
export function FlowCounters({ flow, size = "sm" }: Props) {
  if (size === "lg") {
    return (
      <dl className="grid grid-cols-3 gap-3">
        {FLOW_ORDER.map((key) => (
          <Metric
            key={key}
            label={FLOW_LABEL[key].label}
            title={FLOW_LABEL[key].hint}
            value={`${FLOW_LABEL[key].icon} ${flow[key]}`}
            valueClass={flowCounterClass(key, flow[key])}
          />
        ))}
      </dl>
    );
  }

  return (
    <span className="flex gap-2 text-[12px]">
      {FLOW_ORDER.map((key) => (
        <span
          key={key}
          title={`${FLOW_LABEL[key].label}: ${FLOW_LABEL[key].hint}`}
          className={flowCounterClass(key, flow[key])}
        >
          {FLOW_LABEL[key].icon}
          {flow[key]}
        </span>
      ))}
    </span>
  );
}
