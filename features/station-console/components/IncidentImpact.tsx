import { Kicker } from "@/components/ui/Kicker";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";
import { STATUS_LABEL } from "../status";

type Props = { impact: StationConsoleData["comparison"]["impact"] };

const KIND = { passenger: "пасс.", freight: "груз." };

// Влияние инцидента на работу станции: поезда, маршруты, ресурсы, индекс.
export function IncidentImpact({ impact }: Props) {
  return (
    <section className="flex flex-col gap-2">
      <Kicker>Влияние</Kicker>
      <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
        <dt className="text-muted">Поезда</dt>
        <dd className="flex flex-col gap-0.5">
          {impact.trains.length === 0 && <span>Не затронуты</span>}
          {impact.trains.map((train) => (
            <span key={train.train}>
              <b className="font-semibold">{train.train}</b> {KIND[train.kind]}{" "}
              · путь {train.track}, прибытие {train.arrival}
              {train.waits && " → ждёт у входного"}
            </span>
          ))}
        </dd>
        <dt className="text-muted">Маршруты</dt>
        <dd>{impact.routes.join(", ")} недоступны</dd>
        <dt className="text-muted">Ресурсы</dt>
        <dd>
          {impact.crews.length === 0
            ? "Без простоя"
            : `Бригады поездов ${impact.crews.join(", ")} в ожидании`}
        </dd>
        <dt className="text-muted">Индекс</dt>
        <dd className={TONE_TEXT_CLASS[impact.status]}>
          {impact.before} → {impact.after} «{STATUS_LABEL[impact.status]}» к{" "}
          {impact.until}, если ничего не менять
        </dd>
      </dl>
    </section>
  );
}
