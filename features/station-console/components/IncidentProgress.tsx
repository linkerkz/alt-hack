import type { StationConsoleData } from "../queries";
import { PROGRESS_CLASS } from "../status";

type Props = { progress: StationConsoleData["incident"]["progress"] };

// Прогресс инцидента: шесть этапов полосами, текущий — акцентом. Подпись
// одна — текущий этап и следующий: шесть подписей в узкой панели не влезают.
export function IncidentProgress({ progress }: Props) {
  const { stages } = progress;
  const currentIndex = stages.findIndex((stage) => stage.state === "current");
  const next = stages
    .slice(currentIndex + 1)
    .find((stage) => stage.state === "todo");

  return (
    <div className="flex flex-col gap-1.5">
      <ol className="grid grid-cols-6 gap-1" aria-label="Этапы инцидента">
        {stages.map((stage) => (
          <li
            key={stage.label}
            title={stage.label}
            aria-label={stage.label}
            aria-current={stage.state === "current" ? "step" : undefined}
            className={`h-1.5 rounded-full ${PROGRESS_CLASS[stage.state].bar}`}
          />
        ))}
      </ol>
      <p className="flex flex-wrap justify-between gap-x-3 text-[12px]">
        {currentIndex === -1 ? (
          <span className="text-muted">● Все этапы пройдены</span>
        ) : (
          <span className="text-accent-700">
            ▲ Этап {currentIndex + 1} из {stages.length}:{" "}
            {stages[currentIndex].label}
          </span>
        )}
        {next != null && (
          <span className="text-muted">далее — {next.label.toLowerCase()}</span>
        )}
      </p>
    </div>
  );
}
