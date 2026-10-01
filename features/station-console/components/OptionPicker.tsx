import Link from "next/link";
import type { StationConsoleData } from "../queries";
import { consoleHref } from "../state";
import type { ChosenOption, ConsoleState } from "../types";

type Props = {
  selected: StationConsoleData["comparison"]["selected"];
  state: ConsoleState;
};

const OPTIONS: { id: ChosenOption; name: string; caption: string }[] = [
  { id: "A", name: "Вариант А", caption: "без ДНЦ" },
  { id: "B", name: "Вариант Б", caption: "★ рекомендован" },
];

// Выбор варианта в ходе ДСЦС: переключатель А / Б и что меняет выбранный.
// Переключение — только вид (URL); в базу уходит кнопка «Принять».
export function OptionPicker({ selected, state }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-1.5">
        {OPTIONS.map((option) => {
          const isSelected = option.id === state.option;
          return (
            <Link
              key={option.id}
              prefetch={false}
              href={consoleHref(state, { option: option.id })}
              scroll={false}
              aria-current={isSelected ? "true" : undefined}
              className={`flex flex-col rounded border px-3 py-2 ${isSelected ? "border-accent bg-accent-100" : "border-line hover:border-accent"}`}
            >
              <span className="font-heading font-semibold text-[16px]">
                {option.name}
              </span>
              <span className="text-[11px] text-accent-700">
                {option.caption}
              </span>
            </Link>
          );
        })}
      </div>
      <dl className="grid grid-cols-[44px_1fr] gap-x-2.5 gap-y-1 text-[13px]">
        {selected.changes.map((change) => (
          <div key={change.train} className="contents">
            <dt className="font-semibold">{change.train}</dt>
            <dd>{change.text}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[12px] text-muted">
        Индекс {selected.index} · макс. задержка {selected.maxDelay} мин ·
        согласование ДНЦ: {selected.dncApproval}
      </p>
    </div>
  );
}
