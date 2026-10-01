import { Kicker } from "@/components/ui/Kicker";
import { TONE_TEXT_CLASS } from "@/components/ui/tone";
import type { StationConsoleData } from "../queries";

type Props = { tasks: StationConsoleData["incident"]["tasks"] };

// Задачи участникам по принятому решению и их статус.
export function TaskList({ tasks }: Props) {
  return (
    <section className="flex flex-col gap-1.5">
      <Kicker>Задачи участникам</Kicker>
      <ul>
        {tasks.map((task) => (
          <li
            key={`${task.who}-${task.what}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-2.5 border-line border-t py-[7px] text-[13px]"
          >
            <div className="flex flex-col">
              <span>{task.who}</span>
              <span className="text-[11.5px] text-neutral-600">
                {task.what}
              </span>
            </div>
            <span className={`text-[12px] ${TONE_TEXT_CLASS[task.tone]}`}>
              {task.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
