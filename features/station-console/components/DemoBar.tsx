import Link from "next/link";
import { STEP } from "../mock";
import type { LiveWorkOrder } from "../types";
import { CommandButton } from "./CommandButton";

type Props = {
  stationId: string;
  step: number;
  stepName: string;
  // Подпись следующего действия; null — сценарий пройден.
  next: string | null;
  workOrder: LiveWorkOrder | null;
};

const BUTTON =
  "cursor-pointer rounded border px-2.5 py-1.5 font-heading font-semibold hover:bg-neutral-100/10";
const PLAIN = `${BUTTON} border-neutral-600 text-neutral-100`;
const ACCENT = `${BUTTON} border-accent-400 text-accent-300`;

// Демо-пульт: играет участников без своего экрана (датчик, ДНЦ, служба), а
// «Далее» делает следующий шаг за того, чья очередь, — всё через базу, как
// настоящие кнопки ДСЦС и ДСП.
export function DemoBar({ stationId, step, stepName, next, workOrder }: Props) {
  const canDetect = step === STEP.normal || step === STEP.closed;

  return (
    <div className="fixed bottom-3.5 left-1/2 z-40 flex max-w-[calc(100vw-28px)] -translate-x-1/2 flex-wrap items-center gap-2.5 whitespace-nowrap rounded-[7px] bg-neutral-900 px-3 py-2 text-[13px] text-neutral-100 shadow-lg">
      <span className="p-1 text-[10px] text-accent-400 uppercase tracking-[0.14em]">
        Демо
      </span>
      <div className="flex min-w-[170px] flex-col leading-tight">
        <span className="text-[10px] text-neutral-400">
          Шаг {step} из {STEP.closed}
        </span>
        <span className="font-heading font-semibold text-[15px]">
          {stepName}
        </span>
      </div>
      {canDetect ? (
        <CommandButton
          stationId={stationId}
          command={{ kind: "detect" }}
          unstyledClassName={ACCENT}
        >
          Датчик: отказ С3
        </CommandButton>
      ) : (
        next != null && (
          <CommandButton
            stationId={stationId}
            command={{ kind: "advance" }}
            unstyledClassName={ACCENT}
          >
            {`${next} →`}
          </CommandButton>
        )
      )}
      {workOrder != null && (
        <Link
          href={`/work-orders/${workOrder.id}`}
          target="_blank"
          className={PLAIN}
        >
          Чеклист ↗
        </Link>
      )}
      <span className="w-px self-stretch bg-neutral-700" />
      <CommandButton
        stationId={stationId}
        command={{ kind: "reset" }}
        unstyledClassName={PLAIN}
      >
        Сброс
      </CommandButton>
    </div>
  );
}
