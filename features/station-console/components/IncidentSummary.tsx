import { INCIDENT } from "../mock";
import type { StationConsoleData } from "../queries";
import { PROGRESS_CLASS } from "../status";

type Props = { incident: StationConsoleData["incident"] };

// Шапка карточки инцидента: что случилось, где, когда и на каком он этапе.
export function IncidentSummary({ incident }: Props) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between gap-2.5 text-[11px] uppercase tracking-[0.08em]">
          <span className="text-critical">
            ■ Высокая критичность · {incident.code}
          </span>
          <span className="text-muted">{incident.dncBadge}</span>
        </div>
        <h2 className="font-heading font-semibold text-[27px] leading-[1.12]">
          {INCIDENT.title}
        </h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-0.5 text-[13px]">
          {FACTS.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-1 text-justify text-[13px] text-neutral-800">
          {INCIDENT.description}
        </p>
      </div>
      <ol className="grid grid-cols-6 gap-1">
        {incident.statusSteps.map((step) => {
          const style = PROGRESS_CLASS[step.state];
          return (
            <li key={step.label} className="flex flex-col gap-1">
              <span className={`h-[3px] ${style.bar}`} />
              <span
                className={`text-[10.5px] leading-tight [overflow-wrap:anywhere] ${style.text}`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

const FACTS = [
  ["Тип", "Отказ стрелки"],
  ["Объект", "Стрелка С3, нечётная горловина"],
  ["Время", "14:08:12"],
  ["Источник", "Датчик ЭЦ, автоматически"],
];
