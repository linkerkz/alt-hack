import { Kicker } from "@/components/ui/Kicker";
import type { StationConsoleData } from "../queries";
import type { ConsoleState } from "../types";
import { CollapseLink } from "./CollapseLink";
import { DecisionChain } from "./DecisionChain";
import { DspObjects } from "./DspObjects";
import { DspReports } from "./DspReports";
import { DspTaskCard } from "./DspTaskCard";
import { WorkOrderCard } from "./WorkOrderCard";

type Props = {
  operatorName: string;
  data: StationConsoleData;
  state: ConsoleState;
};

// Панель исполнения ДСП: задачи от ДСЦС и системы, объекты, ход решения, донесения.
export function DspPanel({ operatorName, data, state }: Props) {
  const { tasks, idleText, pendingCount, objects, reports } = data.dsp;
  const { chain } = data;

  return (
    <>
      <div className="flex items-stretch border-line border-b">
        <div className="flex flex-1 flex-col gap-0.5 px-5 py-3">
          <Kicker tone="accent">Панель исполнения</Kicker>
          <h2 className="font-heading font-semibold text-[27px] leading-[1.12]">
            ДСП {operatorName}
          </h2>
          <p className="text-[12.5px] text-muted">
            Задачи от ДСЦС и системы. Маршруты задаются через ОПЦ (симуляция).
          </p>
        </div>
        <CollapseLink state={state} />
      </div>
      <div className="flex flex-1 flex-col gap-5 overflow-auto px-5 pt-4 pb-[120px]">
        <section className="flex flex-col gap-2.5">
          <Kicker>Входящие задачи</Kicker>
          {pendingCount === 0 && (
            <p className="border-line border-y py-3 text-[14px] text-muted">
              {idleText}
            </p>
          )}
          {tasks.map((task) => (
            <DspTaskCard
              key={task.title}
              stationId={data.stationId}
              task={task}
              state={state}
            />
          ))}
        </section>
        <DspObjects objects={objects} />
        {data.workOrder != null && (
          <WorkOrderCard
            workOrder={data.workOrder}
            order={data.incident.detection.workOrder}
          />
        )}
        {chain.length > 0 && <DecisionChain chain={chain} />}
        {reports.length > 0 && <DspReports reports={reports} />}
      </div>
    </>
  );
}
