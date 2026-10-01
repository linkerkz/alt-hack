import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { checklistText } from "../dsp";
import { consoleHref } from "../state";
import type { ConsoleState, LiveWorkOrder } from "../types";
import { CommandButton } from "./CommandButton";

type Props = {
  stationId: string;
  state: ConsoleState;
  workOrder: LiveWorkOrder | null;
};

// Подтверждение возврата С3 в эксплуатацию: решает только ДСП,
// отметки «работы выполнены» от службы для этого мало.
// Диалог закроется сам: после возврата шаг сменится.
export function ReturnToServiceDialog({ stationId, state, workOrder }: Props) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/50 p-[18px]">
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="return-title"
        elevation="lg"
        className="flex w-[min(480px,100%)] flex-col gap-3.5 rounded-[7px] bg-surface p-[18px]"
      >
        <h2
          id="return-title"
          className="font-heading font-semibold text-[20px]"
        >
          Вернуть стрелку С3 в эксплуатацию?
        </h2>
        <div className="flex flex-col gap-1.5 text-[14px] text-neutral-800">
          <p>
            Электромеханик сообщил: работы выполнены, {checklistText(workOrder)}
            .
          </p>
          <p>На пульте: контроль положения С3 есть в обоих положениях.</p>
          <p>Маршруты через С3 на пути 3 и 5 снова станут доступны.</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <ButtonLink
            href={consoleHref(state, { confirm: false })}
            scroll={false}
          >
            Отмена
          </ButtonLink>
          <CommandButton
            stationId={stationId}
            command={{ kind: "restore" }}
            variant="primary"
          >
            Вернуть в эксплуатацию
          </CommandButton>
        </div>
      </Card>
    </div>
  );
}
