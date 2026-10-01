import type { StationConsoleData } from "../queries";
import { PROGRESS_CLASS } from "../status";

type Props = { progress: StationConsoleData["incident"]["progress"] };

// Прогресс инцидента: шесть этапов полосами, текущий — акцентом.
export function IncidentProgress({ progress }: Props) {
  return (
    <ol className="grid grid-cols-6 gap-1" aria-label="Этапы инцидента">
      {progress.stages.map((stage) => {
        const style = PROGRESS_CLASS[stage.state];
        return (
          <li
            key={stage.label}
            aria-current={stage.state === "current" ? "step" : undefined}
            className="flex min-w-0 flex-col gap-1"
          >
            <span className={`h-1 rounded-full ${style.bar}`} />
            <span
              className={`text-[10.5px] leading-tight [overflow-wrap:anywhere] ${style.text}`}
            >
              {style.mark} {stage.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
